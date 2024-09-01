<div align="center">

# TinyJobs

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Climactic/TinyJobs/ci.yml?style=flat-square)
![NPM License](https://img.shields.io/npm/l/tinyjobs?style=flat-square)
![NPM Version](https://img.shields.io/npm/v/tinyjobs?style=flat-square&label=tinyjobs)
![NPM Version](https://img.shields.io/npm/v/@tinyjobs/cli?style=flat-square&label=@tinyjobs/cli)


TinyJobs is tiny user-friendly background jobs framework for JavaScript runtimes.

</div>

## What's inside?

This repo includes the following packages/apps:

### Apps and Packages

- [`tinyjobs`](packages/tinyjobs/README.md): TinyJobs core package that provides the framework for creating and running background jobs.
- [`@tinyjobs/cli`](packages/cli/README.md): CLI for managing TinyJobs in your project.
- [`@example/app`](apps/example/README.md): Example app that demonstrates how to use TinyJobs.
- [`@tinyjobs/eslint-config`](packages/eslint-config/README.md): `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- [`@tinyjobs/typescript-config`](packages/typescript-config): `tsconfig.json`s used throughout the monorepo


## CLI

Install and use the TinyJobs CLI to manage TinyJobs in your project.

```sh
npm i -G @tinyjobs/cli
tinyjobs
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

## Develop

To develop all apps and packages, run the following command:

```bash
bun run dev:packages # run watch modeon packages
bun run dev:apps # run watch mode on example app
```