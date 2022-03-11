const employeeRouter = require("./employee");
const userRouter = require("./user");

const Router = require("express").Router();

Router.use("/employee", employeeRouter);
Router.use("/user", userRouter);

// Labhu.......................
/* GET home page. */
Router.get("/home", function (req, res, next) {
  res.render("home.ejs");
});

Router.get("/", function (req, res, next) {
  res.render("register.ejs");
});

Router.get("/register", function (req, res, next) {
  console.log("1111111");
  res.render("register.ejs");
});

Router.get("/login", function (req, res, next) {
  res.render("login.ejs");
});

Router.get("/wallet", function (req, res, next) {
  res.render("wallet");
});

Router.get("/add-block", function (req, res, next) {
  res.render("add-block");
});

Router.get("/transaction", function (req, res, next) {
  res.render("lastTnx");
});

Router.get("/transaction/history", function (req, res, next) {
  res.render("tnxHistory.ejs");
});

Router.get("/send/request", function (req, res, next) {
  res.render("sendRequest.ejs");
});

Router.get("/send/request/history", function (req, res, next) {
  res.render("requestHistory.ejs");
});

Router.get("/approve/to-pay/", function (req, res, next) {
  res.render("approveToPay.ejs");
});

module.exports = Router;
