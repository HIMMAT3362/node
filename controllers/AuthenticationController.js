require("dotenv").config();
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const Company = require("../models/Company");
const ejs = require("ejs");
const PasswordReset = require("../models/PasswordReset");
const User = require("../models/User");
const crypto = require("crypto");
const sendMail = require("../services/email");
const path = require("path");
const { setPassword } = require("../services/hash");
const FindRole = require("../services/findRole");

const Register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      status_code: 422,
      errors: errors.array().shift(),
    });
  }

  //find role id
  var role;
  await FindRole("company_owner").then(
    (result) => (role = result._id),
    (err) => {
      return res.status(500).json({
        status: false,
        status_code: 500,
        message: "Something went wrong, Please try again later.",
      });
    }
  );
  let session = await mongoose.startSession();
  session.startTransaction();

  try {
    //create company
    const company = await Company.create(
      [
        {
          _id: mongoose.Types.ObjectId(),
          name: req.body.organization,
          email: req.body.email,
        },
      ],
      { session: session }
    );

    //create user
    const user = await User.create(
      [
        {
          _id: mongoose.Types.ObjectId(),
          company_id: company[0]._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          role_id: role,
        },
      ],
      { session: session }
    );

    //update company details
    await Company.updateOne(
      { _id: user.company_id },
      { $push: { users_id: user[0]._id } }
    ).catch(async (err) => {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        status: false,
        status_code: 500,
        message: "Something went wrong, Please try again later.",
      });
    });

    //create token for generate password
    let token = crypto.randomBytes(32).toString("hex");

    //create entry for generate password
    await PasswordReset.create(
      [
        {
          email: req.body.email,
          token: token,
        },
      ],
      { session: session }
    );

    //send generate password mail
    ejs.renderFile(
      path.join(__dirname, "../views/emails/generate-password.ejs"),
      {
        url:
          "http://localhost:5000/generate-password?email=" +
          req.body.email +
          "&token=" +
          token,
        token_expiry_time: process.env.PASSWORD_TOKEN_EXPIRY_TIME,
      },
      async (err, data) => {
        if (err) {
          await session.abortTransaction();
          session.endSession();
          return res.status(500).json({
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
        sendMail.sendMail(mainOptions, async (err, info) => {
          if (err) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
              status: false,
              status_code: 500,
              message: "Something went wrong, Please try again later.",
            });
          }
        });
      }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    status: true,
    status_code: 201,
    message: "Registration Successful.",
  });
};

const GeneratePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      status_code: 422,
      errors: errors.array().shift(),
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const opts = { session, new: true };
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
          PasswordReset.findOne({ email: req.body.email }, { opts })
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

const Remind = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      status_code: 422,
      errors: errors.array().shift(),
    });
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //create token for generate password
    let token = crypto.randomBytes(32).toString("hex");

    //create entry for generate password
    await PasswordReset.create(
      [
        {
          email: req.body.email,
          token: token,
        },
      ],
      { session: session }
    );

    //send generate password mail
    ejs.renderFile(
      path.join(__dirname, "../views/emails/reset-password.ejs"),
      {
        url:
          "http://localhost:5000/generate-password?email=" +
          req.body.email +
          "token=" +
          token,
        token_expiry_time: process.env.PASSWORD_TOKEN_EXPIRY_TIME,
      },
      async (err, data) => {
        if (err) {
          console.warn(err);
          await session.abortTransaction();
          session.endSession();
          return res.status(500).json({
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
        sendMail.sendMail(mainOptions, async (err, info) => {
          if (err) {
            console.warn(err);
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
              status: false,
              status_code: 500,
              message: "Something went wrong, Please try again later.",
            });
          }
        });
      }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
  await session.commitTransaction();
  session.endSession();
  return res.status(200).json({
    status: true,
    status_code: 200,
    message: "Check your email.",
  });
};

const ResetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      status_code: 422,
      errors: errors.array().shift(),
    });
  }
  let session = await mongoose.startSession();
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
              res.status(200).json({
                status: true,
                status_code: 200,
                message: "Password changed successfully.",
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
  Remind,
  ResetPassword,
};
