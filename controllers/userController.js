const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidate, loginValidate } = require("./validateUser");

module.exports = {
  async register(req, res) {
    // Checks if it's everything ok with the data
    const { error } = registerValidate(req.body);
    if (error)
      return res.status(400).json({ message: "", error: error.message });

    // Checks if there is other equal user
    const equalEmail = await User.findOne({ email: req.body.email });
    if (equalEmail)
      return res.status(400).json({
        message: "",
        error: "This email is already in use",
      });

    // Create user based on mongoose model
    const userAccount = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });

    // Save user
    try {
      let savedUser = await userAccount.save();
      res
        .status(200)
        .json({ message: "Usuário criado com sucesso", error: "" });
    } catch (err) {
      res.status(400).json({ message: "", error: err.message });
    }
  },
  async login(req, res) {
    // Checks if it's everything ok with the data
    const { error } = loginValidate(req.body);
    if (error)
      return res.status(400).json({ message: "", error: error.message });

    // Find user
    const selectedUser = await User.findOne({
      email: req.body.email,
    });

    // Case not found
    if (!selectedUser)
      return res
        .status(400)
        .json({ message: "", error: "Email or Password incorrect" });
    // ---------------

    // Checks password
    const passwordAndUserMatch = bcrypt.compareSync(
      req.body.password,
      selectedUser.password
    );

    // Case not match
    if (!passwordAndUserMatch)
      return res
        .status(400)
        .json({ message: "", error: "Email or Password incorrect" });
    // ---------------

    // Create Token
    const token = jwt.sign({ _id: selectedUser.id }, process.env.TOKEN_JWT);

    res.header("authorization_token", token);
    res.json({
      message: "Login successfully realized",
      error: "",
    });
  },
};
