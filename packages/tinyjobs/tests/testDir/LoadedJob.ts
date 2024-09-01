import Job from "../../src/structures/Job";

class LoadedJob extends Job {
  constructor() {
    super({ name: "loadedJob" });
  }

  async run(data) {
    return data;
  }
}

export default LoadedJob;
