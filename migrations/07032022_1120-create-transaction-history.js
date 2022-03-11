'use strict';
const Roles = require('../helpers/roles');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('transaction_history', {
			transaction_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				unique: true,
				autoIncrement: true,
			},
			node: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null
			},
			wallet_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null,
			},
			amount: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null
			},
			payer_public_key: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null
			},
			payee_public_key: {
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
		await queryInterface.dropTable('transaction_history');
	}
};