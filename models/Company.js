const { default: mongoose } = require("mongoose");
const validator = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");
let CompanySchema = new mongoose.Schema(
  {
    _id: mongoose.Types.ObjectId,
    name: {
      type: String,
    },
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
    },
    Active: {
      type: Number,
      required: true,
      Enumerator: [0, 1],
      default: 1,
    },
    logo: {
      type: String,
    },
  },
  { timestamps: true }
);

const Company = (module.exports = mongoose.model("companies", CompanySchema));
