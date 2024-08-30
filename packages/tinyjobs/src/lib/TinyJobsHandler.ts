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
  concurrency?: number;
};

type JobsMap = Map<
  string,
  {
    implementation: TinyJob;
    cron?: string;
    delay?: number;
  }
>;

class TinyJobs<T> {
  private queue: Queue;
  public jobs: JobsMap = new Map();
  private worker: Worker;

  private options = {
    removeOnComplete: false,
    removeOnFailure: false,
  };

  private readonly removeOnComplete = true;
  private readonly removeOnFailure = true;

  /**
   * Creates an instance of TinyJobs.
   * @param {ConnectionOptions} [connection] The connection options for the queue.
   * @param {JobsOptions} [queueOptions] The options for the queue.
   * @param {string} [queueName] The name of the queue.
   * @param {number} [concurrency] The number of jobs to process concurrently.
   * @memberof TinyJobs
   */
  constructor(tinyJobsParams?: TinyJobsConstructorTypes) {
    const {
      connection,
      queueOptions,
      queueName = `tjq-${generateRandomUid()}`,
      concurrency,
    } = tinyJobsParams ?? {};

    this.queue = new Queue(queueName, {
      connection: connection ?? {},
      ...queueOptions,
    });

    this.worker = new Worker(queueName, this.processQueue.bind(this), {
      connection: connection ?? {},
      concurrency: concurrency ?? 1,
    });

    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
  }

  private async processQueue(job: BullJob) {
    const jobClass = this.jobs.get(job.name)?.implementation;
    if (!jobClass)
      throw new Error(`No handler registered for job type: ${job.name}`);

    if (jobClass instanceof TinyJob) {
      await Promise.resolve(jobClass.run(job.data));
    } else {
      throw new Error("Invalid job type.");
    }
  }

  public async registerJob(job: new () => TinyJob) {
    if (this.jobs.has(job.name))
      throw new Error(`Job with name ${job.name} already registered.`);

    const implementation = new job();
    const { name, cron, delay } = implementation;

    this.jobs.set(name, {
      implementation: implementation,
      cron,
      delay,
    });

    // Queue the job if it has a cron pattern so user doesn't have to do it manually
    if (implementation.cron) {
      await this.queue.add(implementation.name, undefined, {
        repeat: {
          pattern: implementation.cron,
        },
        removeOnComplete: this.removeOnComplete,
        removeOnFail: this.removeOnFailure,
        delay: implementation.delay,
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
    const { cron, delay } = job ?? {};

    return this.queue.add(jobName as string, data, {
      repeat: cron
        ? {
            pattern: cron,
          }
        : undefined,
      delay: delay ?? undefined,
      removeOnComplete: this.removeOnComplete,
      removeOnFail: this.removeOnFailure,
      ...options,
    });
  }

  private async gracefulShutdown(signal: NodeJS.Signals) {
    await this.worker.close();
    process.exit(signal === "SIGTERM" ? 0 : 1);
  }
}

export default TinyJobs;
