import { log, select } from "@clack/prompts";
import generateJob from "./generate/generateJob";
import generateJobTypes from "./generate/generateTypes";

async function generateCommand(args: string[]) {
  let option: string | symbol = args[0];

  if (!option) {
    option = await select({
      message: "Select from the following generate options:",
      options: [
        {
          value: "job",
          label:
            "Job - Generates a new Job with a specified name in the jobs directory",
        },
        {
          value: "types",
          label: "Types - Generates types for TinyJobs Handler Intellisense",
        },
      ],
    });
  }

  switch (option) {
    case "types":
      generateJobTypes();
      break;

    case "job":
      await generateJob(args);
      break;

    default:
      log.warn("Invalid option.");
      break;
  }
}

export default generateCommand;
