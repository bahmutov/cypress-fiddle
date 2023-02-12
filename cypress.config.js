const { defineConfig } = require('cypress')
const mdPreprocessor = require('./src/markdown-preprocessor')

module.exports = defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // find and run tests in JS or Markdown files
      on('file:preprocessor', mdPreprocessor)
      return config
    },
    specPattern: 'cypress/e2e/**/*.js',
    excludeSpecPattern: [
      'cypress/e2e/examples.js',
      'cypress/e2e/*-examples.js',
    ],
  },
})
