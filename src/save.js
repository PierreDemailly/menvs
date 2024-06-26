// Import Node.js Dependencies
import fs from "node:fs";

// Import Third-party Dependencies
import { question, multiselect } from "@topcli/prompts";
import { green } from "kleur/colors";

// Import Internal Dependencies
import * as utils from "./utils.js";

export async function save() {
  const dotenv = fs.readFileSync(".env", { encoding: "utf-8" });
  if (!dotenv) {
    throw new Error(".env is empty");
  }

  const envs = dotenv.split(/\r?\n/).flatMap((line) => {
    if (!line || line.startsWith("#")) {
      return [];
    }

    const [key, ...values] = line.split("=");
    const value = values.join("=");

    return {
      key,
      value,
      isSecret: utils.isKeySecret(key)
    };
  });

  const configName = await question("Name of the configuration");

  const selectedEnvs = await multiselect("Choose dynamic envs", {
    choices: envs.map((env) => {
      return {
        name: env.key,
        value: env,
        label: env.key
      };
    })
  });

  for (const selectedEnv of selectedEnvs) {
    const desc = await question(`Description for ${selectedEnv.key}`);
    envs.find((env) => env.key === selectedEnv.key).desc = desc;
  }

  fs.writeFileSync(utils.configEnvPath(configName), dotenv);
  fs.writeFileSync(utils.configJSONPath(configName), JSON.stringify({
    config: envs,
    usedBy: [process.cwd()]
  }, null, 2));

  console.log(green(`Configuration ${configName} saved!`));
}
