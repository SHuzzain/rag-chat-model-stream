import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import node from "eslint-plugin-n";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    plugins: { n: node },
    rules: {
      "prefer-template": "error",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "n/no-process-env": "error",
    },
  },
  {
    files: ["lib/env.ts", "script/**/*.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
]);

export default eslintConfig;
