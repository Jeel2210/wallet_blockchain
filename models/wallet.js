'use strict';
const { Model } = require('sequelize');
const Roles = require('../helpers/roles');


module.exports = (sequelize, DataTypes) => {
	class wallet extends Model {
		static associate(models) {
			this.belongsTo(models.user, {
				foreignKey: 'user_id',
				as: 'user'
			});
			// this.hasMany(models.transaction_history, { foreignKey: 'wallet_id', as: 'transaction_history' })
			// this.hasMany(models.request_money, { foreignKey: 'wallet_id', as: 'request_money' })
			
			this.hasMany(models.request_money, {
				foreignKey: 'requestor_wallet_id',
				as: 'requestor_wallet_id'
			});
			this.hasMany(models.request_money, {
				foreignKey: 'requested_to_wallet_id',
				as: 'requested_to_wallet_id'
			});

		}
	};
	wallet.init({
		wallet_id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			unique: true,
			autoIncrement: true,
		},
		user_id: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
			// references: {
			// 	model: 'user',
			// 	key: 'user_id'
			// },
			// onDelete: 'set null'
		},
		balance: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null
		},
		token: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		},
		address: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		},
		public_key: {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null
		},
		private_key: {
			type: DataTypes.TEXT,
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
		modelName: 'wallet',
		freezeTableName: true,
		underscored: true,
		freezeTableName: true,
	});
	return wallet;
};
