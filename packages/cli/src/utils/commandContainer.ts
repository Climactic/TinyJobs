import { intro, outro } from "@clack/prompts";
import color from "picocolors";

const commandContainer = (
  command: Function,
  args?: string[],
  skipOutro?: boolean
) => {
  console.clear();

  intro(color.bold(color.underline("TinyJobs CLI")));

  command(args);

  if (skipOutro === false)
    outro("For more information, visit the project repository.");
};

export default commandContainer;
