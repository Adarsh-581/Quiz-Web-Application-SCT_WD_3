module.exports = {
  testEnvironment: 'node',
  verbose: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  rootDir: '.',
  moduleDirectories: ['node_modules', '.'],
  moduleNameMapper: {
    '^@db/(.*)$': '<rootDir>/db/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
}; 