import TinyJobs from "tinyjobs";
import type TinyJobsTypes from "./jobs/jobs.types";

// Create a new instance of TinyJobs
// This automatically loads all jobs in the jobs directory since we have it configured
const tinyJobs = new TinyJobs<TinyJobsTypes>({
  queueName: "tinyjobs-example",
  concurrency: 5,
});

await tinyJobs.loadJobs();

// Run Jobs which are not scheduled via cron
tinyJobs.queueJob("exampleJob", { name: "exampleJob" });
tinyJobs.queueJob("delayedJob", { name: "DelayedJob" });
