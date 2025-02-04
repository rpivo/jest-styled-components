/*
 * css is from reworkcss/css: https://github.com/reworkcss/css#readme . it's a 'CSS parser / 
 * stringifier for Node.js'. this package is only used in one place - 
 * const getCSS = () => css.parse(getStyle()); .
 */
const css = require('css');
/*
 * imports ServerStyleSheet and __PRIVATE__ from styled-components.
 * 
 * with projects that employ server side rendering (SSR), styled-components provides a way to
 * rehydrate everything with a stylesheet using ServerStyleSheet.
 */
const { ServerStyleSheet, __PRIVATE__ } = require('styled-components');

/*
 * if the __PRIVATE__ import was not destructured from styled-components, throw an error. 
 */
if (!__PRIVATE__) {
  throw new Error('Could neither find styled-components secret internals');
}

const { masterSheet } = __PRIVATE__;

const isServer = () => typeof document === 'undefined';

const resetStyleSheet = () => {
  masterSheet.names = new Map();
  masterSheet.clearTag();
};

const getHTML = () => (isServer() ? new ServerStyleSheet().getStyleTags() : masterSheet.toString());

const extract = regex => {
  let style = '';
  let matches;

  while ((matches = regex.exec(getHTML())) !== null) {
    style += `${matches[1]} `;
  }

  return style.trim();
};

const getStyle = () => extract(/^(?!data-styled\.g\d+.*?\n)(.*)?\n/gm);
/*
 * reworkcss/css is used here -- css.parse() accepts a CSS string and returns an AST object. AST is
 * Abstract Syntax Trees. So, css.parse() returns an Abstract Syntax Tree object. 
 * 
 * an abstract syntax tree is a hierarchical program representation that presents source code
 * structure according to teh grammar of a programming language. Each AST node corresponds to an
 * item of the source code. See https://astexplorer.net/
 * 
 * we pass in the result of getStyle() as the data to be turned into an Abstract Syntax Tree by
 * reworkcss/css's parse().
 * 
 * reworkscss/css has another method called stringify() that takes in an AST object. That method
 * isn't used in this file, but is used elsewhere in this package inside ./styleSheetSerializer.js.
 */
const getCSS = () => css.parse(getStyle());

const getHashes = () => {
  const hashes = new Set();

  for (const [masterHash, childHashSet] of masterSheet.names) {
    hashes.add(masterHash);

    for (const childHash of childHashSet) hashes.add(childHash);
  }

  return Array.from(hashes);
};

const buildReturnMessage = (utils, pass, property, received, expected) => () =>
  `${utils.printReceived(
    !received && !pass ? `Property '${property}' not found in style rules` : `Value mismatch for property '${property}'`
  )}\n\n` +
  'Expected\n' +
  `  ${utils.printExpected(`${property}: ${expected}`)}\n` +
  'Received:\n' +
  `  ${utils.printReceived(`${property}: ${received}`)}`;

const matcherTest = (received, expected) => {
  try {
    const matcher = expected instanceof RegExp ? expect.stringMatching(expected) : expected;

    expect(received).toEqual(matcher);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  resetStyleSheet,
  getCSS,
  getHashes,
  buildReturnMessage,
  matcherTest,
};
