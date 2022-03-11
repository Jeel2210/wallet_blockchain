const { text } = require("body-parser");
const { newParam, attr, getModel, writeDescription } = require("../helper");


module.exports = {
	// paths: {
	'/auth/login': {
		post: {
			tags: ['Auth Apis'],
			description: writeDescription({
				heading: 'User Login',
                Description: 'Can sign in all employee types.'
			}),
			operationID: 'userLogin',
			requestBody: {
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
                                login: { type: 'string', description: 'Email/phone number', example: 'testEmployee1@yopmail.com' },
                                password: { type: 'string', description: 'Password', example: '123456' },
							}
						}
					}
				}
			},
            responses: {}
		}
	}
}