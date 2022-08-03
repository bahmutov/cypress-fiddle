/// <reference types="../.." />

import { source } from 'common-tags'

// this spec checks if the errors thrown in the application code
// or in the spec code attached as callbacks to the app
// really fail the test

// it should fail the test when the error is thrown
it.skip('fails this test', function () {
  const test = source`
    setTimeout(() => {
      throw new Error('Nope')
    }, 100);

    cy.wait(200)
  `

  cy.runExample({ test })
})

// if the console.stub throw an error
// the test fails
it.skip('thrown error in the callback', function () {
  const html = source`
    <script>
      setTimeout(() => {
        console.log('Random error')
      }, 100)
    </script>
  `

  const test = source`
    cy.window()
      .its('console')
      .then((console) => {
        cy.stub(console, 'log').callsFake(function (...args) {
          throw new Error('Nope')
        })
      })
    cy.wait(500)
  `

  cy.runExample({ html, test })
})

// this test should fail when enabled
// because the failed assertion should
// fail the test
it.skip('assertion fails callback', function () {
  const html = source`
    <script>
      setTimeout(() => {
        console.log('started')
        // change to 1 to see the test fail
        if (Math.random() < 1) {
          console.log('Random error')
        } else {
          console.log('All is good')
        }
      }, 100)
    </script>
  `

  const test = source`
    cy.window()
      .its('console')
      .then((console) => {
        cy.stub(console, 'log').callsFake((...args) => {
          args.forEach((arg) => {
            expect(arg).to.not.contain('error')
          })
          // all is good, call the original log method
          console.log.wrappedMethod(...args)
        })
      })

    cy.wait(500)
  `

  cy.runExample({ html, test })
})
