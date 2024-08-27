import { log, select, text } from "@clack/prompts";
import color from "picocolors";
import config from "../utils/config";

async function configCommand(args: string[]) {
  let command: string | symbol = args[0];

  if (!command)
    command = await select({
      message: "Select what you'd like to configure:",
      options: [
        {
          value: "directory",
          label:
            "Directory - Configure the directory where TinyJobs will store jobs",
        },
        {
          value: "language",
          label: "Language - Configure the language you are using for TinyJobs",
        },
      ],
    });

  switch (command) {
    case "directory":
    case "dir":
      let dir: string | symbol = args[1];

      if (!dir) {
        dir = await text({
          message: "Enter the directory where you want to store your jobs:",
        });
      }

      if (dir === config.get("jobsDir")) {
        log.info("Directory is already configured.");
        break;
      }

      config.set("jobsDir", dir);
      log.info(
        `Jobs directory has been configured to ${color.bold(
          config.get("jobsDir") as string
        )}.`
      );
      break;

    case "language":
    case "lang":
      let lang: string | symbol = args[1];

      if (!lang) {
        lang = await select({
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
      }

      if (lang === config.get("language")) {
        log.info("Language is already configured.");
        break;
      }

      try {
        config.set(
          "language",
          lang === "ts" ? "typescript" : lang === "js" ? "javascript" : lang
        );
        log.info(
          `Language has been configured to ${color.bold(
            config.get("language") as string
          )}.`
        );
      } catch (e) {
        // @ts-expect-error
        log.error(e.message);
      }
      break;

    default:
      log.info("Invalid option.");
      break;
  }
}

export default configCommand;
