import { body } from "express-validator";

export const registerValidation = [
    body('name', 'Укажите имя').notEmpty(),
    body('email', 'Укажите корректный email').isEmail(),
    body('password', 'Укажите пароль').isLength({min: 5})
]

export const loginValidation = [
    body('email', 'Укажите корректный email').isEmail(),
    body('password', 'Укажите пароль').isLength({min: 5})
]


export const memberValidation = [
    // body('genre', 'Укажите жанры').isString(),
    body('name', 'Укажите имя').isString(),
    body('nameGroup', 'Укажите имя').isString(),
    body('avatar', 'Укажите аватар').isString(),
    body('address', 'Укажите адрес').isString(),
    body('backgroundImg', 'Неверная ссылка на изображение').isString(),
    body('info', 'Укажите информацию о себе').isString(),
    body('sliderImg', 'Неверная ссылка на изображение').optional().isString(),
    body('text', 'Неверная ссылка на изображение').optional().isString(),
]

export const postCreateValidation = [
    body('title', 'Укажите название').notEmpty(),
    body('text', 'Укажите текст').notEmpty(),
    body('previewImg', 'Укажите картинку').isString(),
    body('img1', 'Неверная ссылка на изображение').optional().isString(),
    body('img2', 'Неверная ссылка на изображение').optional().isString(),
    body('img3', 'Неверная ссылка на изображение').optional().isString(),
    body('album', 'Неверная ссылка на изображение').optional().isString(),
    body('bySubscription', 'Укажите тип поста').optional().isBoolean(),
]


export const productCreateValidation = [
    body('title', 'Укажите название').notEmpty(),
    body('description', 'Укажите описание').isString(),
    body('productUrl', 'Укажите картинку').isArray(),
    body('price', 'Укажите цену').isNumeric(),
    body('quantity', 'Укажите количество').isNumeric(),
    body('color', 'Укажите цвет фона').isNumeric(),
]

