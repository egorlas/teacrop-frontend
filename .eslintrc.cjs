/* ESLint config for Next.js + TypeScript */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      ecmaFeatures: { jsx: true }
    },
    plugins: ["@typescript-eslint", "unused-imports", "import", "react", "react-hooks"],
    extends: ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
    rules: {
      "unused-imports/no-unused-imports": "error",
      "import/order": [
        "warn",
        {
          "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          "alphabetize": { "order": "asc", "caseInsensitive": true },
          "newlines-between": "always"
        }
      ]
    },
    settings: {
      "import/resolver": { "typescript": {}, "node": {} }
    }
  };
  