export default {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['dist'],
  resetMocks: true,
  verbose: true,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/unit',
        outputName: 'unit-test-results.xml',
      },
    ],
  ],
  collectCoverage: true,
  coverageDirectory: 'reports/unit',
  coveragePathIgnorePatterns: ['src/generated', 'src/dev'],
  coverageReporters: ['text', 'cobertura', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  testEnvironment: 'node',
}
