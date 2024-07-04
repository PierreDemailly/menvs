// Import Node.js Dependencies
import os from "node:os";
import fs from "node:fs";

// Import Third-party Dependencies
import { yellow, cyan, red, bold } from "kleur/colors";

// Import Internal Dependencies
import * as utils from "./utils.js";

export function report() {
  const configs = utils.availableConfigs();

  if (configs.length === 0) {
    console.log(yellow("No configs available!"));

    return;
  }

  const formattedConfigs = configs.map((config) => [config, JSON.parse(
    fs.readFileSync(utils.configJSONPath(config), "utf-8")
  )]);

  for (const [configPath, { config, usedBy }] of formattedConfigs) {
    console.log();
    console.log(`${yellow(bold(configPath))}`);

    for (const envConfig of config) {
      const key = envConfig.key;
      const value = envConfig.isSecret ? red("*******") : envConfig.value;
      console.log(`  ${key}=${value}`);
    }

    console.log(cyan(bold("Used by:")));
    console.log(" " + usedBy.join(os.EOL + " "));
    console.log();
  }
}
