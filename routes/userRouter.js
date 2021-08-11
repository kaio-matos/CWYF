const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", express.json(), userController.register);
router.post("/login", express.json(), userController.login);
router.post("/myaccount", express.json(), userController.myaccount);

module.exports = router;
