import TinyJob from "tinyjobs";
import type TinyJobsTypes from "./jobs/jobs.types";

const JobHandler = new TinyJob<TinyJobsTypes>();
JobHandler.loadJobs();

const runExample = await JobHandler.queueJob("ExampleJob", {
  name: "World",
});

console.log("ExampleJob queued:", runExample.id);
