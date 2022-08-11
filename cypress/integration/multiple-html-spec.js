/// <reference types="../.." />
import { source } from 'common-tags'

it('test with multiple html code blocks', () => {
  const test = {
    description: 'This test has multiple HTML blocks',
    html: [
      source`
        <div id="greeting">Hello</div>
      `,
      source`
        <div id="name">World</div>
      `,
    ],
    test: source`
      cy.get('div#greeting').should('have.text', 'Hello')
      cy.get('div#name').should('have.text', 'World')
    `,
  }
  cy.runExample(test)
})

it('some html code blocks are live but hidden', () => {
  const test = {
    description: 'This test has multiple HTML blocks',
    html: [
      source`
        <div id="greeting">Hello</div>
      `,
      {
        source: source`
          <div id="name">World</div>
        `,
        // do not show the source code this html block
        // but still include it in the live html app
        hide: true,
      },
    ],
    test: source`
      cy.get('div#greeting').should('have.text', 'Hello')
      cy.get('div#name').should('have.text', 'World')
      // check the HTML source shown on the page
      // it should not show the hidden HTML code block
      cy.get('#html')
        .should('include.text', '<div id="greeting">Hello</div>')
        .and('not.include.text', 'World')
    `,
    fullDocument: true,
  }
  cy.runExample(test)
})
