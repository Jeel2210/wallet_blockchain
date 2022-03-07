'use strict';
console.log("Running");
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename); // index.js
const config = require('../config');
const env = config.env || 'development';
const sequelizeConfig = require(__dirname + '/../config/config.js')[env];
const models = {};

let sequelize;
if (sequelizeConfig.use_env_variable) {
	sequelize = new Sequelize(config[sequelizeConfig.use_env_variable], sequelizeConfig);
} else {
	sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, sequelizeConfig);
}

fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		console.log("Models::",model);
		models[model.name] = model;
	});

Object.keys(models).forEach(modelName => {
	if (models[modelName].associate) {
		models[modelName].associate(models);
	}
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
// console.log(models);
module.exports = models;
