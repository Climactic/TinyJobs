interface cronExampleParams { name: string };
interface exampleJobParams { name: string };

type TinyJobsTypes = {
  'cronExample': cronExampleParams;
  'exampleJob': exampleJobParams
};

export default TinyJobsTypes;
