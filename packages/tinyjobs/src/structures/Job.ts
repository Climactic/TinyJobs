/**
 * @description The base class for all jobs
 * @abstract
 * @class
 * @name TinyJob
 * @example
 * class MyJob extends TinyJob {
 *  constructor() {
 *   super();
 *   this.name = "MyJob";
 *   this.cron = "* * * * *";
 *  }
 *
 *  run({ name }: { name: string }) {
 *    console.log(`Hello, ${name}!`);
 *  }
 * }
 **/
abstract class Job {
  name!: string;
  cron?: string;

  abstract run(payload: Record<string, any>): void;
}

export default Job;
