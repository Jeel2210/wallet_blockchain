const { validate: expValidate } = require('express-validation');


/**
 * @param {Object} schema - Provide multiple joi schema objects eg. schema for query strings, body or params etc..z
 */
function validate(schema, allowUnknown = false) {
	return expValidate(schema, { keyByField: true }, { abortEarly: false, errors: { escapeHtml: false }, allowUnknown });
}


module.exports = validate;