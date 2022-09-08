const { body, check, header } = require("express-validator");
const validator = require("express-validator");
const Company = require("../models/Company");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const { validatePassword } = require("../services/hash");

const SignUpValidation = [
  check("first_name").notEmpty().withMessage("First Name is required."),
  check("last_name").notEmpty().withMessage("Last Name is required."),
  check("email").notEmpty().withMessage("Email is required."),
  check("email").isEmail().withMessage("Please enter a valid email."),
  check("email").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      Company.findOne({ email: value }, function (err, Company) {
        if (err) {
          reject(new Error("Server Error"));
        }
        if (Boolean(Company)) {
          reject(new Error("E-mail already in use"));
        }
        resolve(true);
      });
    });
  }),
  check("email").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: value }, function (err, user) {
        if (err) {
          reject(new Error("Server Error"));
        }
        if (Boolean(user)) {
          reject(new Error("E-mail already in use"));
        }
        resolve(true);
      });
    });
  }),
];

const PasswordValidation = [
  check("email").notEmpty().withMessage("Email is required."),
  check("email").isEmail().withMessage("Please enter valid email."),
  check("email").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: value }, (err, user) => {
        if (err) {
          reject(new Error("Server Error"));
        }
        if (!Boolean(user)) {
          reject(new Error("Invalid email."));
        }
        resolve(true);
      });
    });
  }),
  check("token").notEmpty().withMessage("Token is required."),
  check("token").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      PasswordReset.findOne({ token: value }, (err, token) => {
        if (err) {
          reject(new Error("Server Error"));
        }
        if (!Boolean(token)) {
          reject(new Error("Invalid token."));
        }
        if (value == null) return reject(new Error("Token is required."));
        if (token == null) return reject(new Error("Token expired."));
        if (new Date() > new Date(token.createdAt.getTime() + 60 * 60000)) {
          reject(new Error("Token expired."));
        }
        resolve(true);
      });
    });
  }),
  check("password").trim().notEmpty().withMessage("Password is required."),
  check("password")
    .trim()
    .isLength({ min: 4, max: 16 })
    .withMessage("Password must be between 4 to 16 characters"),
  check("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password must be requried."),
  check("confirmPassword").custom(async (confirmPassword, { req }) => {
    if (req.body.password !== confirmPassword) {
      throw new Error("Passwords must be same");
    }
  }),
];

const RemindValidation = [
  check("email").trim().notEmpty().withMessage("Email is required."),
  check("email").trim().isEmail().withMessage("Please enter a valid email."),
  check("email").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: value }, (err, user) => {
        if (err) {
          reject(new Error("Serror error."));
        }
        if (!Boolean(user)) {
          reject(new Error("Invalid email."));
        }
        resolve(true);
      });
    });
  }),
];

const LoginValidation = [
  check("email").trim().notEmpty().withMessage("Please enter email address."),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),
  check("email").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: value }, (err, user) => {
        if (err) {
          reject(new Error("Serror error."));
        }
        if (!Boolean(user)) {
          reject(new Error("Invalid email."));
        }
        resolve(true);
      });
    });
  }),
  check("password").trim().notEmpty().withMessage("Password is required."),
  check("password")
    .trim()
    .isLength({ min: 4, max: 16 })
    .withMessage("Password must be between 4 to 16 characters"),
  check("password").custom((value, { req }) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: req.body.email }, "+hash", (err, user) => {
        if (err) {
          reject(new Error("Serror error."));
        }
        if (!Boolean(user)) {
          reject(new Error("Invalid credentials."));
        }
        let res = validatePassword(value, user.hash);
        res.then((value) => {
          if (value) {
            resolve(true);
          } else {
            reject(new Error("Invalid credentials."));
          }
        });
      });
    });
  }),
];

module.exports = {
  SignUpValidation,
  PasswordValidation,
  RemindValidation,
  LoginValidation,
};
