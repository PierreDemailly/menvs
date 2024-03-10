// Import Node.js Dependencies
import assert from "node:assert";
import { before, describe, it } from "node:test";
import fs from "node:fs";

// Import Third-party Dependencies
import { PromptAgent } from "@topcli/prompts";

// Import Internal Dependencies
import { save } from "../src/index.js";
import * as utils from "../src/utils.js";
import { MENVS_CONFIGS_PATH } from "../src/constants.js";

// CONSTANTS
const kPromptAgent = PromptAgent.agent();

describe("Saving .env", () => {
  before(async() => {
    if (!fs.existsSync(MENVS_CONFIGS_PATH)) {
      fs.mkdirSync(MENVS_CONFIGS_PATH);
    }

    fs.rmSync(utils.configEnvPath("foo"), { force: true });
    fs.rmSync(utils.configJSONPath("foo"), { force: true });
  });

  it("should create ~/.menvs/foo.env & ~/.menvs/foo.json", async() => {
    fs.writeFileSync(".env", "DUMMY_VAR=foo");
    kPromptAgent.nextAnswer(["foo", []]);

    await save();

    const env = fs.readFileSync(utils.configEnvPath("foo"));
    assert.equal(env, "DUMMY_VAR=foo");

    const config = fs.readFileSync(utils.configJSONPath("foo"));
    assert.deepStrictEqual(JSON.parse(config), {
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo",
          isSecret: false
        }
      ],
      usedBy: [process.cwd()]
    });
  });
});
