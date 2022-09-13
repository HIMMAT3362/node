const bodyParser = require("body-parser");
const express = require("express");
const { validationResult, check } = require("express-validator");
const { Login, Logout } = require("../controllers/AuthController");
const {
  Register,
  GeneratePassword,
  ResetPassword,
  Remind,
} = require("../controllers/AuthenticationController");
const { getRoleList } = require("../controllers/RoleController");
const { getTeamList, addMember } = require("../controllers/TeamController");
const ValidateToken = require("../middlewares/validateToken");
const User = require("../models/User");

const {
  SignUpValidation,
  PasswordValidation,
  RemindValidation,
  LoginValidation,
  logoutValidation,
  AddTeamMemberValidation,
} = require("../validators/validator");
const router = express.Router();
const jsonParser = bodyParser.json();

router.post("/register", jsonParser, SignUpValidation, Register);

router.put(
  "/create-password",
  jsonParser,
  PasswordValidation,
  GeneratePassword
);

router.post("/remind", jsonParser, RemindValidation, Remind);

router.put("/reset-password", jsonParser, PasswordValidation, ResetPassword);

router.post("/login", jsonParser, LoginValidation, Login);

router.post("/logout", ValidateToken, jsonParser, Logout);

router.get("/get-team-list", ValidateToken, getTeamList);

router.get('/get-role-list', ValidateToken, getRoleList);

router.post(
  "/add-member",
  ValidateToken,
  jsonParser,
  AddTeamMemberValidation,
  addMember
);

module.exports = router;
