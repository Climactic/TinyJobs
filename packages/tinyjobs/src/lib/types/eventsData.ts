export type JobCompletedData = {
  jobId: string;
  jobName: string;
  returnValue: any;
};

export type JobFailedData = {
  jobId: string;
  jobName: string;
  failedReason: string;
};
