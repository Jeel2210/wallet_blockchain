
const basicInfo = require('./basicInfo');
const servers = require('./servers');
const components = require('./components');
const tags = require('./tags');
const users = require('./routes/employee.swagger');
const auth = require('./routes/auth.swagger');

module.exports = {
	...basicInfo,
	...servers,
	...components,
	...tags,
	paths: {
		...auth,
        ...users,
	},
};