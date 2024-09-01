import { Queue, Worker, Job as BullJob } from "bullmq";
import type { JobsOptions, ConnectionOptions } from "bullmq";
import * as IORedis from "ioredis";
import path from "path";

import TinyJob from "../structures/Job";
import TinyJobEventsHandler from "./TinyJobsEventsHandler";

import { generateRandomUid, getJobNameRedisKey } from "../utils/utils";
import { getConfig } from "../utils/config";
import { loadJobsFromDir } from "../utils/jobs";
import { TinyJobEvents } from "../types";

/**
 * TinyJobsConstructorTypes
 *
 * The constructor types for TinyJobs
 *
 * @export
 * @interface TinyJobsConstructorTypes
 * @property {ConnectionOptions} [bullConnection] - The connection options for BullMQ
 * @property {IORedis.RedisOptions} [redisConnection] - The connection options for Redis
 * @property {JobsOptions} [queueOptions] - The options for the queue
 * @property {string} [queueName] - The name of the queue
 * @property {number} [concurrency] - The concurrency for the queue
 * @property {string} [jobsDirectory] - The directory to load jobs from
 */
type TinyJobsConstructorTypes = {
  bullConnection?: ConnectionOptions;
  redisConnection?: IORedis.RedisOptions;
  queueOptions?: JobsOptions;
  queueName?: string;
  concurrency?: number;
  jobsDirectory?: string;
  removeOnComplete?: boolean;
  removeOnFailure?: boolean;
};

type JobsMap = Map<
  string,
  {
    implementation: TinyJob;
    cron?: string;
    delay?: number;
  }
>;

/**
 * TinyJobs
 *
 * The main class for TinyJobs
 *
 * @export
 * @class TinyJobs
 * @template T - Types for the jobs generated using 'tinyjobs generate types' command
 *
 * @example
 * ```ts
 * import TinyJobs from "tinyjobs";
 *
 * const tinyJobs = new TinyJobs({
 *  queueName: "tinyjobs-example",
 *  concurrency: 5, // Global concurrency for this queue
 * });
 *
 * await tinyJobs.loadJobs(); // Load all jobs from the jobs directory initiated using 'tinyjobs init'
 *
 * tinyJobs.queueJob("exampleJob", { name: "exampleJob" });
 *
 * tinyJobs.events.on(TinyJobEvents.JOB_COMPLETE, (job) => {
 *   console.log(job);
 * });
 * ```
 */
class TinyJobs<T> {
  private queue: Queue;
  private redis: IORedis.Redis;
  private workers: Map<string, Worker> = new Map();
  private jobs: JobsMap = new Map();

  private options: {
    removeOnComplete: boolean;
    removeOnFailure: boolean;
    concurrency: number;
    connection?: ConnectionOptions;
    jobsDirectory?: string;
  } = {
    removeOnComplete: false,
    removeOnFailure: false,
    concurrency: 1,
    connection: {},
    jobsDirectory: undefined,
  };

  public events: TinyJobEventsHandler;

  /**
   * Creates an instance of TinyJobs.
   * @param {TinyJobsConstructorTypes} [tinyJobsParams] - The options for the TinyJobs instance.
   * @memberof TinyJobs
   */
  constructor(tinyJobsParams?: TinyJobsConstructorTypes) {
    const {
      bullConnection,
      redisConnection,
      queueOptions,
      queueName = `tjq-${generateRandomUid()}`,
      concurrency,
      jobsDirectory,
      removeOnComplete,
      removeOnFailure,
    } = tinyJobsParams ?? {};

    this.options = {
      ...this.options,
      connection: bullConnection,
      concurrency: concurrency ?? 1,
      jobsDirectory,
      removeOnComplete: removeOnComplete ?? false,
      removeOnFailure: removeOnFailure ?? false,
    };

    this.queue = new Queue(queueName, {
      connection: bullConnection ?? {},
      ...queueOptions,
    });

    // Initiate the events handler
    this.redis = new IORedis.Redis(redisConnection ?? {});
    this.events = new TinyJobEventsHandler({ queueName, redis: this.redis });

    // Cleanup of jobNames so redis doesn't get filled up with expired data
    this.handleCleanup();

    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
  }

  private async gracefulShutdown(signal: NodeJS.Signals) {
    for (const worker of this.workers.values()) await worker.close();

    await this.redis.quit();
    process.exit(signal === "SIGTERM" ? 0 : 1);
  }

  private handleCleanup() {
    this.events.on(TinyJobEvents.JOB_COMPLETE, async ({ jobId }) => {
      const jobName = await this.events.getJobNameById(jobId);
      if (!jobName) return;

      if (this.options.removeOnComplete)
        await this.redis.hdel(getJobNameRedisKey(jobName), jobId);
    });

    this.events.on(TinyJobEvents.JOB_FAILED, async ({ jobId }) => {
      const jobName = await this.events.getJobNameById(jobId);
      if (!jobName) return;

      if (this.options.removeOnFailure)
        await this.redis.hdel(getJobNameRedisKey(jobName), jobId);
    });
  }

  private processQueue(job: BullJob) {
    const jobClass = this.jobs.get(job.name)?.implementation;
    if (!jobClass)
      throw new Error(`No handler registered for job type: ${job.name}`);

    if (jobClass instanceof TinyJob)
      return Promise.resolve(jobClass.run(job.data));
    else throw new Error("Invalid job type.");
  }

  /**
   * registerJob
   * Register a job with TinyJobs
   *
   * @param job The job class to register
   * @returns The job id
   *
   * @example
   * ```ts
   * tinyJobs.registerJob(ExampleJob);
   * ```
   *
   * @throws Error if the job is already registered
   * @throws Error if the job is not an instance of Job
   * @throws Error if the job name is not unique
   */
  public async registerJob(job: new () => TinyJob) {
    const implementation = new job();
    const { name, cron, delay, conccurency } = implementation;

    if (this.jobs.has(name))
      throw new Error(`Job with name ${name} already registered.`);

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
      const queuedCron = await this.queue.add(implementation.name, undefined, {
        repeat: {
          pattern: implementation.cron,
        },
        removeOnComplete: this.options.removeOnComplete,
        removeOnFail: this.options.removeOnFailure,
        delay: implementation.delay,
      });

      await this.redis.hsetnx(
        getJobNameRedisKey(implementation.name as string),
        queuedCron.id as string,
        implementation.name as string
      );
    }
  }

  /**
   * loadJobs
   * Load jobs from a directory
   *
   * @returns The loaded jobs
   *
   * @example
   * ```ts
   * tinyJobs.loadJobs();
   * ```
   *
   * @throws Error if the jobs directory is not configured via 'tinyjobs init' or the TinyJobHandler constructor
   * @throws Error if the job name is not unique
   * @throws Error if the job is not an instance of Job
   */
  public async loadJobs() {
    const config = await getConfig();
    const jobsDir = path.resolve(
      process.cwd(),
      this.options.jobsDirectory ?? (config?.jobsDir as string)
    );

    if (!jobsDir)
      throw new Error(
        "Jobs directory not configured. Please run 'tinyjobs init'."
      );

    const jobs = await loadJobsFromDir(jobsDir);

    for (const [path, job] of jobs) {
      if (typeof job === "function") await this.registerJob(job);
      else throw new Error(`Invalid job type: ${typeof job} at ${path}`);
    }
  }

  /**
   * invoke
   *
   * @param jobName The name of the job to invoke
   * @param data The data to pass to the job
   * @returns The job id
   *
   * @example
   * ```ts
   * tinyJobs.invoke("exampleJob", { name: "exampleJob" });
   * ```
   */
  public async invoke<K extends keyof T>(jobName: K, data?: T[K]) {
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
    });

    // Events: Store the job name with the job id for event job name resolution
    await this.redis.hsetnx(
      getJobNameRedisKey(jobName as string),
      queuedJob.id as string,
      jobName as string
    );

    return queuedJob.id;
  }
}

export default TinyJobs;
