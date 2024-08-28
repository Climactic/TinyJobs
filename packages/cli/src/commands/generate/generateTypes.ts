import fs from "fs";
import path from "path";
import ts from "typescript";
import config from "../../utils/config";
import { log } from "@clack/prompts";

interface JobTypeDefinition {
  jobName: string;
  paramsType: string;
}

function extractJobTypes(filePath: string): JobTypeDefinition | null {
  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );

  let jobName = "";
  let paramsType = "";

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      node.members.forEach((member) => {
        if (ts.isConstructorDeclaration(member)) {
          member.body?.statements.forEach((statement) => {
            if (
              ts.isExpressionStatement(statement) &&
              ts.isBinaryExpression(statement.expression) &&
              statement.expression.left.getText() === "this.name" &&
              ts.isStringLiteral(statement.expression.right)
            ) {
              jobName = statement.expression.right.text;
            }
          });
        }

        if (ts.isMethodDeclaration(member) && member.name.getText() === "run") {
          const param = member.parameters[0];
          if (param && param.type) {
            paramsType = param.type.getFullText().trim();
          }
        }
      });
    }
  });

  if (jobName && paramsType) {
    return { jobName, paramsType };
  }
  return null;
}

function generateJobTypes() {
  // Skip if the command is not run from the root of the project
  if (config.get("language") !== "typescript") {
    return log.error(
      "Types generation is only supported in TypeScript projects."
    );
  }

  // Get the jobs directory from the config
  const jobsDir = config.get("jobsDir") as string;
  if (jobsDir === undefined) {
    return log.error(
      "Jobs directory is not configured. Run 'tinyjobs config directory' to configure the jobs directory."
    );
  }

  if (!fs.existsSync(jobsDir)) {
    fs.mkdirSync(jobsDir, { recursive: true });
  }

  const outputFile = path.join(jobsDir, "jobs.types.d.ts");

  const jobFiles = fs
    .readdirSync(jobsDir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));

  if (!jobFiles.length) {
    return log.error(
      "No job files found. Run 'tinyjobs generate job [name]' to generate a new job."
    );
  }

  // Generate types for all the jobs
  const jobTypeDefinitions: JobTypeDefinition[] = [];

  jobFiles.forEach((file) => {
    const filePath = path.join(jobsDir, file);
    const jobType = extractJobTypes(filePath);

    if (jobType) {
      jobTypeDefinitions.push(jobType);
    }
  });

  const typeDefinitions = jobTypeDefinitions
    .map(({ jobName, paramsType }) => {
      if (paramsType === "any") {
        return `interface ${jobName}Params { [key: string]: any };`;
      }
      return `interface ${jobName}Params ${paramsType};`;
    })
    .join("\n");

  const allJobsType = jobTypeDefinitions
    .map(({ jobName }) => `'${jobName}': ${jobName}Params`)
    .join(";\n  ");

  const fileContent = `
${typeDefinitions}

type TinyJobsTypes = {
  ${allJobsType}
};

export default TinyJobsTypes;
`;

  fs.writeFileSync(outputFile, fileContent, "utf8");
  log.info("Types generated successfully.");
}

export default generateJobTypes;
