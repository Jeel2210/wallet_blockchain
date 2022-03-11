const { Sequelize } = require('sequelize');
const config = require('.');

const sequelize = new Sequelize(config.db, config.db_user, config.db_pass, {
	host: config.db_host,
	dialect: 'mysql',
	// logging: false,
	define: {
		underscored: true,
		freezeTableName: true,
		freezeTableName: true
	},
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	},
	// logging: true
});


module.exports = sequelize;