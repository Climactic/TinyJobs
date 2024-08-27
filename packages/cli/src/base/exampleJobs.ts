const typescriptJobExample = `import { Job } from "tinyjobs";

export default class ExampleJob extends Job {
  constructor() {
    super();
    this.name = 'ExampleJob';
  }

  async run() {
    console.log('Hello from ExampleJob!');
  }
}
`;

const javascriptJobExample = `const { Job } = require("tinyjobs");

module.exports = class ExampleJob extends Job {
  constructor() {
    super();
    this.name = 'ExampleJob';
  }

  async run() {
    console.log('Hello from ExampleJob!');
  }
};
`;

export { typescriptJobExample, javascriptJobExample };
