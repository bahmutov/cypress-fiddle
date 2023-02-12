/// <reference types="../.." />
import { source } from 'common-tags'

it('lets you hide the only html block', () => {
  const test = {
    description: 'One hidden HTML block',
    html: [
      {
        source: source`
          <div id="greeting">Hello</div>
        `,
        hide: true,
      },
    ],
    test: source`
      cy.get('div#greeting').should('have.text', 'Hello')
      // includes the live HTML section
      cy.contains('h2', 'Live HTML').should('be.visible')
      // does not include HTML source code
      cy.contains('h2', /^HTML$/).should('not.exist')
    `,
    fullDocument: true,
  }
  cy.runExample(test)
})
