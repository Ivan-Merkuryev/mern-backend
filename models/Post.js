import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    previewImg: {
      type: String,
      required: true,
    },
    img1: String,
    img2: String,
    img3: String,
    album: Array,
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bySubscription: {
      type: Boolean,
      required: true,
      default: false
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timeseries: true,
  }
);

export default mongoose.model("Post", PostSchema);
