import { intro, outro } from "@clack/prompts";
import color from "picocolors";

const commandContainer = (command: Function, args?: string[]) => {
  console.clear();
  intro(color.bold(color.underline("TinyJobs CLI")));
  command(args);
  outro("For more information, visit the project repository.");
};

export default commandContainer;
