import { source } from 'common-tags'
import { testExamples } from '../..'

const testAndLive = {
  name: 'custom order of components',
  html: source`
    <ul>
      <li data-cy="name">Bob</li>
      <li data-cy="name">Chris</li>
    </ul>
  `,
  test: source`
    // our application "fetches" data and changes the first item
    // from "Bob" to "Alice"
    setTimeout(() => {
      // simulate async change
      document.querySelector('li[data-cy=name]').innerText = 'Alice'
    }, 1000)

    // this retries until first item changes its text to "Alice"
    cy.contains('li[data-cy=name]:first', 'Alice')
  `,
  // show the test source followed by the live HTML
  // skip the title and the HTML source
  order: ['test', 'live'],
}

const justTest = {
  name: 'Just the test code',
  test: source`
    cy.wrap(1).should('equal', 1)
  `,
  order: ['test'],
}

const justHTML = {
  name: 'Just HTML and live app',
  html: '<div>Hello</div>',
  test: '',
  order: ['html', 'live'],
  only: false,
}

testExamples([testAndLive, justTest, justHTML])
