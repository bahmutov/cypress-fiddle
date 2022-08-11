/// <reference types="../.." />
import { source } from 'common-tags'

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

it('test with markdown', () => {
  cy.runExample(test)
})
