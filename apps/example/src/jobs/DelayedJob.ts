import { Job } from "tinyjobs";

export default class DelayedJob extends Job {
  constructor() {
    super({
      name: "DelayedJob",
      delay: 5000,
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello from DelayedJob ${name}!`);
  }
}
