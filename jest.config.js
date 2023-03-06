/**  @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/**.spec.ts'],
  transform: {
    "\\.[jt]sx?$": ["ts-jest", {"useESM": true}],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.[jt]s$': '$1',
  },
  extensionsToTreatAsEsm: [".ts"],
};

export default config;