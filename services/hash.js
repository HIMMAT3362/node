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
  var promise = User.findOne({ email: this.email }).select("+hash").exec();
  await promise.then(function (user) {
    bcrypt.compare(password, user.hash, function (err, result) {
      return result;
    });
  });
};

module.exports = {
  setPassword,
  validatePassword,
};
