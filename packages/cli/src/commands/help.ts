import { log } from "@clack/prompts";
import color from "picocolors";

async function helpCommand(args: string[]) {
  const command = args[0];

  if (command) {
    switch (command) {
      case "generate":
        log.info(
          `${color.bold("tinyjobs generate types")}\nGenerate TypeScript types for your jobs.`
        );
        log.info(
          `${color.bold("tinyjobs generate job [name]")}\nGenerate a new job with the specified name.`
        );
        break;

      case "init":
        log.info(
          `${color.bold("tinyjobs init")}\nInitialize TinyJobs in your project.`
        );
        break;

      case "config":
        log.info(
          `${color.bold("tinyjobs config directory [name]")}\nConfigure the directory where TinyJobs will store jobs.`
        );
        log.info(
          `${color.bold("tinyjobs config language [typescript|javascript|ts|js]")}\nConfigure the language you are using for TinyJobs.`
        );
        break;

      case "version":
        log.info(
          `${color.bold("tinyjobs version")}\nDisplay the current version of TinyJobs.`
        );
        break;

      default:
        log.error("Command not found.");
        break;
    }
  } else {
    log.info("Welcome to the TinyJobs CLI!");

    log.info("Available help commands:");

    log.info(
      [
        color.bold("tinyjobs help generate"),
        color.bold("tinyjobs help config"),
        color.bold("tinyjobs help init"),
        color.bold("tinyjobs help version"),
      ].join("\n")
    );
  }
}

export default helpCommand;
