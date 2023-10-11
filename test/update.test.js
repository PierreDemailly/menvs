// Import Node.js Dependencies
import assert from "node:assert";
import { describe, after, before, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import { PromptAgent } from "@topcli/prompts";

// Import Internal Dependencies
import { update } from "../src/index.js";
import * as utils from "../src/utils.js";

// CONSTANTS
const kPromptAgent = PromptAgent.agent();
const kTmpDir = os.tmpdir();

describe("Updating config", () => {
  let currentEnv = null;

  before(async() => {
    try {
      currentEnv = fs.readFileSync(".env", { encoding: "utf-8" });
    }
    catch {
      // do nothing
    }
  });

  after(async() => {
    if (currentEnv !== null) {
      fs.writeFileSync(".env", currentEnv);
    }
  });

  it("should update ~/.menvs/foo.env & ~/.menvs/foo.json and each related .env", async() => {
    fs.writeFileSync(utils.configEnvPath("foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo"
        }
      ],
      usedBy: [process.cwd(), kTmpDir]
    }, null, 2));
    fs.writeFileSync(path.join(os.tmpdir(), ".env"), "DUMMY_VAR=foo");
    fs.writeFileSync(".env", "DUMMY_VAR=foo");

    kPromptAgent.nextAnswer([
      "foo",
      [{
        key: "DUMMY_VAR",
        value: "foo"
      }],
      ["key", "value"],
      "PORT",
      "8080",
      [process.cwd(), kTmpDir]
    ]);
    await update();

    const [env, json] = [
      fs.readFileSync(utils.configEnvPath("foo"), "utf-8"),
      fs.readFileSync(utils.configJSONPath("foo"), "utf-8")
    ];
    assert.equal(env, "PORT=8080");
    assert.deepStrictEqual(JSON.parse(json), {
      config: [
        {
          key: "PORT",
          value: "8080"
        }
      ],
      usedBy: [process.cwd(), kTmpDir]
    });

    const [tmpEnv, cwdEnv] = [
      fs.readFileSync(path.join(os.tmpdir(), ".env"), "utf-8"),
      fs.readFileSync(".env", "utf-8")
    ];
    assert.equal(tmpEnv, "PORT=8080");
    assert.equal(cwdEnv, "PORT=8080");
  });
});
