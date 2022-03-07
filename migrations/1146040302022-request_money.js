'use strict';
const Roles = require('../helpers/roles');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('request_money', {
			request_money_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				unique: true,
				autoIncrement: true,
			},
			status: {
				type: Sequelize.ENUM('REQUESTED', 'PENDING', 'CONFIRMED','REJECTED'),
				allowNull: true,
				defaultValue: 'PENDING'
			},
			amount: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null
			},
			requestor_public_key: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null
			},
			requested_to_public_key: {
				type: Sequelize.STRING,
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
		await queryInterface.dropTable('request_money');
	}
};