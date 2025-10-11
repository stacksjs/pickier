/* eslint-disable no-console */
// Helper to create consistent pickier mocks across all tests
// Since bunfig is always available, pickier should have all these methods

export function createPickierMock(overrides: Partial<any> = {}) {
  return {
    defaultConfig: {},
    formatCode: (text: string) => text,
    lintText: async () => [],
    runLintProgrammatic: async () => ({ errors: 0, warnings: 0, issues: [] }),
    runLint: async () => { console.log(JSON.stringify({ errors: 0, warnings: 0, issues: [] })) },
    ...overrides,
  }
}
