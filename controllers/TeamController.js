const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const Company = require("../models/Company");
const User = require("../models/User");

const getTeamList = async (req, res) => {
  let user = req.authData;
  try {
    var UserDetails = await User.find({ company_id: user.company_id }).exec();
    res.status(200).json({
      status: true,
      status_code: 200,
      data: UserDetails,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      status_code: 422,
      errors: errors.array().shift(),
    });
  }
  let user = req.authData;
  let session = await mongoose.startSession();
  session.startTransaction();
  try {
    //create user
    const user_details = await User.create(
      [
        {
          _id: mongoose.Types.ObjectId(),
          company_id: user.company_id,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          role_id: req.body.role,
        },
      ],
      { session: session }
    );

    await Company.updateOne(
      { _id: user.company_id },
      { $push: { users_id: user_details[0]._id } }
    )
      .then(async (result) => {
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json({
          status: true,
          status_code: 201,
          message: "Member added Successfully.",
        });
      })
      .catch(async (err) => {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          status: false,
          status_code: 500,
          message: "Something went wrong, Please try again later.",
        });
      });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      status: false,
      status_code: 500,
      message: "Something went wrong, Please try again later.",
    });
  }
};

module.exports = {
  getTeamList,
  addMember,
};
