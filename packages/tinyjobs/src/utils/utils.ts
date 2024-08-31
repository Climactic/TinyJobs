export const generateRandomUid = () => {
  const uuid = crypto.randomUUID();
  return uuid.replace(/-/g, "");
};

export const getJobNameRedisKey = (jobName: string) => {
  return `tinyjobs:tje:job:${jobName}`;
};
