module.exports = {
	User: {
		type: 'object',
		properties: {
			role: { type: 'string', description: 'Role', example: 'USER' },
			email: { type: 'string', description: 'Email', example: 'TEST@example.com' },
			password: { type: 'string', description: 'Password', example: 'Test@123' },
			name: { type: 'string', description: 'Name', example: 'test' },
            phone: { type: 'string', description: 'Phone', example: '123456789' },
		}
    },
};