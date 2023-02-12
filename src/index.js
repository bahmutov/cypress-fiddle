/// <reference path="./index.d.ts" />
// @ts-check

const { createMarkdown } = require('safe-marked')
const markdown = createMarkdown()

Cypress.Commands.add('runExample', (options) => {
  const {
    name,
    description,
    meta,
    commonHtml,
    html,
    css,
    test,
    fullDocument,
  } = options
  // we will show only some html, but run it all
  let htmlSource = ''
  let liveHtml = ''

  // the components to include on the page
  const order = options.order || ['test', 'html', 'live']
  const testTitle =
    name ||
    // @ts-ignore
    cy.state('runnable').title

  if (typeof test !== 'string' || !test) {
    expect(test, 'must have test source').to.be.a('string')
  }

  if (typeof html === 'string') {
    // the user specified HTML block
    htmlSource = html
    liveHtml = html
  } else if (Array.isArray(html)) {
    html.forEach((htmlPart) => {
      if (typeof htmlPart === 'string') {
        htmlSource += htmlPart + '\n'
        liveHtml += htmlPart + '\n'
      } else {
        // the html part is an object
        if (typeof htmlPart.source !== 'string') {
          throw new Error('Missing html source property')
        }
        liveHtml += htmlPart.source + '\n'
        if (!htmlPart.hide) {
          htmlSource += htmlPart.source + '\n'
        }
      }
    })
  }

  const fullLiveHtml = commonHtml ? commonHtml + '\n' + liveHtml : liveHtml

  const fiddleOptions = Cypress._.defaults({}, Cypress.env('cypress-fiddle'), {
    meta,
    fullDocument,
    stylesheets: [],
    style: '',
    scripts: [],
  })

  // take a single stylesheet URL or a list
  let stylesheetsHtml = ''
  if (typeof fiddleOptions.stylesheets === 'string') {
    fiddleOptions.stylesheets = [fiddleOptions.stylesheets]
  }
  if (Array.isArray(fiddleOptions.stylesheets)) {
    stylesheetsHtml = fiddleOptions.stylesheets
      .map((url) => `<link rel="stylesheet" href="${url}">`)
      .join('\n')
  }

  // let the user specify additional meta tags
  let metaHtml = ''
  if (typeof fiddleOptions.meta === 'string') {
    fiddleOptions.meta = [fiddleOptions.meta]
  }
  if (Array.isArray(fiddleOptions.meta)) {
    metaHtml = fiddleOptions.meta.map((s) => s.trim()).join('\n')
  }

  // take a single script URL or a list
  let scriptsHtml = ''
  if (typeof fiddleOptions.scripts === 'string') {
    fiddleOptions.scripts = [fiddleOptions.scripts]
  }
  if (Array.isArray(fiddleOptions.scripts)) {
    scriptsHtml = fiddleOptions.scripts
      .map((url) => `<script src="${url}"></script>`)
      .join('\n')
  }

  let style = ''
  if (typeof fiddleOptions.style === 'string' && fiddleOptions.style) {
    style = `<style>\n${fiddleOptions.style}\n</style>`
  }
  if (typeof css === 'string' && css) {
    style += '\n' + `<style>\n${css}\n</style>`
  }

  // console.log('order', order)
  // console.log('htmlSource', htmlSource)
  // console.log('liveHTML', liveHtml)
  // console.log('fullLiveHtml', fullLiveHtml)

  // really dummy way to see if the test code contains "cy.visit(...)"
  // because in that case we should not use "cy.within" or mount html
  const isTestingExternalSite = test.includes('cy.visit(')
  if (!isTestingExternalSite) {
    let htmlSection = ''
    if (fullLiveHtml) {
      if (order.includes('html') && htmlSource) {
        htmlSection = `
          <h2>HTML</h2>
          <div id="html">
            <pre><code class="html">${Cypress._.escape(htmlSource)}</code></pre>
          </div>
        `
      }
      if (order.includes('live')) {
        htmlSection +=
          '\n' +
          `
          <h2>Live HTML</h2>
          <div id="live">
            ${fullLiveHtml}
          </div>
        `
      }
    } else {
      htmlSection = '<div id="live"></div>'
    }

    // TODO: allow simple markup, properly convert it
    const descriptionHtml = markdown(description || '')

    let testBlock = ''
    if (order.includes('test')) {
      if ('testShown' in options) {
        if (options.testShown) {
          testBlock = `
            <h2>Test code</h2>
            <pre id="test-code"><code class="javascript">${Cypress._.escape(
              options.testShown,
            )}</code></pre>
          `
        }
        // else do not show any JavaScript code
      } else {
        testBlock = `
          <h2>Test code</h2>
          <pre id="test-code"><code class="javascript">${Cypress._.escape(
            test,
          )}</code></pre>
        `
      }
    }

    const appHtml = `
    <head>
      <meta charset="UTF-8">
      ${metaHtml}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.9/styles/github.min.css">
      ${stylesheetsHtml}
      ${style}
      <script src="https://code.jquery.com/jquery-3.5.0.min.js"
        integrity="sha256-xNzN2a4ltkB44Mc/Jz3pT4iU1cmeR0FkXs4pru/JxaQ="
        crossorigin="anonymous"></script>
      <script charset="UTF-8" src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.9/highlight.min.js"></script>
      <script>hljs.initHighlightingOnLoad();</script>
      ${scriptsHtml}
    </head>
    <body>
      ${testTitle ? `<h1>${testTitle}</h1>` : ''}
      <div>${descriptionHtml}</div>
      ${testBlock}
      ${htmlSection}
    </body>
  `

    // @ts-ignore
    const document = cy.state('document')

    // make sure when "eval" runs, the "window" in the test code
    // points at the application's iframe window object
    // @ts-ignore
    const window = cy.state('window')
    if (!window.Cypress) {
      // also set "window.Cypress" before loading "live" HTML
      // so when it runs, it can check if it's inside Cypress test
      window.Cypress = Cypress
    }

    document.write(appHtml)
    document.close()

    // compiling the Markdown to get the playground
    // often takes a few extra seconds on the first pass
    const noLog = { log: false, timeout: 10000 }

    if (fiddleOptions.fullDocument) {
      // run "full" test
      eval(test)
    } else {
      cy.get('#live', noLog).within(noLog, () => {
        const insideFunction = '(function live() {\n' + test + '\n}).call(this)'
        if (!window.onerror) {
          // if the application throws an error, catch it and
          // rethrow to fail the test
          window.onerror = (err) => {
            throw err
          }
        }
        eval(insideFunction)
      })
    }
  } else {
    // testing an external site, just run the test code
    if (html) {
      throw new Error(
        'You have passed HTML block for this test, but also used cy.visit in the test, which one is it?',
      )
    }
    // run "full" test
    eval(test)
  }
})

const { forEach } = Cypress._

const isTestObject = (o) => 'test' in o

const createTest = (name, test) => {
  name = name || test.name
  if (!name) {
    console.error({ name, test })
    throw new Error('Could not determine test name from ' + name)
  }

  if (test.skip && test.only) {
    throw new Error(
      `Test "${name}" has both skip: true and only: true, which is impossible`,
    )
  }

  if (test.skip || test.export) {
    console.log('skipping test "%s"', name)
    it.skip(name, () => {
      cy.runExample(test)
    })
    return
  }

  if (test.only) {
    console.log('exclusive test "%s"', name)
    it.only(name, () => {
      cy.runExample(test)
    })
    return
  }

  it(name, function () {
    cy.runExample(test)
  })
}

/**
 * Processes a tree of test definitions, each with HTML and JS
 * and makes each into a live test. See examples in "integration" folder.
 */
const testExamples = (maybeTest) => {
  // for debugging
  // console.log('testExamples', { maybeTest })

  if (isTestObject(maybeTest)) {
    createTest(maybeTest.name, maybeTest)
    return
  }

  if (Array.isArray(maybeTest)) {
    // console.log('list of tests')
    maybeTest.forEach((test) => {
      if (isTestObject(test)) {
        createTest(test.name, test)
      } else {
        testExamples(test)
      }
    })
    return
  }

  forEach(maybeTest, (value, name) => {
    // console.log({ name, value })

    if (isTestObject(value)) {
      // console.log('%s is a test', name)

      if (value.skip && value.only) {
        throw new Error(`Test ${name} has both skip and only true`)
      }

      createTest(name, value)
      return
    }

    // final choice - create nested suite of tests
    // console.log('creating new suite "%s"', name)
    if (typeof name !== 'string') {
      console.error('Invalid test name (typeof %s): "%s"', typeof name, name)
      console.error({ maybeTest, value, name })
      throw new Error(`Invalid test name ${name}`)
    }

    describe(name, () => {
      testExamples(value)
    })
  })
}

module.exports = { testExamples }
