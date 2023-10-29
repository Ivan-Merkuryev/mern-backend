import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";

import {
  registerValidation,
  loginValidation,
  memberValidation,
  postCreateValidation,
  productCreateValidation
} from "./validations.js";

import { UserController, PostController, ProductController, MemberController } from "./controllers/index.js";
import { checkMember, checkAuth, checkFollowers, handleErrors } from "./utils/index.js";

const app = express();

//Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
  origin: "https://art-ai86.onrender.com"
}))

mongoose
  .connect(
    "mongodb+srv://ivanmerkuriiev:hCyNQNRaqJxlsKHz@cluster0.8k0duql.mongodb.net/artblog?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB err", err));

app.post(
  "/auth/register",
  registerValidation,
  handleErrors,
  UserController.register
);

app.post("/auth/login", loginValidation, handleErrors, UserController.login);

app.get("/auth/me", checkAuth, UserController.getMe);

app.get("/auth/member", UserController.getAllMembers);
//подписка на участника
app.post('/auth/follow/:address', checkAuth, UserController.follow)
app.post('/auth/unfollow/:address', checkAuth, UserController.unFollow)

app.get('/auth/handleFollow/:address', checkAuth, UserController.handleFollow)
//Страницы участников
app.post('/member', checkMember, memberValidation, handleErrors,  MemberController.create)
app.patch('/member/update/:address', checkMember, memberValidation, handleErrors, MemberController.update)
app.get('/member/:address', MemberController.getProfile)

//Добавление товара в корзину
app.post('/addToBasket/:id', checkAuth, UserController.addToBasket)
// app.post('/AddToBasket/:id', UserController.AddToBasket)

//Массив товаров в корзине
app.get('/basket', checkAuth, UserController.basket)
app.get('/orders', checkAuth, UserController.orders)

//Удаление товара из корзины
app.post('/removeFromBasket/:id', checkAuth, UserController.removeFromBasket)
app.post('/removeOneFromBasket/:id', checkAuth,  UserController.removeOneFromBasket)

//Оплата корзины
app.post("/clearBasketAndAddToOrders", checkAuth, UserController.clearBasketAndAddToOrders)

//Посты
app.get("/posts", PostController.getAll);
app.get("/posts/:id", PostController.getOne);
app.get('/postslast', PostController.getLastPosts)
app.post(
  "/posts",
  checkMember,
  postCreateValidation,
  handleErrors,
  PostController.create
);
app.delete("/posts/:id", checkMember, PostController.remove);
app.patch(
  "/posts/:id",
  checkMember,
  postCreateValidation,
  handleErrors,
  PostController.update
);

app.post("/upload", checkMember, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.post("/uploadArr", checkMember, upload.array("images"), (req, res) => {
  const urls = req.files.map((file) => `/uploads/${file.originalname}`);
  res.json({ urls });
});
///Product

app.get('/products', ProductController.getAll)
app.get('/products/:id', ProductController.getOne)
app.get('/productslast', ProductController.getLastProducts)
app.post('/products', checkMember, productCreateValidation, handleErrors, ProductController.create)
app.patch('/products/:id', checkMember, productCreateValidation, handleErrors, ProductController.update)
app.delete('/products/:id', checkMember,  ProductController.remove)


// Лента
app.get('/feed', checkAuth, UserController.getFeed)

const PORT = 4080;

app.listen(PORT, () => {
  console.log(`Сервер подключен к порту ${PORT}`);
});
