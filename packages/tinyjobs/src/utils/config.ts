import fs from "fs";
import path from "path";
import * as v from "valibot";

const configFileName = "tinyjobs.json";

const schema = v.object({
  jobsDir: v.string(),
  language: v.pipe(v.string(), v.regex(/^(typescript|javascript)$/)),
});

export const getConfig = async () => {
  if (!fs.existsSync(path.resolve(process.cwd(), configFileName))) {
    return undefined;
  }

  const parsed = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), configFileName), "utf-8") ?? {}
  );

  return v.parse(schema, parsed);
};
