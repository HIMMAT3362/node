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
      select: false,
      default: 1,
    },
    logo: {
      type: String,
    },
    users_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

CompanySchema.methods.checkActive = async (email) => {
  return new Promise((resolve, reject) => {
    Company.findOne({ email: email })
      .select("+Active")
      .then((result) => resolve(result.Active == 1))
      .catch((err) => reject(new Error("Serror error.")));
  });
};

const Company = (module.exports = mongoose.model("companies", CompanySchema));
