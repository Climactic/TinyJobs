import { sleep } from "bun";
import { Job } from "tinyjobs";

export default class DelayedJob extends Job {
  constructor() {
    super({
      name: "delayedJob",
      delay: 5000, // 5 seconds
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello from ${this.name} ${name}!`);
    return { name };
  }
}
