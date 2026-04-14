module.exports = {
  testEnvironment: "node",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: ".",
        outputName: "test-results.xml",
      },
    ],
  ],
};

