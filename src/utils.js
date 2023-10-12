// Import Node.js Dependencies
import path from "node:path";
import os from "node:os";

// Import Third-party Dependencies
import { walkSync } from "@nodesecure/fs-walk";

// Import Internal Dependencies
import { MENVS_CONFIGS_PATH } from "./constants.js";

export function availableConfigs() {
  return [
    ...walkSync(MENVS_CONFIGS_PATH, {
      extensions: new Set([".env"])
    })
  ].flatMap(([dirent, file]) => (dirent.isFile() ? path.basename(file).slice(0, -4) : []));
}

export function configJSONPath(configName) {
  return path.join(MENVS_CONFIGS_PATH, `${configName}.json`);
}

export function configEnvPath(configName) {
  return path.join(MENVS_CONFIGS_PATH, `${configName}.env`);
}

export function isKeySecret(key) {
  const toLowerCase = key.toLowerCase();

  return toLowerCase.includes("secret") || toLowerCase.includes("password");
}
