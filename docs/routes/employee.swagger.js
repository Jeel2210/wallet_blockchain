const Roles = require('../../helpers/roles');
const { newParam, attr, writeDescription } = require('../helper');

const security = [
    { jwt: [] }
];

const response = (description = 'Success Response.', modelName = 'EmployeeResponse') => {
    return {}
};


module.exports = {
    '/api/employee': {
        get: {
            tags: ['Employee Apis'],
            description: writeDescription({
                heading: 'Get list of Employees',
                'Authentication': {
                    table: [
                        [Roles.superAdmin, Roles.any.join(', ')],
                        [Roles.partner, [Roles.employee, Roles.trainer].join(', ')],
                        [Roles.trainer, [].join(', ') || 'N/A'],
                        [Roles.employee, Roles.trainer],
                    ]
                }
            }),
            parameters: [
                {
                    name: 'role',
                    in: 'query',
                    description: `Get list of employee based on role.`,
                    required: false,
                    type: 'string',
                },
                {
                    name: 'gym_id',
                    in: 'query',
                    description: `Get list of trainers of a gym. (**&role=${Roles.trainer}** *query string is required in order to get trainers of gym.*)`,
                    required: false,
                    type: 'string',
                },
            ],
            operationId: 'getEmployee',
            security,
            responses: response()
        },
        post: {
            tags: ['Employee Apis'],
            description: writeDescription({
                heading: 'Register or create employee',
                'Register without authentication': `Only ${Roles.employee} can register through this api.`,
                'Register with authentication': {
                    table: [
                        [Roles.employee, 'UNAUTHORIZED'],
                        [Roles.trainer, 'UNAUTHORIZED'],
                        [Roles.partner, `Can create **[ ${[Roles.trainer, Roles.employee].join(', ')} ]**`],
                        [Roles.superAdmin, `Can create **[ ${Roles.any.join(', ')} ]**`]
                    ]
                },
            }),
            operationId: 'registerEmployee',
            security,
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                email: { type: 'string', description: 'Email', example: 'TEST@example.com' },
                                password: { type: 'string', description: 'Password', example: 'Test@123' },
                                name: { type: 'string', description: 'Name', example: 'test' },
                                phone: { type: 'string', description: 'Phone', example: '123456789' },
                            }
                        }
                    }
                }
            },
            responses: response()
        },
    },
    '/api/employee/{id}': {
        get: {
            tags: ['Employee Apis'],
            description: 'Get employee by ID',
            operationId: 'getEmployeeByID',
            security,
            parameters: [{
                name: 'id',
                in: 'path',
                description: 'Provide employee_id here.',
                required: true,
                type: 'number',
            }],
            responses: response('Found employee response.')
        },

        patch: {
            tags: ['Employee Apis'],
            description: 'Get employee by ID',
            operationId: 'updateEmployeeByID',
            security,
            requestBody: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                role: { type: 'string', description: 'Role', example: 'USER' },
                                email: { type: 'string', description: 'Email', example: 'TEST@example.com' },
                                password: { type: 'string', description: 'Password', example: 'Test@123' },
                                name: { type: 'string', description: 'Name', example: 'test' },
                                phone: { type: 'string', description: 'Phone', example: '123456789' },
                                latitude: { type: 'string', description: 'Latitude', example: '10.958' },
                                longitude: { type: 'string', description: 'Longitude', example: '-11.3455' },
                            }
                        }
                    }
                }
            },
            parameters: [{
                name: 'id',
                in: 'path',
                description: 'Provide employee_id here.',
                required: true,
                type: 'number',
            }],
            responses: response()
        },
        delete: {
            tags: ['Employee Apis'],
            description: 'Get employee by ID',
            operationId: 'deleteEmployeeByID',
            security,
            parameters: [{
                name: 'id',
                in: 'path',
                description: 'Provide employee_id here.',
                required: true,
                type: 'number',
            }],
            responses: response()
        },

    }

}