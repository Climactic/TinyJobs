import { Job } from "tinyjobs";

export default class CronExample extends Job {
  constructor() {
    super({
      name: "cronExample",
      cron: "*/1 * * * *",
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello from cronExample ${name}!`);
  }
}
