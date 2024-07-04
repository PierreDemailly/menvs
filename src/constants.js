// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";

// CONSTANTS
const kFolderName = process.env.MENVS_FOLDER ?? ".menvs";

export const MENVS_CONFIGS_PATH = path.join(os.homedir(), kFolderName);
