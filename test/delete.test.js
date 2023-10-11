// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import { PromptAgent } from "@topcli/prompts";

// Import Internal Dependencies
import { del } from "../src/index.js";
import * as utils from "../src/utils.js";

// CONSTANTS
const kPromptAgent = PromptAgent.agent();

describe("Deleting config", () => {
  it("should delete ~/.menvs/foo.env & ~/.menvs/foo.json", async() => {
    fs.writeFileSync(utils.configEnvPath("delete-foo"), "DUMMY_VAR=foo");
    fs.writeFileSync(utils.configJSONPath("delete-foo"), JSON.stringify({
      config: [
        {
          key: "DUMMY_VAR",
          value: "foo"
        }
      ]
    }, null, 2));

    kPromptAgent.nextAnswer(new Set(["delete-foo"]));

    await del();

    assert.throws(() => fs.readFileSync(utils.configEnvPath("delete-foo")), {
      code: "ENOENT"
    });
    assert.throws(() => fs.readFileSync(utils.configJSONPath("delete-foo")), {
      code: "ENOENT"
    });
  });
});
