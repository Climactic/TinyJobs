import { log, select, text } from "@clack/prompts";
import fs from "fs";
import config from "../utils/config";
import {
  javascriptJobExample,
  typescriptJobExample,
} from "../base/exampleJobs";

async function initCommand(args: string[]) {
  // Confirm initialization
  log.info(
    [
      `This will create the following files:`,
      `- ExampleJob.ts or ExampleJob.js`,
      `- tinyjobs.config.json`,
    ].join("\n")
  );

  const confirm = await select({
    message: "Would you like to initialize TinyJobs in this project?",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });

  if (!confirm || typeof confirm === "symbol") {
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

  if (!type || typeof type === "symbol") {
    process.exit(0);
  }

  try {
    config.set("language", type);
  } catch (e) {
    // @ts-expect-error
    log.error(e.message);
    process.exit(1);
  }

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

  if (!jobsDir || typeof jobsDir === "symbol") {
    process.exit(0);
  }

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
