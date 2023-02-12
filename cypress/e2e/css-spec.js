/// <reference types="../.." />
import { source } from 'common-tags'

it('lets you use CSS blocks', () => {
  const test = {
    description: 'This test has a CSS block',
    html: source`
      <div id="greeting">Hello</div>
    `,
    css: source`
      #greeting {
        color: #f0f;
        padding: 1rem;
        font-weight: bold;
      }
    `,
    test: source`
      cy.get('div#greeting').should('have.text', 'Hello')
        .and('have.css', 'color', 'rgb(255, 0, 255)')
      // there is no CSS block
      cy.contains('pad' + 'ding').should('not.exist')
    `,
    fullDocument: true,
  }
  cy.runExample(test)
})
