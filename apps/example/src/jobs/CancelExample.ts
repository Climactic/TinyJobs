import { sleep } from "bun";
import { Job } from "tinyjobs";

export default class CancelExample extends Job {
  constructor() {
    super({
      name: "cancelExample",
      delay: 50000,
    });
  }

  async run() {
    sleep(100000);
  }
}
