import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": ["error",
        {name:"confirm",message:"Use confirmAction para a confirmação visual FormFisik."},
        {name:"prompt",message:"Use requestInput para coletar uma justificativa."},
        {name:"alert",message:"Use o feedback compartilhado da FormFisik."}],
      "no-restricted-properties": ["error",
        {object:"window",property:"confirm",message:"Use confirmAction."},
        {object:"window",property:"prompt",message:"Use requestInput."},
        {object:"window",property:"alert",message:"Use toast."},
        {object:"globalThis",property:"confirm",message:"Use confirmAction."},
        {object:"globalThis",property:"prompt",message:"Use requestInput."},
        {object:"globalThis",property:"alert",message:"Use toast."}]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
  ]),
]);

export default eslintConfig;
