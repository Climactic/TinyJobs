# tinyjobs
TinyJobs is tiny user-friendly background jobs framework for JavaScript runtimes.

## Getting Started

### Optional

To make it easier to use TinyJobs, you can install the CLI globally:

```bash
npm i -g tinyjobs
```

Install the package:

```bash
npm i tinyjobs
```

## Usage

To make a job, create a new file in the `jobs` directory. You can use the `tinyjobs` CLI to generate a new job:

```bash
tinyjobs init
```

This command will create an example job in the `jobs` directory and setup the necessary configuration.

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

### Delayed Job
You can also delay how soon this jobs run after invoking it:

```ts
import { Job } from 'tinyjobs';

export default class FirstJob extends Job {
  constructor() {
    super({
        name: "firstJob",
        delay: 1000, // 1 second in milliseconds
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello, ${data.name}!`);
  }
}
```

### Cron Job
You can also schedule jobs to run at specific times using cron syntax:

```ts
import { Job } from 'tinyjobs';

export default class FirstJob extends Job {
  constructor() {
    super({
        name: "firstJob",
        cron: '0 0 * * *', // Run every day at midnight
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello, ${data.name}!`);
  }
}
```

### Concurrent Jobs
You can specify how many instances of a job can run concurrently:

```ts
import { Job } from 'tinyjobs';

export default class FirstJob extends Job {
  constructor() {
    super({
        name: "firstJob",
        concurrency: 2, // Run 2 instances concurrently
    });
  }

  async run({ name }: { name: string }) {
    console.log(`Hello, ${data.name}!`);
  }
}
```

## Events
TinyJobs emits events that you can listen to, currently only supporting `JOB_COMPLETE` and `JOB_FAILED`.

```ts
import TinyJobs from 'tinyjobs';
import { TinyJobEvents } from "tinyjobs";

const tinyJobs = new TinyJobs();

tinyJobs.events.on(TinyJobEvents.JOB_COMPLETE, (job) => {
  console.log(job);
});

tinyJobs.events.on(TinyJobEvents.JOB_FAILED, (job) => {
  console.error(job);
});
```

## Typed Parameters

TinyJobs uses TypeScript to provide type safety for job parameters. You can define the type of parameters your job expects in the `run` method.

Using the CLI, you can generate types that can be added to the TinyJobs client:

```bash
tinyjobs generate types
```

This will create a `tinyjobs.d.ts` file in the jobs folder configured in your project that you can import in your client code:

```ts
import TinyJobs from 'tinyjobs';

import type TinyJobsTypes from "./jobs/jobs.types";

const tinyJobs = new TinyJobs<TinyJobsTypes>();
```

This will provide type safety for the parameters passed to the job during invocation.

## Roadmap
TinyJobs is not feature complete and still in early stages, you can refer to the roadmap for the list of currently planend features and their progress [here](https://github.com/orgs/Climactic/projects/1/views/1).

## License
TinyJobs is licensed under the [Apache-2.0](LICENSE).
