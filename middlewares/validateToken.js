const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ValidateToken = async (req, res, next) => {
  if (req.headers.authorization != undefined) {
    let token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWTKEY, async (err, authData) => {
      if (err) {
        return res
          .status(401)
          .json({ status: false, status_code: 401, message: err.message });
      } else {
        var check = await User.findOne({ _id: authData._id }).select(
          "+remember_token"
        );
        if (!check.remember_token) {
          return res.status(401).json({
            status: false,
            status_code: 401,
            message: "unauthorized.",
          });
        }
        req.authData = authData;
        next();
      }
    });
  } else {
    return res.status(401).json({
      status: false,
      status_code: 401,
      message: "token not provided.",
    });
  }
};

module.exports = ValidateToken;
