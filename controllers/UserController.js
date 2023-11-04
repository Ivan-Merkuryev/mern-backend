import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../models/User.js";
import PostModel from "../models/Post.js";
import ProductModel from "../models/Product.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      name: req.body.name,
      email: req.body.email,
      passwordHash: hash,
      // avatar: req.body.avatar,
      role: req.body.role,
      // address: req.body.address
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log("Ошибка регистрации", err);
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })
      .populate("info")
      .exec();

    if (!user) {
      return res.status(400).json({
        message: "пользователь не найден",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Ошибка авторизации",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    
    const user = await UserModel.findById(req.userId).populate("info").exec();

    if (!user) {
      return res.status(404).json({
        message: "пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "нет доступа",
    });
  }
};

export const follow = async (req, res) => {
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

    if (userMeIndex === -1) {
      member.followers.push(userMe._id);
      await member.save();
    }
    if (memberIndex === -1) {
      userMe.following.push(member._id);
      await userMe.save();
    }
    res.json(member);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось подписаться",
    });
  }
};

export const unFollow = async (req, res) => {
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

    if (userMeIndex !== -1) {
      userMe.following.splice(userMeIndex, 1);
      await userMe.save();
    }
    if (memberIndex !== -1) {
      member.followers.splice(memberIndex, 1);
      await member.save();
    }

    res.json({
      message: "Успешное удаление из подписок",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Ошибка",
    });
  }
};

export const handleFollow = async (req, res) => {
  try {
    const userMe = await UserModel.findById(req.userId);

    if (!userMe) {
      return res.status(404).json({
        message: "пользователь не найден",
      });
    }

    const address = req.params.address;
    const member = await UserModel.findOne({ address: address });

    if (userMe.following.includes(member._id)) {
      res.json({
        message: "Пользователь в подписках",
      });
    } else {
      res.json({
        message: "Пользователя нет в подписках",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await UserModel.find({ info: { $exists: true } })
      .populate("info")
      .exec();

    let membersInfo = [];
    members.forEach((el) => membersInfo.push(el.info));

    res.json(membersInfo);
  } catch (err) {
    res.status(500).json({
      message: "Никого не найдено",
    });
  }
};

export const getFeed = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "пользователь не найден",
      });
    }
    const following = user.following;
    const latestPosts = await PostModel.find({ member: { $in: following } })
      .sort({ date: -1 })
      .populate({ path: "member", select: '-passwordHash -email -name -role -following -followers -orders -basket', populate: { path: "info" } })
      .exec();

    const latestProducts = await ProductModel.find({
      member: { $in: following },
      quantity: { $gt: 0 },
    })
      .sort({ date: -1 })
      .populate({ path: "member", select: '-passwordHash -email -name -role -following -followers -orders -basket', populate: { path: "info" } })
      .exec();

    const combinedData = latestPosts.concat(latestProducts);
    combinedData.sort((a, b) => b.date - a.date);

    res.json(combinedData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

export const addToBasket = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    const user = await UserModel.findById(req.userId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Пользователь или товар не найдены" });
    }

    const existingProductIndex = user.basket.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingProductIndex !== -1) {
      if (user.basket[existingProductIndex].quantity === product.quantity) {
        return res.status(400).json({
          message: "Достигнуто максимальное количество товара в корзине",
        });
      }
      user.basket[existingProductIndex].quantity += 1;
      if (user.basket[existingProductIndex].quantity > product.quantity) {
        user.basket[existingProductIndex].quantity = product.quantity;
      }
    } else {
      user.basket.push({ product: productId });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось добавить товар в корзину" });
  }
};

export const removeFromBasket = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    const user = await UserModel.findById(req.userId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Пользователь или товар не найдены" });
    }

    user.basket = user.basket.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось удалить товар из корзины" });
  }
};

export const removeOneFromBasket = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);
    const user = await UserModel.findById(req.userId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ message: "Пользователь или товар не найдены" });
    }

    const existingProductIndex = user.basket.findIndex(
      (item) => item.product.toString() === productId
    );

    if (
      existingProductIndex !== -1 &&
      user.basket[existingProductIndex].quantity !== 0
    ) {
      user.basket[existingProductIndex].quantity -= 1;
    } else {
      res.json({
        message: "Не удалось уменьшить количество товара",
      });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Не удалось уменьшить количество товара" });
  }
};

export const basket = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
      .populate({
        path: "basket.product",
        populate: { path: "member", select: '-passwordHash -email -name -role -following -followers -orders -basket', populate: { path: "info" } },
      })
      .exec();

    if (user.basket.length === 0) {
      return res.json({
        message: "В корзине нет товаров",
      });
    }

    res.json(user.basket.reverse());
  } catch (err) {
    res.status(500).json({
      message: "Ошибка получения товаров корзины",
    });
  }
};

export const orders = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
      .populate("orders.product")
      .exec();

    res.json(user.orders);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Не удалось получить информацию о заказах" });
  }
};

export const clearBasketAndAddToOrders = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)
      .populate("basket.product")
      .exec();

    if (user.basket.length === 0) {
      return res.json({ message: "Корзина пуста" });
    }

    let validProducts = {};

    user.basket.forEach((product) => {
      const allQuantity = product.product.quantity;
      const quantity = product.quantity;

      if (allQuantity < quantity || allQuantity <= 0) {
        return;
      }
      validProducts[product.product._id] = {
        product: product.product,
        quantity: product.quantity,
      };
    });

    const products = Object.values(validProducts);

    const totalPrice = products.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const newOrder = {
      products,
      totalPrice,
      date: Date.now(),
    };

    user.orders.unshift(newOrder);

    user.basket = user.basket.filter(
      (product) => product.product.quantity === 0
    );

    newOrder.products.forEach(async (product) => {
      product.product.quantity -= product.quantity;
      await ProductModel.findByIdAndUpdate(product.product._id, {
        quantity: product.product.quantity,
      });
    });

    await user.save();

    res.json(user.orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось оплатить товар",
    });
  }
};
