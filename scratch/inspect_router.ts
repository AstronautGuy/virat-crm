import { appRouter } from "../src/server/api/root";

console.log("Procedures:");
const procedures = appRouter._def.procedures;
for (const [path, proc] of Object.entries(procedures)) {
  console.log(`Path: ${path}`);
  // @ts-ignore
  const inputs = proc._def.inputs;
  console.log(`Inputs length: ${inputs?.length}`);
  if (inputs && inputs.length > 0) {
    const input = inputs[0];
    console.log(`Input keys:`, Object.keys(input));
    console.log(`Input constructors:`, input.constructor?.name);
    console.log(`Input _zod:`, input._zod ? "yes" : "no");
    if (input._zod) {
      console.log(`Input _zod keys:`, Object.keys(input._zod));
    }
  }
}
