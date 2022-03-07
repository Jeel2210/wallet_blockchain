const employeeRouter = require('./employee');
const userRouter = require('./user');

const Router = require('express').Router();

Router.use('/employee', employeeRouter);
Router.use('/user', userRouter);



module.exports = Router;