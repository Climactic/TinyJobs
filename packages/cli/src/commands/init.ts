import { log, select, text } from "@clack/prompts";
import fs from "fs";
import config from "../utils/config";
import { javascriptJobExample, typescriptJobExample } from "../base/exampleJobs";

async function initCommand(args: string[]) {
  // Confirm initialization
  log.info("This is the init command.");
  const confirm = await select({
    message:
      "Would you like to initialize TinyJobs in this project? This will create a tinyjobs.json file and an example job.",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });

  if (!confirm) {
    log.info("Cancelled TinyJobs initialization. Exiting...");
    process.exit(0);
  }

  // Selecting the language
  const type = await select({
    message: "Select the language you are using:",
    options: [
      {
        value: "typescript",
        label: "TypeScript",
      },
      {
        value: "javascript",
        label: "JavaScript",
      },
    ],
  });

  config.set("language", type);

  // Selecting the directory to store jobs and types
  const jobsDir = await select({
    message: "Select the directory to store your jobs:",
    options: [
      {
        value: "jobs",
        label: "jobs - A directory named 'jobs' in the root of your project",
      },
      {
        value: "custom",
        label: "custom - A custom directory",
      },
    ],
  });

  let customDir: string | symbol = "";

  if (jobsDir === "custom") {
    customDir = await text({
      message: "Enter the custom directory name:",
    });
  }

  const finalDir = jobsDir === "custom" ? customDir : jobsDir;

  if (!fs.existsSync(`${process.cwd()}/${finalDir}`))
    fs.mkdirSync(`${process.cwd()}/${finalDir}`, { recursive: true });

  config.set("jobsDir", finalDir);

  // Generate example job
  await generateExampleJob(
    type as "typescript" | "javascript",
    String(finalDir)
  );

  log.success("TinyJobs initialized successfully.");
}

export default initCommand;

const generateExampleJob = async (
  type: "javascript" | "typescript",
  finalDir: string
) => {
  if (type === "typescript") {
    if (!fs.existsSync(`${process.cwd()}/${finalDir}/ExampleJob.ts`)) {
      fs.writeFileSync(
        `${process.cwd()}/${finalDir}/ExampleJob.ts`,
        typescriptJobExample
      );
      log.info("Example job generated successfully.");
    } else {
      log.warn("ExampleJob.ts already exists. Skipping...");
    }
  } else {
    if (!fs.existsSync(`${process.cwd()}/${finalDir}/ExampleJob.js`)) {
      fs.writeFileSync(
        `${process.cwd()}/${finalDir}/ExampleJob.js`,
        javascriptJobExample
      );
      log.info("Example job generated successfully.");
    } else {
      log.warn("ExampleJob.js already exists. Skipping...");
    }
  }
};
