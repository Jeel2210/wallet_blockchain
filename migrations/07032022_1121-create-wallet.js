'use strict';
const Roles = require('../helpers/roles');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('wallet', {
			wallet_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				unique: true,
				autoIncrement: true,
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null,
			},
			balance: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null
			},
			token: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null
			},
			address: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null
			},
			public_key: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null
			},
			private_key: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null
			},
			is_active: {
				type: Sequelize.TINYINT,
				defaultValue: 1
			},
			is_deleted: {
				type: Sequelize.TINYINT,
				defaultValue: 0
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
			}
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('wallet');
	}
};