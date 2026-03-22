/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from "jest";
import dotenv from "dotenv";
import { pathsToModuleNameMapper } from "ts-jest";
dotenv.config({ path: "test.env" });
const config: Config = {
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
  roots: ["<rootDir>/"],
  testMatch: ["**/spec/**/?(*.)+(spec|test).+(ts|js)"],
  testEnvironment: "node",
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "css"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      {
        "@serv/*": ["./server/src/*"],
        "@src/*": ["./src/*"],
        "@app/*": ["./app/*"],
        "@shared/*": ["./shared/*"],
        "@utils/*": ["./utils/*"],
        "@scripts/*": ["./scripts/*"],
      },
      {
        prefix: "<rootDir>/",
      },
    ),
  },
};
export default config;
