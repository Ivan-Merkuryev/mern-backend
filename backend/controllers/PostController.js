import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({date: -1}).populate({path: 'member', populate: 'info'}).exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось получить статьи",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await PostModel.findOne({ _id: postId }).populate( {path: "member", populate: 'info' } ).exec();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось получить статью",
    });
  }
};

export const getLastPosts = async (req, res) => {
  try {
    const posts = await PostModel.find().sort({ date: -1 }).limit(2).populate({path: 'member', populate: 'info'}).exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось получить статьи",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      previewImg: req.body.previewImg,
      img1: req.body.img1,
      img2: req.body.img2,
      img3: req.body.img3,
      album: req.body.album,
      member: req.userId,
      bySubscription: req.body.bySubscription,
      date: req.body.date
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Ошибка при создании поста",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findByIdAndDelete({ _id: postId });

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
      message: "Не удалось удалить пост",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        previewImg: req.body.previewImg,
        img1: req.body.img1,
        img2: req.body.img2,
        img3: req.body.img3,
        album: req.body.album,
        member: req.userId,
        bySubscription: req.body.bySubscription,
        date: req.body.date
      }
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось изменить пост",
    });
  }
};
