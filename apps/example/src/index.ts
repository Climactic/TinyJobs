import TinyJobs from "tinyjobs";
import { TinyJobEvents } from "tinyjobs";

import type TinyJobsTypes from "./jobs/jobs.types";

// Create a new instance of TinyJobs
// This automatically loads all jobs in the jobs directory since we have it configured
const tinyJobs = new TinyJobs<TinyJobsTypes>({
  queueName: "tinyjobs-example",
  concurrency: 5, // Process 5 jobs concurrently
  removeOnComplete: true,
  removeOnFailure: true,
});

await tinyJobs.loadJobs();

// Run Jobs which are not scheduled via cron
const cancelJobId = await tinyJobs.invoke("cancelExample");
await tinyJobs.invoke("exampleJob", { name: "exampleJob" });
await tinyJobs.invoke("delayedJob", { name: "DelayedJob" });

// Cancel a job
tinyJobs.cancel("cancelExample", cancelJobId);

// Logging
tinyJobs.events.on(TinyJobEvents.JOB_COMPLETE, (job) => {
  console.log("[COMPLETED]\n", job);
});

tinyJobs.events.on(TinyJobEvents.JOB_FAILED, (job) => {
  console.error("[FAILED]\n", job);
});

tinyJobs.events.on(TinyJobEvents.JOB_CANCELLED, (job) => {
  console.log("[CANCELLED]\n", job);
});
