import Job from "../../src/structures/Job";

class ExampleJob extends Job {
  constructor() {
    super({ name: "exampleJob" });
  }

  async run(data) {
    return data;
  }
}

export default ExampleJob;
