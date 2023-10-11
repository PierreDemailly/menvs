// Import Node.js Dependencies
import fs from "node:fs";

// Import Third-party Dependencies
import { multiselect } from "@topcli/prompts";
import { green } from "kleur/colors";

// Import Internal Dependencies
import * as utils from "./utils.js";

export async function del() {
  const configsToDelete = await multiselect("Choose configs to delete", {
    choices: utils.availableConfigs()
  });

  for (const config of configsToDelete) {
    fs.rmSync(utils.configEnvPath(config));
    fs.rmSync(utils.configJSONPath(config));

    console.log(green(`Successfully deleted the config ${config}!`));
  }
}
