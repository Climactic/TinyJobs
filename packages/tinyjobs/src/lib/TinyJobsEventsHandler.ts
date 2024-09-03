import { QueueEvents } from "bullmq";
import { EventEmitter } from "events";
import IORedis from "ioredis";

import { TinyJobEvents } from "../types";
import type {
  JobCancelledData,
  JobCompletedData,
  JobFailedData,
} from "./types/eventsData";
import { getJobNameRedisKey } from "../utils/utils";

type TinyJobEventsConstructorTypes = {
  queueName: string;
  redis: IORedis;
};

class TinyJobEventsHandler extends EventEmitter {
  private events: QueueEvents;
  private redis: IORedis;

  constructor({ queueName, redis }: TinyJobEventsConstructorTypes) {
    super();
    this.events = new QueueEvents(queueName);
    this.redis = redis;

    this.init();
  }

  private init() {
    this.events.on("completed", async ({ jobId, returnvalue, prev }) => {
      const jobName = await this.getJobNameById(jobId);
      if (jobName) {
        const jobData = {
          jobId,
          jobName,
          returnValue: returnvalue,
        };
        this.emit(TinyJobEvents.JOB_COMPLETE, jobData);
      }
    });

    this.events.on("failed", async ({ jobId, failedReason }) => {
      const jobName = await this.getJobNameById(jobId);
      if (jobName) {
        const jobData = {
          jobId,
          jobName,
          failedReason,
        };
        this.emit(TinyJobEvents.JOB_FAILED, jobData);
      }
    });
  }

  /**
   * getJobNameById
   *
   * Get the job name by the job id from the redis store
   *
   * Note: This is a helper function since bull queue does not store the jobName
   * with it's corresponding jobId. We should look into a better way of solving this.
   *
   * @param jobId - The job id from the queue
   */
  public async getJobNameById(jobId: string): Promise<string | null> {
    const keys = await this.redis.keys(getJobNameRedisKey("*"));

    for (const key of keys) {
      const jobName = await this.redis.hget(key, jobId);
      if (jobName) return jobName;
    }

    return null;
  }

  // Override the emit method with proper typing
  emit(event: TinyJobEvents.JOB_COMPLETE, job: JobCompletedData): boolean;
  emit(event: TinyJobEvents.JOB_FAILED, job: JobFailedData): boolean;
  emit(event: TinyJobEvents.JOB_CANCELLED, job: JobCancelledData): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  // Override the on method with proper typing
  on(
    event: TinyJobEvents.JOB_COMPLETE,
    listener: (job: JobCompletedData) => void
  ): this;
  on(
    event: TinyJobEvents.JOB_FAILED,
    listener: (job: JobFailedData) => void
  ): this;
  on(
    event: TinyJobEvents.JOB_CANCELLED,
    listener: (job: JobCancelledData) => void
  ): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
}

export default TinyJobEventsHandler;
