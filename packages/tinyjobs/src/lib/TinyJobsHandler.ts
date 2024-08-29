import { Queue, Worker, Job as BullJob } from "bullmq";
import type { JobsOptions, ConnectionOptions } from "bullmq";
import path from "path";

import TinyJob from "../structures/Job";
import { generateRandomUid } from "../utils/utils";
import { getConfig } from "../utils/config";
import { loadJobsFromDir } from "../utils/jobs";

type TinyJobsConstructorTypes = {
  connection?: ConnectionOptions;
  queueOptions?: JobsOptions;
  queueName?: string;
};

type JobsMap = Map<
  string,
  {
    implementation: new () => TinyJob;
    cron?: string;
  }
>;

class TinyJobs<T> {
  private queue: Queue;
  private worker: Worker;
  private jobs: JobsMap = new Map();

  constructor(tinyJobsParams?: TinyJobsConstructorTypes) {
    const {
      connection,
      queueOptions,
      queueName = `tjq-${generateRandomUid()}`,
    } = tinyJobsParams ?? {};

    this.queue = new Queue(queueName, {
      connection: connection ?? {},
    });

    this.worker = new Worker(queueName, this.processQueue.bind(this), {
      connection: connection ?? {},
    });
  }

  private async processQueue(job: BullJob) {
    const jobClass = this.jobs.get(job.name)?.implementation;
    if (!jobClass)
      throw new Error(`No handler registered for job type: ${job.name}`);

    if (jobClass.prototype instanceof TinyJob) {
      const jobInstance = new jobClass();
      await Promise.resolve(jobInstance.run(job.data));
    } else {
      throw new Error("Invalid job type.");
    }
  }

  public async registerJob(job: new () => TinyJob) {
    if (this.jobs.has(job.name)) {
      throw new Error(`Job with name ${job.name} already registered.`);
    }
    const implementation = new job();
    this.jobs.set(job.name, {
      implementation: job,
      cron: implementation.cron,
    });

    if (implementation.cron) {
      await this.queue.add(implementation.name, undefined, {
        repeat: {
          pattern: implementation.cron,
        },
      });
    }
  }

  public async loadJobs(dir?: string) {
    const config = await getConfig();
    const jobsDir = path.resolve(
      process.cwd(),
      dir ?? (config?.jobsDir as string)
    );

    if (!jobsDir)
      throw new Error(
        "Jobs directory not configured. Please run 'tinyjobs init'."
      );

    const jobs = await loadJobsFromDir(jobsDir);
    for (const job of jobs) {
      if (typeof job === "function") {
        await this.registerJob(job);
      } else {
        throw new Error(`Invalid job type: ${typeof job}`);
      }
    }
  }

  public async queueJob<K extends keyof T>(
    jobName: K,
    data?: T[K],
    options?: JobsOptions
  ) {
    const job = this.jobs.get(jobName as string);
    const cron = job?.cron;

    return this.queue.add(jobName as string, data, {
      repeat: cron
        ? {
            pattern: cron,
          }
        : undefined,
      ...options,
    });
  }
}

export default TinyJobs;
