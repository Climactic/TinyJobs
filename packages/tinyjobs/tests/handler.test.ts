import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  mock,
  spyOn,
} from "bun:test";

import TinyJobs from "../src/lib/TinyJobsHandler";
import { TinyJobEvents } from "../src/types";
import * as utils from "../src/utils/utils";
import * as config from "../src/utils/config";
import * as jobs from "../src/utils/jobs";
import Job from "../src/structures/Job";
import ExampleJob from "./testDir/ExampleJob";
import LoadedJob from "./testDir/LoadedJob";

mock(() => "../src/utils/utils");
mock(() => "../src/utils/config");
mock(() => "../src/utils/jobs");

describe("TinyJobs", () => {
  let tinyJobs: TinyJobs<any>;

  beforeAll(() => {
    tinyJobs = new TinyJobs({
      queueName: "testQueue",
      concurrency: 2,
      removeOnComplete: true,
      removeOnFailure: true,
    });
  });

  afterAll(() => {
    tinyJobs["redis"].quit();
  });

  it("should initialize with default options", () => {
    const defaultTinyJobs = new TinyJobs();
    expect(defaultTinyJobs).toBeInstanceOf(TinyJobs);
  });

  it("should register a job", async () => {
    await tinyJobs.registerJob(ExampleJob);
    expect(tinyJobs["jobs"].has("exampleJob")).toBe(true);
  });

  it("should throw error if job is already registered", async () => {
    expect(tinyJobs.registerJob(ExampleJob)).rejects.toThrow(
      "Job with name exampleJob already registered."
    );
  });

  it("should invoke a job", async () => {
    const jobId = await tinyJobs.invoke("exampleJob", { test: "data" });
    expect(jobId).toBeDefined();
  });

  it("should load jobs from directory", async () => {
    const path = `${process.cwd()}/tests/testDir`;
    spyOn(config, "getConfig").mockResolvedValue({
      jobsDir: path,
      language: "typescript",
    });

    spyOn(jobs, "loadJobsFromDir").mockResolvedValue(
      // @ts-expect-error
      new Map<string, Job>([["testDir/LoadedJob.ts", LoadedJob]])
    );

    await tinyJobs.loadJobs();
    expect(tinyJobs["jobs"].has("loadedJob")).toBe(true);
  });

  it("should handle job completion event", async () => {
    const jobId = "testJobId1";
    const jobName = "exampleJob";

    spyOn(utils, "getJobNameRedisKey").mockReturnValue("jobNameKey1");
    spyOn(tinyJobs["events"], "getJobNameById").mockResolvedValue(jobName);

    tinyJobs["events"].emit(TinyJobEvents.JOB_COMPLETE, {
      jobId,
      jobName,
      returnValue: { test: "data" },
    });

    tinyJobs["events"].on(TinyJobEvents.JOB_COMPLETE, (data) => {
      expect(data.returnValue).toEqual({ test: "data" });
    });
  });

  it("should handle job failure event", async () => {
    const jobId = "testJobId2";
    const jobName = "loadedJob";

    spyOn(utils, "getJobNameRedisKey").mockReturnValue("jobNameKey2");
    spyOn(tinyJobs["events"], "getJobNameById").mockResolvedValue(jobName);

    tinyJobs["events"].emit(TinyJobEvents.JOB_FAILED, {
      jobId,
      jobName,
      failedReason: "test",
    });

    tinyJobs["events"].on(TinyJobEvents.JOB_FAILED, (data) => {
      expect(data.failedReason).toBe("test");
    });
  });
});
