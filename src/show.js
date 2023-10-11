// Import Node.js Dependencies
import fs from "node:fs";
import os from "node:os";

// Import Third-party Dependencies
import { yellow } from "kleur/colors";
import { select } from "@topcli/prompts";

// Import Internal Dependencies
import * as utils from "./utils.js";

export async function show() {
  const configs = utils.availableConfigs();
  if (configs.length === 0) {
    console.log(yellow("No configs available!"));

    return;
  }

  const selectedConfig = await select("Choose the config you wanna show", {
    choices: configs
  });

  const { config, usedBy } = JSON.parse(
    fs.readFileSync(utils.configJSONPath(selectedConfig), "utf-8")
  );
  let envs = fs.readFileSync(utils.configEnvPath(selectedConfig), "utf-8");

  for (const envConfig of config) {
    if (envConfig.isSecret) {
      envs = envs.replace(`${envConfig.key}=${envConfig.value}`, `${envConfig.key}=${yellow("CONFIDENTIAL")}`);
    }
  }

  console.log(envs);
  console.log(`Used by:${os.EOL}${usedBy.join(os.EOL)}`);
}
