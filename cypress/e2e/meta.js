/// <reference types="../.." />

import { source } from 'common-tags'

it('adds meta tags', function () {
  const meta = source`
    <meta name="author" content="Gleb Bahmutov">
  `

  const test = source`
    cy.get('head')
    cy.get('meta').should('have.length.greaterThan', 0)
    cy.get('head meta[charset]').should('have.attr', 'charset', 'UTF-8')
    cy.get('head meta[name=author]').should('have.prop', 'content').should('include', 'Gleb')
  `

  // because we pass the meta tags, we want to
  // find them from the entire page
  const fullDocument = true

  cy.runExample({ meta, test, fullDocument })
})
