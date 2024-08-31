import { Job } from "tinyjobs";

export default class CronExample extends Job {
  constructor() {
    super({
      name: "cronExample",
      cron: "*/1 * * * *", // Every minute
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello from cronExample ${name}!`);
    return { name };
  }
}
