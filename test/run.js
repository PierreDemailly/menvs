// Import Node.js Dependencies
import { run } from "node:test";
import { tap } from "node:test/reporters";

// Import Third-party Dependencies
import { globSync } from "glob";

// Tests cannot be run with parallelism because of conflicts with FS operations
// to theses paths: ~/.menvs/* and ./.env
// TODO: use --test-concurrency once landed: https://github.com/nodejs/node/commit/9f9c58212eb0a4b560749ddc8875f4a558342f64
const testStream = run({
  files: globSync("test/*.test.js"),
  concurrency: 1
}).compose(tap).pipe(process.stdout);

testStream.on("test:fail", () => {
  process.exitCode = 1;
});
