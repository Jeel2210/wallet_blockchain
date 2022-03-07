const resPattern = require("../helpers/responsePattern");
const { errorMessage, validatePassword } = require("../helpers/utils");
const jwt = require("jsonwebtoken");
const config = require('../config');
const { Op } = require("sequelize");
const { parse } = require('../helpers/utils');
const models = require("../models");



/**
 * @param {Object} req 
 * @param {Object} req.body
 * @param {string} req.body.password
 * @param {string} req.body.login
 */
const signIn = async (req, res, next) => {
	try {
		let userDetails = await models.user.findOne({
			include: [{ model: models.wallet, as: 'wallet', attributes: ['balance','wallet_id','public_key'] }],
			attributes: ['user_id','name','email','password','role'],
			where: {
				name: req.body.name,
				is_active: true,
				is_deleted: false,
			},
			transaction: req.tx
		});

		if (!userDetails) errorMessage('Invalid email or password. Please try again.', true);

		let validPassword = validatePassword(userDetails.password, req.body.password);
		if (!validPassword) errorMessage('Invalid email or password.', true);

		userDetails = parse(userDetails);
		let tokenObj = {
			employee_id: userDetails.employee_id,
			role: userDetails.role.role
		};

		const token = jwt.sign(tokenObj, config.token_secret, {
			// expiresIn: 1440
		});

		tokenObj = {
			...tokenObj,
			email: userDetails.email,
			name: userDetails.name,
			// phone: userDetails.phone,
			// display_picture_url: userDetails.display_picture_url,
		};

		let resData = new resPattern.successResponse({ tokenObj, token ,userDetails}, 'Logged in successfully');
		res.status(resData.status).json(resData);
	} catch (error) {
		console.log(error);
		return next(new resPattern.failedResponse(errorMessage(error)));
	}
};


module.exports = {
	signIn,
}
