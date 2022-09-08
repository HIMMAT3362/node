const { default: mongoose } = require("mongoose");
const validator = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");
let UserSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    company_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    hash: { type: String, select: false },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: "Email address is required",
      validate: [isEmail, "Please fill a valid email address"],
    },
    Active: {
      type: Number,
      required: true,
      Enumerator: [0, 1],
      default: 1,
    },
    role_id: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    profile_pic: {
      type: String,
    },
    remember_token: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.methods.isUserActive = () => {
  return this.Active == 1;
};

const User = (module.exports = mongoose.model("users", UserSchema));
