const typescriptJobExample = `import { Job } from "tinyjobs";

export default class ExampleJob extends Job {
  constructor() {
    super();
    this.name = 'ExampleJob';
  }

  async run({ name }: { name: string }) {
    console.log(\`Hello from ExampleJob \${name}!\`);
  }
}
`;

const javascriptJobExample = `const { Job } = require("tinyjobs");

module.exports = class ExampleJob extends Job {
  constructor() {
    super();
    this.name = 'ExampleJob';
  }

  async run({ name }) {
    console.log(\`Hello from ExampleJob \${name}!\`);
  }
};
`;

export { typescriptJobExample, javascriptJobExample };
