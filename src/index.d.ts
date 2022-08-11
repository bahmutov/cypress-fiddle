/// <reference types="cypress" />

type HTML = string
type HTMLS = HTML[]
type JavaScript = string
type FiddleComponent = 'html' | 'live' | 'test'

/**
 * Options for creating a single test fiddle.
 * @example
  ```
  {
    name: 'simple test',
    description: `
      This is the simplest test possible. Just finds an element by ID.
    `,
    html: `
      <div id="my-element">Hi there</div>
    `,
    test: `
      cy.get('#my-element')
    `
  }
  ```
 */
interface RunExampleOptions {
  name?: string

  /**
   * Optional description of the test. Supports Markdown via `nmd`
   * To open links in new window , use `[text](+url)` format.
   *
   * @type {string}
   * @memberof RunExampleOptions
   * @see https://github.com/Holixus/nano-markdown
   */
  description?: string
  meta?: string
  html?: HTML | HTMLS
  commonHtml?: HTML
  test: JavaScript
  // skip and only are exclusive - they cannot be both set to true
  skip?: boolean
  only?: boolean
  order?: FiddleComponent[]
  /**
   * Sometimes we want to mount the "full" html and give our
   * test access to the HEAD element. This flag is set to false
   * by default to limit the Cypress commands to act within the live
   * HTML block only. By setting to true you get the entire playground.
   */
  fullDocument?: boolean
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to generate a runnable test from HTML and JavaScript.
     */
    runExample(options: RunExampleOptions): Chainable<void>
  }
}
