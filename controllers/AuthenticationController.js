const { validationResult, Result } = require("express-validator");
const { default: mongoose } = require("mongoose");
const Company = require("../models/Company");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Role = require("../models/Role");
const ejs = require("ejs");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const crypto = require("crypto");
const sendMail = require("../services/email");
const path = require("path");
const { setPassword } = require("../services/hash");

const Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().shift() });
  }
  var role;
  var promise = Role.findOne({ name: "company_owner" }).select("_id").exec();
  await promise.then(function (user) {
    role = user;
  });
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const opts = { session, new: true };
    const company = new Company({
      _id: mongoose.Types.ObjectId(),
      name: req.body.organization,
      email: req.body.email,
    });

    const user = new User({
      _id: mongoose.Types.ObjectId(),
      company_id: company._id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      role_id: role._id,
    });

    let token = crypto.randomBytes(32).toString("hex");

    const passwordGenerate = new PasswordReset({
      email: req.body.email,
      token: token,
    });

    company.save({ opts }).catch(async (err) => {
      await session.commitTransaction();
      session.endSession();
      res.status(500).json({
        status: false,
        status_code: 500,
        message: "Something went wrong, Please try again later.",
      });
    });

    user.save({ opts }).catch(async (err) => {
      await session.commitTransaction();
      session.endSession();
      res.status(500).json({
        status: false,
        status_code: 500,
        message: "Something went wrong, Please try again later.",
      });
    });

    passwordGenerate.save({ opts }).catch(async (err) => {
      await session.commitTransaction();
      session.endSession();
      res.status(500).json({
        status: false,
        status_code: 500,
        message: "Something went wrong, Please try again later.",
      });
    });

    ejs.renderFile(
      path.join(__dirname, "../views/emails/generate-password.ejs"),
      {
        url:
          "http://localhost:5000/generate-password?email=" +
          req.body.email +
          "token=" +
          token,
        token_expiry_time: process.env.PASSWORD_TOKEN_EXPIRY_TIME,
      },
      (err, data) => {
        if (err) {
          session.commitTransaction();
          session.endSession();
          res.status(500).json({
            status: false,
            status_code: 500,
            message: "Something went wrong, Please try again later.",
          });
        }
        var mainOptions = {
          from: process.env.EMAIL_USER_NAME,
          to: req.body.email,
          subject: "Password generate request",
          html: data,
        };
        sendMail.sendMail(mainOptions, (err, info) => {
          if (err) {
            session.commitTransaction();
            session.endSession();
            res.status(500).json({
              status: false,
              status_code: 500,
              message: "Something went wrong, Please try again later.",
            });
          }
        });
      }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      status: true,
      status_code: 201,
      message: "Registration Successful.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
};

const GeneratePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().shift() });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let hash = setPassword(req.body.password);
    hash.then((value) => {
      User.updateOne(
        { email: { $gte: req.body.email } },
        {
          hash: value,
        },
        (err, user) => {
          if (err) {
            session.abortTransaction();
            session.endSession();
            reject(new Error("Server Error"));
          }
          PasswordReset.findOne({ email: req.body.email })
            .remove()
            .then((result) => {
              session.commitTransaction();
              session.endSession();
              res.status(201).json({
                status: true,
                status_code: 201,
                message: "Password generated successfully.",
              });
            });
        }
      );
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
};

module.exports = {
  Register,
  GeneratePassword,
};
