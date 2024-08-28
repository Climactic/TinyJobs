export const generateRandomUid = () => {
  const uuid = crypto.randomUUID();
  return uuid.replace(/-/g, "");
};
