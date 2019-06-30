/*
 * css is from reworkcss/css: https://github.com/reworkcss/css#readme . it's a 'CSS parser / 
 * stringifier for Node.js'. this package is only used in one place - 
 * const getCSS = () => css.parse(getStyle()); .
 */
const css = require('css');
const { ServerStyleSheet, __PRIVATE__ } = require('styled-components');

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
