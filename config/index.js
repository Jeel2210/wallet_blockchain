require('dotenv').config();
const { colorLog } = require('../helpers/utils');

const env = process.env;
const envArr = [env.environment, env.env, env.ENV, env.NODE_ENV];
const prod = colorLog('PRODUCTION', 31, 47, 7);
const dev = colorLog('DEVELOPMENT', 37, 0, 7);
const cmd = txt => colorLog(txt, 33, 0, 7);


let config = {
	env: env.environment || env.env || env.ENV || env.NODE_ENV,
	port: 3000,
	db: '',
	db_pass: '',
	db_user: '',
    db_host: '',
    token_secret: '',
};


if (['prod', 'production'].includes(config.env)) {
	config.env = 'production';
	config.port = env.PROD_PORT;
	config.db = env.PROD_DB;
	config.db_pass = env.PROD_DB_PASS;
	config.db_user = env.PROD_DB_USER;
	config.db_host = env.PROD_DB_HOST;
    config.token_secret = env.PROD_TOKEN_SECRET;
	console.log(`Server has started as ${prod}. To start as ${dev} run command ${cmd('env=dev npm start')}.`)
} else {
	config.env = 'development';
	config.port = env.DEV_PORT;
	config.db = env.DEV_DB;
	config.db_pass = env.DEV_DB_PASS;
	config.db_user = env.DEV_DB_USER;
	config.db_host = env.DEV_DB_HOST;
    config.token_secret = env.DEV_TOKEN_SECRET;
	console.log(`Server has started as ${dev}. To start as ${prod} run command ${cmd('env=prod npm start')}.`)
}


console.log(config);

module.exports = config;