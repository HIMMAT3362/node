const { default: mongoose } = require("mongoose");
let RoleSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      required: true,
      type: String,
    },
    display_name: {
      required: true,
      type: String,
    },
    removable: {
      type: Number,
      required: true,
      Enumerator: [0, 1],
      default: 1,
    },
  },
  { timestamps: true }
);

const Role = (module.exports = mongoose.model("roles", RoleSchema));
