// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import { PromptAgent } from "@topcli/prompts";
import stripAnsi from "strip-ansi";

// Import Internal Dependencies
import { list } from "../src/index.js";
import * as utils from "../src/utils.js";
import { MENVS_PATH } from "../src/constants.js";

// CONSTANTS
const kPromptAgent = PromptAgent.agent();

describe("Listing env", () => {
  const logs = [];
  console.log = (str) => {
    logs.push(stripAnsi(str));
    process.stdout.write(str + os.EOL);
  };

  it("should throw if there is no config", async() => {
    for (const file of fs.readdirSync(MENVS_PATH)) {
      fs.rmSync(path.join(MENVS_PATH, file), { force: true });
    }

    await list();
    assert.equal(logs.length, 1);
    assert.equal(logs[0], "No configs available!");
  });

  it("should list configs", async() => {
    while (logs.length) {
      logs.shift();
    }

    fs.writeFileSync(utils.configEnvPath("foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo"
        }
      ],
      usedBy: [process.cwd()]
    }, null, 2));
    fs.writeFileSync(utils.configEnvPath("bar"), "DUMMY_VAR=bar");
    fs.writeFileSync(utils.configJSONPath("bar"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "bar"
        }
      ],
      usedBy: [process.cwd()]
    }, null, 2));

    await list();

    assert.equal(logs.length, 1);
    assert.equal(logs[0], `Available configs:${os.EOL}bar${os.EOL}foo`);
  });
});
