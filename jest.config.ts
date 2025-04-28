module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__test__/**/*.ts'],

    // Slow test reporter
    reporters: [
        "default",
        [ "jest-slow-test-reporter", {
            numTests: 10,            // show top-10 slowest tests
            warnOnSlowerThan: 500    // flag tests slower than 500ms
        }]
      ]
};