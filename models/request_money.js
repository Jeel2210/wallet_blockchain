'use strict';
const { Model } = require('sequelize');
const Roles = require('../helpers/roles');


module.exports = (sequelize, DataTypes) => {
	class request_money extends Model {
		static associate(models) {
			this.belongsTo(models.wallet, {
				foreignKey: 'requestor_wallet_id',
				as: 'requestor'
			});
			this.belongsTo(models.wallet, {
				foreignKey: 'requested_to_wallet_id',
				as: 'requested_to'
			});
		}
	};
	request_money.init({
		request_money_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},
		requestor_wallet_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		requested_to_wallet_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
		},
		status: {
			type: DataTypes.ENUM('PENDING', 'INPROGRESS', 'COMPLETED', 'REJECTED'),
			allowNull: true,
			defaultValue: 'PENDING'
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null
		},
		requestor_public_key: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
		},
		requested_to_public_key: {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null
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
		modelName: 'request_money',
		freezeTableName: true,
		underscored: true,
		freezeTableName: true,
	});
	return request_money;
};
