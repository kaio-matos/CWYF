const express = require("express");
const router = express.Router();

const defaultMessage = {
  message: "",
  error: "",
};

router.get("/", (req, res) => {
  res.render("index");
});
router.get("/login", (req, res) => {
  res.render("login", defaultMessage);
});
router.get("/register", (req, res) => {
  res.render("register", defaultMessage);
});
router.get("/room", (req, res) => {
  res.render("room", defaultMessage);
});
router.get("/myaccount", (req, res) => {
  res.render("myaccount", defaultMessage);
});

module.exports = router;
