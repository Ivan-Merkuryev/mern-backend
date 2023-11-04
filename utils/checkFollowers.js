import UserModel from "../models/User.js";

export default async (req, res, next) => {
  try {
    const userMe = await UserModel.findById(req.userId);

    if (!userMe) {
      return res.status(404).json({
        message: "пользователь не найден",
      });
    }

    const address = req.params.address;
    const member = await UserModel.findOne({ address: address });

    const userMeIndex = userMe.following.indexOf(member._id);
    const memberIndex = member.followers.indexOf(userMe._id);

    if (userMeIndex !== -1 && memberIndex !== -1) {
      if (userMeIndex !== -1) {
        userMe.following.splice(userMeIndex, 1);
        await userMe.save();
      }
      if (memberIndex !== -1) {
        member.followers.splice(memberIndex, 1);
        await member.save();
      }
    } else {
      req.userMeIndex = userMeIndex;
      req.memberIndex = memberIndex;
      req.member = member;
      req.userMe = userMe;
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Ошибка",
    });
  }
};
