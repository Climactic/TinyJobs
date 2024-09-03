interface cancelExampleParams {};
interface cronExampleParams { name: string };
interface delayedJobParams { name: string };
interface exampleJobParams { name: string };

type TinyJobsTypes = {
  'cancelExample': cancelExampleParams;
  'cronExample': cronExampleParams;
  'delayedJob': delayedJobParams;
  'exampleJob': exampleJobParams
};

export default TinyJobsTypes;
