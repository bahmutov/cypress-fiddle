# @bahmutov/cypress-fiddle [![renovate-app badge][renovate-badge]][renovate-app] ![cypress version](https://img.shields.io/badge/cypress-12.5.1-brightgreen) [![ci](https://github.com/bahmutov/cypress-fiddle/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/bahmutov/cypress-fiddle/actions/workflows/ci.yml)

> Generate Cypress tests live from HTML and JS

Instantly experiment with Cypress tests by creating a tiny live HTML fiddle and running E2E tests against it.

![runExample test](images/runExample.png)

## Install

Cypress is a peer dependency of this module. Install the current version of Cypress by running `npm i -D cypress`.

After installing Cypress, install this module via npm:

```shell
npm i -D @bahmutov/cypress-fiddle
```

Then load the custom command by adding the following line to `cypress/support/index.js`

```js
// adds "cy.runExample()" command
import '@bahmutov/cypress-fiddle'
```

## Use

### Create a single test

You can take an object with an `html` property containing HTML and a `test` property containing Cypress commands and run the tests.

For example in the `cypress/e2e/spec.js` file:

```js
// loads TypeScript definition for Cypress
// and "cy.runExample" custom command
/// <reference types="@bahmutov/cypress-fiddle" />

const helloTest = {
  html: `
    <div>Hello</div>
  `,
  test: `
    cy.get('div').should('have.text', 'Hello')
  `,
}

it('tests hello', () => {
  cy.runExample(helloTest)
})
```

Which produces

![runExample test](images/runExample.png)

### Parameters

The test object can have multiple properties, see [src/index.d.ts](src/index.d.ts) for all.

- `test` JavaScript with Cypress commands, required

The rest of the properties are optional

- `html` to mount as DOM nodes before the test begins
- `name` the name to display at the top of the page, otherwise the test title will be used
- `description` extra test description under the name, supports Markdown via [safe-marked](https://github.com/azu/safe-marked)
- `commonHtml` is extra HTML markup to attach to the live HTML (if any) element. Useful for loading external stylesheets or styles without cluttering every HTML block
- `meta` lets you include additional meta tags into the `<HEAD>` element of the page
- `fullDocument` lets you avoid limiting your test commands to be within the mounted live HTML

The next properties are NOT used by `cy.runExample` but are used by the `testExamples` function from this package.

- `skip` creates a skipped test with `it.skip`
- `only` creates an exclusive test with `it.only`
- `order` controls which widgets are shown in the map: 'test', 'html', 'live'

### Included scripts

- [jQuery minified](https://code.jquery.com/)
- [Highlight.js](https://highlightjs.org/)

You can include your own additional scripts by using environment variable block in `cypress.json` file

```json
{
  "env": {
    "cypress-fiddle": {
      "scripts": [
        "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
      ]
    }
  }
}
```

### Styles

Sometimes you want to inject external stylesheets and maybe custom style CSS into the frame (we already include Highlight.js). Pass additional CSS link urls and custom styles through environment variables in `cypress.json` config file.

```json
{
  "env": {
    "cypress-fiddle": {
      "stylesheets": [
        "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
      ],
      "style": "body { padding: 1rem; }"
    }
  }
}
```

**Tip:** it is more convenient to set multiline environment variables or even load CSS files from plugins file.

### Create multiple tests

Instead of writing the `cy.runExample()` command one by one, you can collect all test definitions into a list or a nested object of suites and create tests automatically.

For example, here is a list of tests created from an array:

```js
import { testExamples } from '@bahmutov/cypress-fiddle'

const tests = [
  {
    name: 'first test',
    description: 'cy.wrap() example',
    test: `
      cy.wrap('hello').should('have.length', 5)
    `,
  },
  {
    name: 'second test',
    description: 'cy.wrap() + .then() example',
    test: `
        cy.wrap()
          .then(() => {
            cy.log('In .then')
          })
      `,
  },
]
testExamples(tests)
```

![List of tests](images/list.png)

While working with tests, you can skip a test or make it exclusive. For example to skip the first test add a `skip: true` property.

```js
{
  name: 'first test',
  description: 'cy.wrap example',
  skip: true
  ...
}
```

Or run just a single test by using the `only: true` property.

```js
{
  name: 'first test',
  description: 'cy.wrap example',
  only: true
  ...
}
```

You can create suites by having nested objects. Each object becomes either a suite or a test.

```js
import { testExamples } from '@bahmutov/cypress-fiddle'
const suite = {
  'parent suite': {
    'inner suite': [
      {
        name: 'a test',
        html: `
          <div id="name">Joe</div>
        `,
        test: `
          cy.contains('#name', 'Joe')
        `,
      },
    ],
    'list test': {
      html: `
        <ul>
          <li>Alice</li>
          <li>Bob</li>
          <li>Cory</li>
        </ul>
      `,
      test: `
        cy.get('li').should('have.length', 3)
          .first().should('contain', 'Alice')
      `,
    },
  },
}

testExamples(suite)
```

![Tree of tests](images/tree.png)

Find more examples in [cypress/e2e](cypress/e2e) folder.

### Markdown

This package includes a JS/CoffeeScript/Markdown preprocessor that can find and run tests in `.md` files. Just surround the tests with HTML comments like this:

    <!-- fiddle Test name here -->
    Add additional text if you want. HTML code block is optional.

    ```html
    <div>Example</div>
    ```

    Test code block that should be run as a test
    ```js
    cy.contains('Bye').should('be.visible')
    ```
    <!-- fiddle-end -->

See example [bahmutov/vuepress-cypress-test-example](https://github.com/bahmutov/vuepress-cypress-test-example) and [live site](https://vuepress-cypress-test-example.netlify.com/). Read blog posts [Run End-to-end Tests from Markdown Files](https://glebbahmutov.com/blog/cypress-fiddle/) and [Self-testing JAM pages](https://www.cypress.io/blog/2019/11/13/self-testing-jam-pages/).

You can have common HTML block and split the test across multiple JavaScript code blocks. This is useful to explain the test step by step

    This test has multiple parts. First, it confirms the string value
    ```js
    cy.wrap('first').should('equal', 'first')
    ```
    Then it checks if 42 is 42
    ```js
    cy.wrap(42).should('equal', 42)
    ```

The actual test to be executed will be

```js
cy.wrap('first').should('equal', 'first')
cy.wrap(42).should('equal', 42)
```

### Skip and only

You can skip a fiddle, or run only a particular fiddle similar to `it.skip` and `it.only`

```
<!-- fiddle.skip this is a skipped test -->
<!-- fiddle.only this is an exclusive test -->
```

**Note:** there is also `fiddle.export` modifier. These fiddles are skipped during normal testing from Markdown, but exported and enabled in the output JavaScript specs.

### Page title

If the Markdown file has page title line like `# <some text>`, it will be used to create the top level suite of tests

```js
describe('<some text>', () => {
  // tests
})
```

### Nested suites

You can put a fiddle into nested suites using `/` as a separator

```
<!-- fiddle Top / nested / test -->
```

Will create

```js
describe('Top', () => {
  describe('nested', () => {
    it('test', () => {})
  })
})
```

### Multiple HTML fragments

You can pass multiple HTML blocks via an array

    // single html code block
    {
      html: '<div id="greeting">Hello</div>'
    }
    // multiple html code blocks
    // are concatenated
    {
      html: [
        '<div id="greeting">Hello</div>',
        '<div id="name">World</div>'
      ]
    }

### Hide HTML fragment

You can hide an HTML fragment to avoid including it in the HTML source shown on the page. The hidden HTML is still included in the live HTML block. Each code block must be an object with the `source` property and `hide: true|false` property.

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
    ]

### Live HTML

You can include "live" html blocks in the fiddle - in that case they will become the test fragment.

    <!-- fiddle includes live html -->
    <div id="live-block">Live Block</div>
    ```js
    cy.contains('#live-block', 'Live Block').should('be.visible')
    ```
    <!-- fiddle-end -->

When including HTML source fragment and live HTML block, live HTML block wins and will be used as the test fragment.

    <!-- fiddle includes both live and html block -->
    ```html
    <div id="my-block">Block</div>
    ```

    <div id="live-block">Live Block</div>

    ```js
    // when including both live HTML block and
    // html code block, the live HTML block wins
    cy.contains('#live-block', 'Live Block').should('be.visible')
    cy.contains('#my-block', 'Block').should('not.exist')
    ```
    <!-- fiddle-end -->

### Common Live HTML

If you have common HTML to load before the live HTML block, but do not want to show it in the HTML snippet, put it into a comment like this

    <!-- fiddle-markup
    <link rel="stylesheet" href="some CSS URL">
    <style>
    body {
      padding: 2rem;
    }
    </style>
    -->

You can load styles and external CDN scripts using this approach.

### Hide JS block

You can pass `testShown` in the fiddle object to show that code (or no JS block at all) in the HTML page

```js
const test = {
  html: '...',
  test: '...',
  // hide the test block completely
  testShown: null,
}
```

Show something else to the user

```js
const test = {
  html: '...',
  test: '...',
  testShown: '// test code snippet',
}
```

### CSS block

You can apply CSS style to the HTML without showing it on the page

```js
const test = {
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
}
cy.runExample(test)
```

### Hiding fiddle in Markdown

You can "hide" fiddle inside Markdown so the page _can test itself_. See [cypress/e2e/hidden-fiddle.md](cypress/e2e/hidden-fiddle.md) example.

**Markdown**

![Hidden fiddle Markdown](images/hidden-fiddle.png)

**Rendered page**

![Hidden fiddle Markdown preview](images/hidden-fiddle-preview.png)

Notice how only the summary is displayed

**Test runner**

![Hidden fiddle test](images/hidden-fiddle-test.png)

**Note:** by default the summary element is displayed in the HTML. You can the fiddle completely using

```html
<details style="display:none">...</details>
```

#### Installation

In your plugins file use

```js
const mdPreprocessor = require('@cypress/fiddle/src/markdown-preprocessor')
module.exports = (on, config) => {
  on('file:preprocessor', mdPreprocessor)
}
```

And in `cypress.json` file allow Markdown files

```json
{
  "testFiles": "*.md"
}
```

Warning: [issue #5401](https://github.com/cypress-io/cypress/issues/5401)

## Debug

To see debug logs, use `DEBUG=@bahmutov/cypress-fiddle` when running Cypress.

## Small print

I wrote this plugin first in [cypress-io/cypress-fiddle](https://github.com/bahmutov/cypress-fiddle) and then continued development in this repo.

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2022

- [@bahmutov](https://twitter.com/bahmutov)
- [glebbahmutov.com](https://glebbahmutov.com)
- [blog](https://glebbahmutov.com/blog)
- [videos](https://www.youtube.com/glebbahmutov)
- [presentations](https://slides.com/bahmutov)
- [cypress.tips](https://cypress.tips)
- [Cypress Advent 2021](https://cypresstips.substack.com/)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cypress-data-session/issues) on Github

## MIT License

Copyright (c) 2022 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/
