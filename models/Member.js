import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    // genre: {
    //   type: String,
    //   required: true,
    // },
    name: {
      type: String,
      required: true,
    },
    nameGroup: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    backgroundImg: {
      type: String,
      required: true,
    },
    info: {
      type: String,
      required: true,
    },
    text: String,
    sliderImg: String,
    member: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timeseries: true,
  }
);

export default mongoose.model("Member", MemberSchema);
