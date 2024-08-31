/**
 * Base Job for creating jobs.
 * @class Job
 * @abstract
 * @example
 * ```ts
 * import { Job } from "tinyjobs";
 *
 * export default class ExampleJob extends Job {
 *  constructor() {
 *   super({
 *    name: "exampleJob",
 *   });
 *  }
 *
 *  async run({ name }: { name: string }) {
 *   console.log(`Hello from ${this.name} ${name}!`);
 *  }
 * }
 * ```
 */

class Job {
  name: string;
  cron?: string;
  delay?: number;
  conccurency?: number;

  /**
   * Creates an instance of Job.
   * @param {string} name The name of the job.
   * @param {string} [cron] The cron pattern for the job.
   * @param {number} [delay] The delay in milliseconds for the job.
   * @param {number} [concurrency] The concurrency for the job. Defaults to global concurrency of TinyJobs.
   * @memberof Job
   */
  constructor(options: {
    name: string;
    cron?: string;
    delay?: number;
    concurrency?: number;
  }) {
    this.name = options.name;
    this.cron = options.cron;
    this.delay = options.delay;
    this.conccurency = options.concurrency;
  }

  async run(payload?: Record<string, unknown>) {
    throw new Error("Method not implemented.");
  }

  static get name(): string {
    return this.name;
  }

  static get cron(): string | undefined {
    return this.cron;
  }

  static get delay(): number | undefined {
    return this.delay;
  }

  static get concurrency(): number | undefined {
    return this.concurrency;
  }

  static toJSON() {
    return {
      name: this.name,
      cron: this.cron,
      delay: this.delay,
      concurrency: this.concurrency,
    };
  }
}

export default Job;
