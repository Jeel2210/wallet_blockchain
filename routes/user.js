const userRouter = require("express").Router();
const userCtrl = require("../controllers/user");
const authorize = require("../middlewares/authorize");
const Roles = require("../helpers/roles");

userRouter
  .route("/send-money")
  // POST /api/user/send-money
  .post(userCtrl.sendMoney);

userRouter
  .route("/request-money")
  // POST /api/user/request-money
  .post(userCtrl.requestMoney);

userRouter
  .route("/request-money-history")
  // get /api/user/request-history
  .get(userCtrl.getAllRequestMoneyHistory);

userRouter
  .route("/update-request-status")
  // POST /api/user/update-request-status
  .post(userCtrl.ApproveToPay);

userRouter
  .route("/request-money-by-id")
  // GET /api/user/request-money-by-id
  .get(userCtrl.getRequestMoneyById);

userRouter
  .route("/block-chain")
  // POST /api/user/send-money
  .get(userCtrl.getBlockChainInstance);

userRouter
  .route("/add-block")
  // POST /api/user/send-money
  .post(userCtrl.createBlock);

userRouter
  .route("/add-signture")
  // POST /api/user/send-money
  .post(userCtrl.createSignature);

userRouter
  .route("/create-transaction-hash")
  // POST /api/user/send-money
  .post(userCtrl.createTranscationHash);

userRouter
  .route("/transaction-history")
  // GET /api/user/transaction-history
  .get(userCtrl.transactionHistory);

userRouter
  .route("")
  // GET /api/user
  .get(authorize(Roles.user, false), userCtrl.getAllUsers)
  // POST /api/user
  .post(authorize(Roles.user, false), userCtrl.userRegister);

userRouter
  .route("/:id")
  // GET /api/user/:id
  .get(authorize(Roles.user, false), userCtrl.getUserByID)
  // PATCH /api/user/:id
  .patch(authorize(Roles.user, false), userCtrl.updateUser)
  // DELETE /api/user/:id
  .delete(authorize(Roles.user, false), userCtrl.deleteUser);



module.exports = userRouter;
