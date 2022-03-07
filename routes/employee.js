const userRouter = require('express').Router();
const userCtrl = require('../controllers/employee');
const authorize = require('../middlewares/authorize');
const Roles = require('../helpers/roles');

userRouter.route('/send-money')
    // POST /api/employee/send-money
    .post(userCtrl.sendMoney)

userRouter.route('/block-chain')
    // POST /api/employee/send-money
    .get(userCtrl.getBlockChainInstance)

userRouter.route('')
    // GET /api/employee
    .get(authorize(Roles.employee), userCtrl.getAllUsers)
    // POST /api/employee
    .post(authorize(Roles.employee, false), userCtrl.userRegister)


userRouter.route('/:id')
    // GET /api/employee/:id
    .get( userCtrl.getUserByID)
    // PATCH /api/employee/:id
    .patch(authorize(Roles.employee), userCtrl.updateUser)
    // DELETE /api/employee/:id
    .delete(authorize(Roles.employee), userCtrl.deleteUser)




module.exports = userRouter;