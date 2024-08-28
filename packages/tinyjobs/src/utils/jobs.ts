import fs from "fs";
import path from "path";
import TinyJob from "../structures/Job";

export const loadJobsFromDir = async (dir: string) => {
  const files = fs
    .readdirSync(dir)
    .filter(
      (file) =>
        (file.endsWith(".js") || file.endsWith(".ts")) &&
        !file.endsWith(".d.ts")
    );

  const jobs: TinyJob[] = [];

  for (const file of files) {
    const JobClass = require(path.join(dir, file)).default;
    if (JobClass.prototype instanceof TinyJob) {
      jobs.push(JobClass);
    }
  }

  return jobs;
};
