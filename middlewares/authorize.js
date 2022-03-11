const resPattern = require("../helpers/responsePattern");
const jwt = require('express-jwt');
const { errorMessage, parse } = require("../helpers/utils");
const config = require("../config");
const models = require('../models');


/**
 * @param {*} userTypes #### Valid values are
 * 		- [ 'SUPER_ADMIN', 'PARTNER', 'TRAINER', 'USER' ]
 * @param {*} credentialsRequired #### Scenario to set as false
 * 		- If some api don't need jwt in all cases
 * 		- If just need jwt token data for process but authentication is not required
 */
const authorize = (userTypes, credentialsRequired = true) => {
	try {
		return [
			jwt({ secret: config.token_secret, algorithms: ['HS256'], credentialsRequired }),
			async (req, res, next) => {
                try {
                    if (!credentialsRequired) return next();
                    const employeeExist = await models.employee.findOne({
                        where: {
                            employee_id: req.user.employee_id,
                            is_deleted: 0,
                            is_active: 1
                        },
                        transaction: req.tx
                    });
                    if (!employeeExist) errorMessage('Unauthorized.', true);
					else return next();
				} catch (error) {
					console.log(error);
					return next(new resPattern.failedResponse(errorMessage(error)));
				}
			}
		]
	} catch (error) {
		console.log("Err", error);
	}
};


module.exports = authorize;