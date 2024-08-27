import { log } from "@clack/prompts";
import color from "picocolors";

import { version } from "../../package.json";

async function versionCommand() {
  log.info(`Version: ${color.bold(version)}`);
}

export default versionCommand;
