import { intro, select } from "@clack/prompts";
import color from "picocolors";
import helpCommand from "./commands/help";
import introCommand from "./commands/intro";
import generateCommand from "./commands/generate";
import versionCommand from "./commands/version";
import commandContainer from "./utils/commandContainer";

async function main() {
  const args = process.argv.slice(2);
  let command: string | symbol = args[0];

  if (!args || !command) {
    intro(color.bold(color.underline("TinyJobs CLI")));

    command = await select({
      message: "Select a command:",
      options: [
        { value: "help", label: "Help" },
        { value: "generate", label: "Generate" },
        { value: "version", label: "Version" },
      ],
    });
  }

  switch (command) {
    case "help":
    case "h":
    case "-h":
    case "--help":
      commandContainer(helpCommand, args.slice(1));
      break;

    case "generate":
    case "gen":
    case "g":
      commandContainer(generateCommand, args.slice(1));
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
