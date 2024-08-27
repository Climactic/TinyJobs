import { intro, select } from "@clack/prompts";
import color from "picocolors";
import helpCommand from "./commands/help";
import introCommand from "./commands/intro";
import generateCommand from "./commands/generate";
import versionCommand from "./commands/version";
import commandContainer from "./utils/commandContainer";
import initCommand from "./commands/init";

async function main() {
  const args = process.argv.slice(2);
  let command: string | symbol = args[0];

  if (!args || !command) {
    intro(color.bold(color.underline("TinyJobs CLI")));

    command = await select({
      message: "Select a command:",
      options: [
        { value: "generate", label: "tinyjobs generate" },
        { value: "init", label: "tinyjobs init" },
        { value: "help", label: "tinyjobs help" },
        { value: "version", label: "tinyjobs version" },
      ],
    });
  }

  const cmdArgs = args.slice(1);

  switch (command) {
    case "help":
    case "h":
    case "-h":
    case "--help":
      commandContainer(helpCommand, cmdArgs);
      break;

    case "generate":
    case "gen":
    case "g":
      commandContainer(generateCommand, cmdArgs);
      break;

    case "init":
      commandContainer(initCommand, cmdArgs);
      break;

    case "version":
    case "v":
    case "-v":
    case "--version":
      commandContainer(versionCommand);
      break;

    default:
      commandContainer(introCommand);
      break;
  }
}

main();
