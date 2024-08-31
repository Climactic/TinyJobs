import { Job } from "tinyjobs";

export default class ExampleJob extends Job {
  constructor() {
    super({
      name: "exampleJob",
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello from ${this.name} ${name}!`);
    return { name };
  }
}
