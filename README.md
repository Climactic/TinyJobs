# TinyJobs

TinyJobs is tiny user-friendly background jobs framework for JavaScript runtimes.

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- `tinyjobs`: TinyJobs core package that provides the framework for creating and running background jobs.
- `@tinyjobs/cli`: CLI for managing TinyJobs in your project.
- `@tinyjobs/example`: Example app that demonstrates how to use TinyJobs.
- `@tinyjobs/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@tinyjobs/typescript-config`: `tsconfig.json`s used throughout the monorepo

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting


## CLI

Run the following command:

```sh
bunx @tinyjobs/cli
```

## Usage
Instantiate a new `TinyJobs` instance and add the job:

```ts
import TinyJobs from 'tinyjobs';

const tinyJobs = new TinyJobs();

// Load jobs from the jobs directory
await tinyJobs.loadJobs();

// Invoke the job to run in the background
await tinyJobs.invoke('exampleJob', { name: 'world' });
```

## Creating a Job

### Your First Job
Let's create a new job in the `jobs` directory:
```ts
import { Job } from 'tinyjobs';

export default class FirstJob extends Job {
  constructor() {
    super({
        name: "firstJob",
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello, ${data.name}!`);
  }
}
```

### Develop

To develop all apps and packages, run the following command:

```
bun run dev
```