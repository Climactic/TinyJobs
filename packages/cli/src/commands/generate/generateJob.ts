import { log, text } from "@clack/prompts";
import config from "../../utils/config";
import { pascalCase } from "../../utils/utils";
import fs from "fs";
import {
  javascriptJobExample,
  typescriptJobExample,
} from "../../base/exampleJobs";

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

    if (!jobName || typeof jobName === "symbol") {
      log.error("Job name is required.");
      process.exit(1);
    }
  }

  const language = config.get("language");

  const exists = fs.existsSync(
    `${process.cwd()}/${config.get("jobsDir")}/${pascalCase(String(jobName))}.${language === "typescript" ? "ts" : "js"}`
  );

  if (exists) return log.error("Job with this name already exists.");

  const jobTemplate =
    language === "typescript" ? typescriptJobExample : javascriptJobExample;

  fs.writeFileSync(
    `${process.cwd()}/${config.get("jobsDir")}/${pascalCase(String(jobName)).replace(/.ts|.js/gi, "")}.${
      language === "typescript" ? "ts" : "js"
    }`,
    jobTemplate.replace(/ExampleJob|exampleJob/g, pascalCase(String(jobName)))
  );

  log.success("Job generated successfully.");
};

export default generateJob;
