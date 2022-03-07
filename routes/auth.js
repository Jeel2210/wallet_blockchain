const Router = require('express').Router();
const authCtrl = require('../controllers/auth');



Router.route('/login')
	// POST /auth/login
    .post(authCtrl.signIn)



module.exports = Router;