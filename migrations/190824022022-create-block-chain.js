'use strict';
const Roles = require('../helpers/roles');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('blockchain', {
			blockchain_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				unique: true,
				autoIncrement: true,
			},   
			blockchain: {
				type: Sequelize.TEXT,
				allowNull: true,
	
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
		await queryInterface.dropTable('blockchain');
	}
};