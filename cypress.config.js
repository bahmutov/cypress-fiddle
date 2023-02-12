const { defineConfig } = require('cypress')
// https://github.com/bahmutov/cypress-split
const cypressSplit = require('cypress-split')
const mdPreprocessor = require('./src/markdown-preprocessor')

module.exports = defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      cypressSplit(on, config)
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
