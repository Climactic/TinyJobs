import { Queue, Worker, Job as BullJob } from "bullmq";
import type { JobsOptions, ConnectionOptions } from "bullmq";
import * as IORedis from "ioredis";
import path from "path";

import TinyJob from "../structures/Job";
import TinyJobEventsHandler from "./TinyJobsEventsHandler";

import { generateRandomUid } from "../utils/utils";
import { getConfig } from "../utils/config";
import { loadJobsFromDir } from "../utils/jobs";

type TinyJobsConstructorTypes = {
  bullConnection?: ConnectionOptions;
  redisConnection?: IORedis.RedisOptions;
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
  // private worker: Worker;
  private redis: IORedis.Redis;
  private workers: Map<string, Worker> = new Map();

  private options: {
    removeOnComplete: boolean;
    removeOnFailure: boolean;
    concurrency: number;
    connection?: ConnectionOptions;
  } = {
    removeOnComplete: false,
    removeOnFailure: false,
    concurrency: 1,
    connection: {},
  };

  public jobs: JobsMap = new Map();
  public events: TinyJobEventsHandler;

  constructor(tinyJobsParams?: TinyJobsConstructorTypes) {
    const {
      bullConnection,
      redisConnection,
      queueOptions,
      queueName = `tjq-${generateRandomUid()}`,
      concurrency,
    } = tinyJobsParams ?? {};

    this.options = {
      ...this.options,
      connection: bullConnection,
      concurrency: concurrency ?? 1,
    };

    this.queue = new Queue(queueName, {
      connection: bullConnection ?? {},
      ...queueOptions,
    });

    this.redis = new IORedis.Redis(redisConnection ?? {});
    this.events = new TinyJobEventsHandler({ queueName, redis: this.redis });

    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
  }

  private async processQueue(job: BullJob) {
    const jobClass = this.jobs.get(job.name)?.implementation;
    if (!jobClass)
      throw new Error(`No handler registered for job type: ${job.name}`);

    if (jobClass instanceof TinyJob)
      await Promise.resolve(jobClass.run(job.data));
    else throw new Error("Invalid job type.");
  }

  public async registerJob(job: new () => TinyJob, path?: string) {
    if (this.jobs.has(job.name))
      throw new Error(`Job with name ${job.name} already registered.`);

    const implementation = new job();
    const { name, cron, delay, conccurency } = implementation;

    const jobWorker = new Worker(
      this.queue.name,
      this.processQueue.bind(this),
      {
        concurrency: conccurency ?? this.options.concurrency,
        connection: this.options.connection ?? {},
      }
    );

    this.workers.set(name, jobWorker);

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
        removeOnComplete: this.options.removeOnComplete,
        removeOnFail: this.options.removeOnFailure,
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
    for (const [jobName, job] of jobs) {
      if (typeof job === "function") {
        await this.registerJob(job, jobName);
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

    const queuedJob = await this.queue.add(jobName as string, data, {
      repeat: cron
        ? {
            pattern: cron,
          }
        : undefined,
      delay: delay ?? undefined,
      removeOnComplete: this.options.removeOnComplete,
      removeOnFail: this.options.removeOnFailure,
      ...options,
    });

    // Add job ID to the Redis hash for the job name
    await this.redis.hset(
      `tinyjobs:tje:job:${jobName as string}`,
      queuedJob.id as string,
      jobName as string
    );

    return queuedJob;
  }

  private async gracefulShutdown(signal: NodeJS.Signals) {
    for (const worker of this.workers.values()) await worker.close();

    // await this.worker.close();
    await this.redis.quit();

    process.exit(signal === "SIGTERM" ? 0 : 1);
  }
}

export default TinyJobs;
