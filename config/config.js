const config = require(".");

module.exports = {
	"development": {
		"username": config.db_user,
		"password": config.db_pass,
		"database": config.db,
		"host": config.db_host,
		"dialect": "mysql",
		"define": {
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		}
	},
	"production": {
		"username": config.db_user,
		"password": config.db_pass,
		"database": config.db,
		"host": config.db_host,
		"dialect": "mysql",
		"define": {
			createdAt: 'created_at',
			updatedAt: 'updated_at'
		}
	}
};