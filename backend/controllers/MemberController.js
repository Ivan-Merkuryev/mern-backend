import MemberModel from "../models/Member.js";
import UserModel from "../models/User.js";

export const create = async (req, res) => {
  try {
    const doc = new MemberModel({
      name: req.body.name,
      nameGroup: req.body.nameGroup,
      avatar: req.body.avatar,
      address: req.body.address,
      backgroundImg: req.body.backgroundImg,
      info: req.body.info,
      sliderImg: req.body.sliderImg,
      member: req.userId,
    });

    const member = await doc.save();

    const userId = req.userId;
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { info: member._id, address: req.body.address, avatar: req.body.avatar },
      { new: true }
    )
      .populate("info")
      .exec();

    res.json(member);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать профиль",
    });
  }
};

export const update = async (req, res) => {
  try {
    const memberAddress = req.params.address;

    await MemberModel.updateOne(
      { address: memberAddress },
      {
        name: req.body.name,
        nameGroup: req.body.nameGroup,
        avatar: req.body.avatar,
        address: req.body.address,
        backgroundImg: req.body.backgroundImg,
        info: req.body.info,
        sliderImg: req.body.sliderImg,
        member: req.userId,
      }
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось изменить профиль",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const address = req.params.address;

    const member = await MemberModel.findOne({ address: address })
      .populate("member")
      .exec();

    res.json(member);
  } catch (err) {
    res.status(500).json({
      message: "Не удалось получить профиль пользователя",
    });
  }
};
