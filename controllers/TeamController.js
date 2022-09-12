const Company = require("../models/Company");
const User = require("../models/User");

const getTeamList = async (req, res) => {
  let user = req.authData;
  try {
    var details = await Company.find({ _id: user.company_id })
      .populate("users_id")
      .exec();
    console.warn(details);
    var UserDetails = await User.find({ company_id: user.company_id }).exec();
    res.status(200).json({
      status: true,
      status_code: 200,
      data: details,
      message: "Team data fatched successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
};

const addMember = async (req, res) => {
  let user = req.authData;
  try {

  } catch (error) {}
};

module.exports = {
  getTeamList,
  addMember,
};
