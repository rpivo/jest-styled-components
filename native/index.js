
/* 
 * imports the toHaveStyleRule() function found in ../src/native/toHaveStyleRule. This function is 
 * then tested with expect below.
 */
const toHaveStyleRule = require('../src/native/toHaveStyleRule')

/*
 * expect provides matchers that you can use to check that values meet certain conditions. adds the
 * custom matcher toHaveStyleRule. here, we're passing in the function toHaveStyleRule(), which is 
 * stored in ../src/native/toHaveStyleRule. 
 */
expect.extend({ toHaveStyleRule })
