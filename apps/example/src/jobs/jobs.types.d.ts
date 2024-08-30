interface cronExampleParams { name: string };
interface delayedJobParams { name: string };
interface exampleJobParams { name: string };

type TinyJobsTypes = {
  'cronExample': cronExampleParams;
  'delayedJob': delayedJobParams;
  'exampleJob': exampleJobParams
};

export default TinyJobsTypes;
