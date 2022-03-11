var express = require("express");
var router = express.Router();
let response = require("../helpers/response");

/* GET users listing. */
router.get("/home", function (req, res, next) {
  res.render("home.ejs");
});

router.get("/", function (req, res, next) {
  res.render("register.ejs");
});

router.get("/register", function (req, res, next) {
  res.render("register.ejs");
});

router.get("/login", function (req, res, next) {
  res.render("login.ejs");
});

module.exports = router;
