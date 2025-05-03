const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'tests/e2e/setupE2E.js',
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // Implementar eventos personalizados aqui
      return config
    },
  },
  env: {
    apiUrl: 'http://localhost:8000',
  },
})
