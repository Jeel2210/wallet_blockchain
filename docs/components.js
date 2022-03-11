const models = require('./schema/models');


module.exports = {
	components: {
		securitySchemes: {
			jwt: {
				type: "http",
				scheme: "bearer",
				in: "header",
				bearerFormat: "JWT",
				name: 'Authorization'
			},
		},
		schemas: {
            ...models,
		},
	},
}