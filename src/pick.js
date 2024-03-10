// Import Node.js Dependencies
import fs from "node:fs";

// Import Third-party Dependencies
import { question, confirm, select, required } from "@topcli/prompts";
import { green } from "kleur/colors";

// Import Internal Dependencies
import * as utils from "./utils.js";

export async function pick() {
  // verify a .env does not already exists
  try {
    fs.readFileSync(".env");
    const force = await confirm("A .env already exists, remove its content ?", { initial: false });
    if (!force) {
      return;
    }
  }
  catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  const configName = await select("Choose the config you wanna pick", {
    choices: utils.availableConfigs()
  });
  const { config } = JSON.parse(
    fs.readFileSync(
      utils.configJSONPath(configName),
      { encoding: "utf-8" }
    )
  );
  const dynamicEnvs = config.filter((env) => env.desc !== undefined);
  let env = fs.readFileSync(utils.configEnvPath(configName), { encoding: "utf-8" });

  for (const dynamicEnv of dynamicEnvs) {
    const value = await question(`Choose value for env ${dynamicEnv.key}${dynamicEnv.desc ? ` (${dynamicEnv.desc})` : ""}`, {
      validators: [required()],
      secure: utils.isKeySecret(dynamicEnv.key)
    });
    env = env.replace(`${dynamicEnv.key}=${dynamicEnv.value}`, `${dynamicEnv.key}=${value}`);
  }

  fs.writeFileSync(".env", env);

  console.log(green("Successfully picked the config!"));
}
