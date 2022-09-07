const bodyParser = require("body-parser");
const express = require("express");
const { validationResult, check } = require("express-validator");
const {
  Register,
  GeneratePassword,
} = require("../controllers/AuthenticationController");

const {
  SignUpValidation,
  GeneratePasswordValidation,
} = require("../validators/validator");
const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/register", jsonParser, SignUpValidation, Register);

router.post(
  "/create-password",
  jsonParser,
  GeneratePasswordValidation,
  GeneratePassword
);

module.exports = router;
