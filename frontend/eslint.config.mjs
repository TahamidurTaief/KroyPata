import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Load the base config
const baseConfig = compat.extends("next/core-web-vitals");

// Filter out TS-related config
const eslintConfig = baseConfig.filter(
  (config) =>
    !config.files?.some((f) => f.endsWith(".ts") || f.endsWith(".tsx")) &&
    config.parser !== "@typescript-eslint/parser"
);

export default eslintConfig;
