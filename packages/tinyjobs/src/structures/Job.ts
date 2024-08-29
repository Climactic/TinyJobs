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

  constructor(options: { name: string; cron?: string }) {
    this.name = options.name;
    this.cron = options.cron;
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
}

export default Job;
