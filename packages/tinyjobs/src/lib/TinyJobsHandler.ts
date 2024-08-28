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

class TinyJobs<T> {
  private queue: Queue;
  private worker: Worker;
  private jobs = new Map<string, new () => TinyJob>();

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
    const JobClass = this.jobs.get(job.name);
    if (!JobClass)
      throw new Error(`No handler registered for job type: ${job.name}`);

    if (JobClass.prototype instanceof TinyJob) {
      const jobInstance = new (JobClass as any)();
      await jobInstance.handle(job.data);
    } else {
      throw new Error("Invalid job type.");
    }
  }

  public async queueJob<K extends keyof T>(
    jobName: K,
    data: T[K],
    options?: JobsOptions
  ) {
    return this.queue.add(jobName as string, data, options ? options : {});
  }

  public registerJob(job: new () => TinyJob) {
    this.jobs.set(job.name, job);
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
        this.registerJob(job);
      } else {
        throw new Error(`Invalid job type: ${typeof job}`);
      }
    }
  }
}

export default TinyJobs;
