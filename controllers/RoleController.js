const Role = require("../models/Role");
const User = require("../models/User");

const getRoleList = async (req, res) => {
  let user = req.authData;
  try {
    let roleDetails = await Role.findOne({ _id: user.role_id }).select("+name");
    if (roleDetails.name == "company_owner") {
      var role_name = ["company_owner", "company_admin", "inspector"];
    } else if (roleDetails.name == "company_admin") {
      var role_name = ["company_admin", "inspector"];
    } else {
      var role_name = ["inspector"];
    }
    await Role.find({
      name: { $in: role_name },
    })
      .select("_id display_name")
      .then((result) => {
        return res.status(200).json({
          status: true,
          status_code: 200,
          data: result,
          message: "Role list fatched successfully.",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          status: false,
          status_code: 500,
          message: "Something went wrong, Please try again later.",
        });
      });
    res.end();
  } catch (error) {}
};

module.exports = { getRoleList };
