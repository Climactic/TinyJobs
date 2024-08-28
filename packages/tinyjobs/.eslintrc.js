/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@tinyjobs/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
};
