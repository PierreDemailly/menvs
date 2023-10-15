// Import Node.js Dependencies
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Import Third-party Dependencies
import { question, confirm, required, multiselect, select } from "@topcli/prompts";
import { green } from "kleur/colors";

// Import Third-party Dependencies
import * as utils from "./utils.js";

export async function update() {
  const configName = await select("Choose the config you wanna update", {
    choices: utils.availableConfigs()
  });

  const { config, usedBy } = JSON.parse(
    fs.readFileSync(utils.configJSONPath(configName), "utf-8")
  );
  const env = fs.readFileSync(utils.configEnvPath(configName), "utf-8");

  const keysToUpdate = await multiselect("Choose keys to update", {
    choices: config.map((envConfig) => {
      const labelValue = envConfig.isSecret ? "CONFIDENTIAL" : envConfig.value;

      return {
        value: envConfig,
        label: `${envConfig.key} (${labelValue})`
      };
    })
  });

  const formattedConfig = structuredClone(config);
  for (const envConfig of keysToUpdate) {
    const updateScope = await multiselect("What do you wanna update ?", {
      choices: [
        {
          value: "key",
          label: `key (${envConfig.key})`
        },
        {
          value: "value",
          label: `value (${envConfig.value})`
        }
      ]
    });

    if (updateScope.length === 0) {
      console.log(`Skip update for env ${envConfig.key}`);
      continue;
    }

    const conf = formattedConfig.find((conf) => conf.key === envConfig.key);
    for (const scope of updateScope) {
      if (scope === "key") {
        conf.key = await question("Choose the new key", { validators: [required()] });
      }
      else if (scope === "value") {
        conf.value = await question("Choose the new value", {
          validators: [required()],
          secure: utils.isKeySecret(envConfig.key)
        });
      }
    }
  }

  const removeEnv = await confirm("Do you wanna remove variable ?");
  if (removeEnv) {
    const envToRemove = await multiselect("Choose the variables to remove", {
      choices: formattedConfig.map((envConfig) => {
        return {
          value: envConfig,
          label: `${envConfig.key} (${envConfig.value})`
        };
      })
    });

    for (const envConfig of envToRemove) {
      formattedConfig.splice(formattedConfig.indexOf(envConfig), 1);
    }
  }

  while (true) {
    const addNewEnv = await confirm("Do you wanna add a new variable ?");
    if (!addNewEnv) {
      break;
    }

    const newEnvKey = await question("Choose the new key", { validators: [required()] });
    const newEnvValue = await question("Choose the new value", {
      validators: [required()],
      secure: utils.isKeySecret(newEnvKey)
    });

    formattedConfig.push({
      key: newEnvKey,
      value: newEnvValue,
      isSecret: utils.isKeySecret(newEnvKey)
    });
  }

  fs.writeFileSync(
    utils.configEnvPath(configName),
    Object.values(formattedConfig).map((env) => `${env.key}=${env.value}`)
      .join(os.EOL)
  );

  const confPathsToUpdate = await multiselect("Choose configs to update", {
    choices: usedBy
  });

  for (const usedByPath of usedBy) {
    if (confPathsToUpdate.includes(usedByPath)) {
      const envPath = path.join(usedByPath, ".env");

      fs.writeFileSync(
        envPath,
        Object.values(formattedConfig)
          .map((env) => `${env.key}=${env.value}`)
          .join(os.EOL)
      );

      console.log(green(`Successfully updated the config ${envPath}!`));
    }
  }

  fs.writeFileSync(
    utils.configJSONPath(configName),
    JSON.stringify({
      config: formattedConfig,
      usedBy: usedBy.filter((path) => confPathsToUpdate.includes(path))
    }, null, 2)
  );

  console.log(green(`Successfully updated the config ${configName}!`));
}
