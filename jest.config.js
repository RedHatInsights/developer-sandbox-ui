module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!src/**/stories/*'],
  coverageDirectory: './coverage/',
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/fileMock.js',
  },
  roots: ['<rootDir>/src/'],
  transformIgnorePatterns: ['/node_modules/(?!@redhat-cloud-services|@patternfly)'],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: [
    'node_modules',
    './src', //the root directory
  ],
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
};
