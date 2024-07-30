import { posix } from "path";
const { join } = posix;

export const SRC_PATH = "src";
export const TS_CONFIG_PATH = join(SRC_PATH, "tsconfig.json");
export const BUILD_PATH = "build";

export const WATCHED_TS_TYPES = [
  join(SRC_PATH, "**", "*.ts")
];

export const EXPORT_REGEXP = /^(export\s{[^;]*};?)$/gm;
export const IMPORT_REGEXP = /^(import\s[^;]*";?)$/gm;
