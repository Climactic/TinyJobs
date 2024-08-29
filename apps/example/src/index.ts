import TinyJob from "tinyjobs";
import type TinyJobsTypes from "./jobs/jobs.types";

const JobHandler = new TinyJob<TinyJobsTypes>({
  queueName: "example",
});
JobHandler.loadJobs();

const runExample = await JobHandler.queueJob("exampleJob", {
  name: "World",
});

console.log("ExampleJob queued:", runExample.id);
