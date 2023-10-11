#!/usr/bin/env node

// Import Node.js Dependencies
import fs, { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

// Import Third-party Dependencies
import meow from "meow";
import { magenta, red, bold } from "kleur/colors";
import { multiselect, question } from "@topcli/prompts";

// Import Internal Dependencies
import * as commandHandlers from "../src/index.js";
import { MENV_PATH } from "../src/constants.js";

if (!existsSync(MENV_PATH)) {
  try {
    fs.mkdirSync(MENV_PATH);
  }
  catch (error) {
    throw new Error("Could not create .menvs directory", {
      cause: error
    });
  }
}

const cli = meow(`
  Usage
    $ menvs <command> <options>

  Commands
    save, s   \tSave a new configuration
    pick, p   \tPick a configuration
    list, l   \tList all configurations
    delete, d \tDelete a configuration
    show, sh  \tShow a configuration
    update, u \tUpdate a configuration

  Examples
    $ menvs save
    $ menvs pick
    $ menvs l
    $ menvs d
    $ menvs show
    $ menvs update
`, {
  importMeta: import.meta,
  allowUnknownFlags: false
});

const { input } = cli;

if (input.length > 1) {
  throw new Error("Expected only one command");
}

switch (input[0]) {
  case "save":
  case "s": {
    await commandHandlers.save();
    break;
  }
  case "pick":
  case "p": {
    await commandHandlers.pick();
    break;
  }
  case "list":
  case "l": {
    await commandHandlers.list();
    break;
  }
  case "delete":
  case "d": {
    await commandHandlers.del();
    break;
  }
  case "show":
  case "sh":
    await commandHandlers.show();
    break;
  case "update":
  case "u":
    await commandHandlers.update();
    break;
  default: {
    throw new Error("Invalid command");
  }
}
