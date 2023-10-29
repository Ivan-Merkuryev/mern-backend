import ProductModel from "../models/Product.js";
// import UserModel from "../models/User.js";

export const getAll = async (req, res) => {
  try {
    const products = await ProductModel.find({ quantity: { $gt: 0 } })
      .sort({ date: -1 })
      .populate({ path: "member", populate: "info" })
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить товары",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await ProductModel.findOne({ _id: productId })
      .populate({ path: "member", populate: "info" })
      .exec();

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить товары",
    });
  }
};

export const getLastProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ quantity: { $gt: 0 } })
      .sort({ date: -1 })
      .limit(2)
      .populate({ path: "member", populate: "info" })
      .exec();

    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить товары",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new ProductModel({
      title: req.body.title,
      productUrl: req.body.productUrl,
      description: req.body.description,
      price: req.body.price,
      member: req.userId,
      date: req.body.date,
      quantity: req.body.quantity,
      color: req.body.color,
    });

    const product = await doc.save();

    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать товар",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const productId = req.params.id;

    const doc = await ProductModel.findByIdAndDelete({ _id: productId });

    if (!doc) {
      return res.status(404).json({
        message: "Пост не найден",
      });
    }
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось удалить товар",
    });
  }
};

export const update = async (req, res) => {
  try {
    const productId = req.params.id;

    await ProductModel.updateOne(
      { _id: productId },
      {
        title: req.body.title,
        productUrl: req.body.productUrl,
        description: req.body.description,
        price: req.body.price,
        member: req.userId,
        quantity: req.body.quantity,
        color: req.body.color,
        date: req.body.date,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Не удалось изменить товар",
    });
  }
};
