/// <reference types="../.." />
import { source } from 'common-tags'

it('lets you hide the JS block', () => {
  const test = {
    description: 'One hidden JS block',
    html: [
      {
        source: source`
          <div id="greeting">Hello</div>
        `,
      },
    ],
    test: source`
      cy.contains('div#greeting', 'Hello')
      // does not include JavaScript source code
      cy.contains('h2', 'Test code').should('not.exist')
    `,
    testShown: null,
    fullDocument: true,
  }
  cy.runExample(test)
})

it('lets you show some other JavaScript', () => {
  const test = {
    description: 'One hidden JS block',
    html: [
      {
        source: source`
          <div id="greeting">Hello</div>
        `,
      },
    ],
    test: source`
      cy.contains('div#greeting', 'Hello')
      // should show the hello comment
      cy.contains('h2', 'Test code').should('be.visible')
      cy.contains('#test-code', '// hello there')
    `,
    testShown: '// hello there',
    fullDocument: true,
  }
  cy.runExample(test)
})
