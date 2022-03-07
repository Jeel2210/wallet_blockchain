'use strict';

const { createPassword, timeToDate } = require("../helpers/utils");
const seeder_helper = require("./helper/seeder-helper");
const moment = require('moment');
const Roles = require('../helpers/roles');
const config = require('../config');

module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			let password = createPassword('123456');

			return [
                await queryInterface.bulkInsert('employee', seeder_helper.setAttr(
                    ['employee_id', 'role', 'name', 'email', 'password'],
					[
                        [1, Roles.employee, 'Employee', 'testEmployee1@yopmail.com', password],
                        [2, Roles.employee, 'Employee', 'testEmployee2@yopmail.com', password],
                        [3, Roles.employee, 'Employee', 'testEmployee3@yopmail.com', password],
                        [4, Roles.employee, 'Employee', 'testEmployee4@yopmail.com', password],
                        [5, Roles.employee, 'Employee', 'testEmployee5@yopmail.com', password],
                        [6, Roles.employee, 'Employee', 'testEmployee6@yopmail.com', password],
                        [7, Roles.employee, 'Employee', 'testEmployee7@yopmail.com', password],
					]
                )),
            ];
		} catch (error) {
			console.log(error);
		}
	},

	async down(queryInterface, Sequelize) {
		let tables = [
            'employee'
		];
		for (let i = 0; i < tables.length; i++) {
			await queryInterface.bulkDelete(tables[i], null, {});
		}
	}
};
