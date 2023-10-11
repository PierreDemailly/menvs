// Import Node.js Dependencies
import os from "node:os";

// Import Third-party Dependencies
import { yellow } from "kleur/colors";

// Import Internal Dependencies
import { availableConfigs } from "./utils.js";

export function list() {
  const configs = availableConfigs();

  if (configs.length === 0) {
    console.log(yellow("No configs available!"));

    return;
  }

  console.log(`Available configs:${os.EOL}${yellow(configs.join(os.EOL))}`);
}
