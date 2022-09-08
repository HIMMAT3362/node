const Role = require("../models/Role");

const FindRole = async (name) => {
  return await Role.findOne({ name: name }).select("_id").exec();
};

module.exports = FindRole;
