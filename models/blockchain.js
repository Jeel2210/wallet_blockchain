'use strict';
const { Model } = require('sequelize');
const Roles = require('../helpers/roles');


module.exports = (sequelize, DataTypes) => {
	class blockchain extends Model {
		static associate(models) {
		}
	};
	blockchain.init({
		blockchain_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},
		blockchain: {
			type: DataTypes.TEXT,
			allowNull: true,

		},
		is_active: {
			type: DataTypes.TINYINT,
			defaultValue: 1
		},
		is_deleted: {
			type: DataTypes.TINYINT,
			defaultValue: 0
		},
		created_at: {
			allowNull: false,
			type: DataTypes.DATE,
		},
		updated_at: {
			allowNull: false,
			type: DataTypes.DATE,
		}
	}, {
		sequelize,
		modelName: 'blockchain',
		freezeTableName: true,
		underscored: true,
		freezeTableName: true,
	});
	return blockchain;
};
