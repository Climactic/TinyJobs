import { log, select, text } from "@clack/prompts";
import fs from "fs";
import config from "../utils/config";
import {
  javascriptJobExample,
  typescriptJobExample,
} from "../base/exampleJobs";
import { pascalCase } from "../utils/utils";

async function generateCommand(args: string[]) {
  let option: string | symbol = args[0];

  if (!option) {
    option = await select({
      message: "Select from the following generate options:",
      options: [
        {
          value: "types",
          label: "Types - Generates types for TinyJobs Handler Intellisense",
        },
        {
          value: "job",
          label:
            "Job - Generates a new Job with a specified name in the jobs directory",
        },
      ],
    });
  }

  switch (option) {
    case "types":
      console.log("Generating types...");
      break;

    case "job":
      await generateJob(args);
      break;

    default:
      console.log("Invalid option.");
      break;
  }
}

export default generateCommand;

const generateJob = async (args: string[]) => {
  if (!config.get("jobsDir" || !config.get("language")))
    log.error(
      "TinyJobs is not initialized. Run 'tinyjobs init' to initialize TinyJobs."
    );

  let jobName: string | symbol = args[1];
  if (!jobName) {
    jobName = await text({
      message: "Enter the name of the job:",
    });
  }

  const language = config.get("language");

  const exists = fs.existsSync(
    `${process.cwd()}/${config.get("jobsDir")}/${pascalCase(String(jobName))}.${language === "typescript" ? "ts" : "js"}`
  );

  if (exists) {
    log.error("Job with this name already exists.");
    return;
  }

  const jobTemplate =
    language === "typescript" ? typescriptJobExample : javascriptJobExample;

  fs.writeFileSync(
    `${process.cwd()}/${config.get("jobsDir")}/${pascalCase(String(jobName)).replace(/.ts|.js/gi, "")}.${
      language === "typescript" ? "ts" : "js"
    }`,
    jobTemplate.replace(/ExampleJob/g, pascalCase(String(jobName)))
  );

  log.success("Job generated successfully.");
};
