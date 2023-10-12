// Import Node.js Dependencies
import assert from "node:assert";
import { before, after, describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import { PromptAgent } from "@topcli/prompts";

// Import Internal Dependencies
import { pick } from "../src/index.js";
import * as utils from "../src/utils.js";
import { MENVS_CONFIGS_PATH } from "../src/constants.js";

// CONSTANTS
const kPromptAgent = PromptAgent.agent();

describe("Picking .env", () => {
  let currentEnv = null;

  before(async() => {
    if (!fs.existsSync(MENVS_CONFIGS_PATH)) {
      fs.mkdirSync(MENVS_CONFIGS_PATH);
    }

    try {
      currentEnv = fs.readFileSync(".env", { encoding: "utf-8" });
    }
    catch {
      // do nothing
    }
    fs.rmSync(".env", { force: true });
    fs.rmSync(utils.configEnvPath("foo"), { force: true });
    fs.rmSync(utils.configJSONPath("foo"), { force: true });
  });

  after(async() => {
    if (currentEnv !== null) {
      fs.writeFileSync(".env", currentEnv);
    }
  });

  it("should create .env from foo config", async() => {
    fs.writeFileSync(utils.configEnvPath("foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo"
        }
      ]
    }, null, 2));
    fs.rmSync(".env", { force: true });

    kPromptAgent.nextAnswer("foo");

    await pick();

    const dotenv = fs.readFileSync(".env", "utf-8");
    assert.strictEqual(dotenv, "DUMMY_VAR=foo");
  });

  it("should prompt dynamic value", async() => {
    fs.writeFileSync(utils.configEnvPath("foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo",
          desc: "Dynamic value"
        }
      ]
    }, null, 2));
    fs.rmSync(".env", { force: true });

    kPromptAgent.nextAnswer("foo");
    kPromptAgent.nextAnswer("bar");

    await pick();

    const dotenv = fs.readFileSync(".env", "utf-8");
    assert.strictEqual(dotenv, "DUMMY_VAR=bar");
  });

  it("should not update existing .env with force = false", async() => {
    fs.writeFileSync(".env", "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configEnvPath("foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo"
        }
      ]
    }, null, 2));

    kPromptAgent.nextAnswer(false);

    await pick();

    const dotenv = fs.readFileSync(".env", "utf-8");
    assert.strictEqual(dotenv, "DUMMY_VAR=foo");
  });
});
