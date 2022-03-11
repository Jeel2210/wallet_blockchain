var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.render('11');
});

router.get("/wallet", function (req, res, next) {
  res.render("wallet");
});

router.get("/add-block", function (req, res, next) {
  res.render("add-block");
});

router.get("/transaction", function (req, res, next) {
  res.render("lastTnx");
});

router.get("/transaction/history", function (req, res, next) {
  res.render("tnxHistory.ejs");
});

router.get("/send/request", function (req, res, next) {
  res.render("sendRequest.ejs");
});

router.get("/send/request/history", function (req, res, next) {
  res.render("requestHistory.ejs");
});

router.get("/approve/to-pay/", function (req, res, next) {
  res.render("approveToPay.ejs");
});

module.exports = router;
