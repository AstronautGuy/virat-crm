import { locationLogs } from "../src/server/db/schema/locationLogs";

console.log("Columns:", Object.keys(locationLogs));
// @ts-ignore
console.log(
  "Column Details:",
  Object.keys(locationLogs).map((k) => ({
    name: k,
    type: locationLogs[k]?.name,
  })),
);
