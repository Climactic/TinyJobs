import Conf from "conf";

const config = new Conf({
  projectName: "tinyjobs",
  projectVersion: "0.0.1",
  schema: {
    jobsDir: {
      type: "string",
    },
    language: {
      type: "string",
      pattern: "^(typescript|javascript)$",
    },
  },
  configName: "tinyjobs",
  cwd: process.cwd(),
});

export default config;
