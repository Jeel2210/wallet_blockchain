'use strict';
const Roles = require('../helpers/roles');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user', {
            user_id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                unique: true,
                autoIncrement: true,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: Roles.employee
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null
            },
            age: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            address: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            gender: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password: {
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
        await queryInterface.dropTable('user');
    }
};