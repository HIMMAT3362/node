const bcrypt = require("bcrypt");
const saltRounds = 10;

const setPassword = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          reject(new Error("Server Error"));
        }
        resolve(hash);
      });
    });
  });
};

const validatePassword = async (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function (err, result) {
      if (err) {
        reject(new Error("Server Error"));
      }
      resolve(result);
    });
  });
};

module.exports = {
  setPassword,
  validatePassword,
};
