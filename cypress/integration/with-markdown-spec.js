/// <reference types="../.." />
import { source } from 'common-tags'

const test = {
  description:
    'This **test** has _markdown_, thanks to [safe-marked](+https://github.com/azu/safe-marked)',
  html: source`
    <div id="greeting">Hello</div>
  `,
  test: source`
    cy.get('div#greeting').should('have.text', 'Hello')
  `,
}

it('test with markdown', () => {
  cy.runExample(test)
})
