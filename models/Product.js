import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    productUrl: {
      type: Array,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    // size: {
    //   type: Number,
    //   required: true,
    // },
    price: {
      type: Number,
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: true,
    },
    color: {
      type: Number,
      required: true,
    },
  },
  {
    timeseries: true,
  }
);

export default mongoose.model("Product", ProductSchema);
