const { default: mongoose } = require("mongoose");
let PasswordResetSchema = new mongoose.Schema(
  {
    email: { type: String },
    token: { type: String },
  },
  { timestamps: true }
);

const PasswordReset =
  (module.exports =
  module.exports =
    mongoose.model("password_reset", PasswordResetSchema));
