interface cronExampleParams { name: string };
interface DelayedJobParams { name: string };
interface exampleJobParams { name: string };

type TinyJobsTypes = {
  'cronExample': cronExampleParams;
  'DelayedJob': DelayedJobParams;
  'exampleJob': exampleJobParams
};

export default TinyJobsTypes;
