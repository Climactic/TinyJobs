import { log } from "@clack/prompts";
import color from "picocolors";

async function helpCommand(args: string[]) {
  log.info("This is the help command.");
}

export default helpCommand;
