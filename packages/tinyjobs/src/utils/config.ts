import fs from "fs";
import path from "path";

interface TinyJobConfig {
  jobsDir: string;
  language: "typescript" | "javascript";
}

const configFileName = "tinyjobs.json";

export const getConfig = async () => {
  if (!fs.existsSync(path.resolve(process.cwd(), configFileName))) {
    return undefined;
  }

  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), configFileName), "utf-8")
  ) as TinyJobConfig;
};
