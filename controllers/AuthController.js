require("dotenv").config();
const { response } = require("express");
const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const Company = require("../models/Company");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const Login = async (req, res) => {
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
    const user = await User.findOne({ email: req.body.email }).select("+hash");
    const company = await Company.findOne({ _id: user.company_id });
    if (!user || !company) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "No user found.",
      });
    }
    if (!company.Active || !user.Active) {
      return res.status(400).json({
        status: false,
        status_code: 400,
        message: "Your access has been revoked.",
      });
    } else {
      jwt.sign(
        { _id: user._id },
        process.env.JWTKEY,
        { expiresIn: process.env.LOGIN_TOKEN_EXPIRY_TIME },
        (err, token) => {
          if (err) {
            return res.status(500).json({
              status: false,
              status_code: 500,
              message: "Something went wrong, Please try again later.",
            });
          } else {
            User.updateOne(
              { email: { $gte: user.email } },
              { remember_token: token },
              (err, res) => {
                if (err) {
                  return res.status(500).json({
                    status: false,
                    status_code: 500,
                    message: "Something went wrong, Please try again later.",
                  });
                }
              }
            );
            let response = {
              userData: {
                first_name: user.first_name,
                last_name: user.last_name,
                company_id: user.company_id,
                profile_pic: user.profile_pic,
              },
              companyData: {
                organization_name: company.name,
                logo: company.logo,
              },
              role_id: user.role_id,
              user_id: user._id,
              company_id: user.company_id,
              token: token,
              token_expiry_time: process.env.LOGIN_TOKEN_EXPIRY_TIME,
            };
            return res.status(200).json({
              status: true,
              status_code: 200,
              data: response,
              message: "Logged in successfully.",
            });
          }
        }
      );
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
};

const Logout = async (req, res) => {
  let user = req.authData;
  User.findOneAndUpdate(
    { _id: user._id },
    { remember_token: null },
    null,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          status_code: 500,
          message: "Something went wrong, Please try again later.",
        });
      } else {
        return res.status(200).json({
          status: true,
          status_code: 200,
          message: "Logged out successfully.",
        });
      }
    }
  );
};

module.exports = {
  Login,
  Logout,
};
