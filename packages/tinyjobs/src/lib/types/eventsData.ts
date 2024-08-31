export type JobCompletedData = {
  jobId: string;
  jobName: string;
  returnvalue: any;
  prev?: string;
};

export type JobFailedData = {
  jobId: string;
  jobName: string;
  failedReason: string;
};
