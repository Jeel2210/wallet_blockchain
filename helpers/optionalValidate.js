const { validate: expValidate } = require('express-validation');

/**
 * This schema ALLOWS unknown parameters.
 * @param  {{body: {}, params: {}, query}[]} schema - Provide multiple joi schema objects eg. schema for query strings, body or params etc..
 */
function optionalValidate(...schema) {
  return schema.map(el => {
    return expValidate(el, { keyByField: true }, { abortEarly: false, errors: { escapeHtml: false }, allowUnknown: true });
  })
}


module.exports = optionalValidate;