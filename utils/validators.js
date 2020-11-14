const { body } = require("express-validator");
const User = require("../models/user");
//- создание валидаторов на уровне сервера нужны для того что бы в случае обхода
//-валидации на уровне клиента не пропустить неверные данные на сервер
//-валидируется с помощью библиотеки express-validator
exports.registerValidators = [
	//-для проверки наличия указанного емейла в базе данных создаем асинхронный кастомный метод
	body("email")
		.isEmail()
		.withMessage("Input correct email")
		.custom(async (value, { req }) => {
			try {
				//-проверяем существует ли пользователь с таким имейлом
				//-создаем переменную user и обращаемся к моделе пользователя и вызываем метод findOne() куда передаем имейл
				const user = await User.findOne({ email: value });
				if (user) {
					return Promise.reject("User alredy exist this email");
				}
			} catch (error) {
				console.log(errror);
			}
		})
		//- дополнительные методы sanitazer для улучшения данных передаваемых на сервер
		.normalizeEmail(),

	//- withMessage передается сообщение которое выводится пользователю
	body("password", "min length 6 num")
		//- вторым параметром указывается сообщение пользователю которое выводится пользователб
		.isLength({ min: 4, max: 56 })
		.isAlphanumeric()
		//- дополнительные методы sanitazer для улучшения данных передаваемых на сервер
		.trim(),

	body("confirm")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password not same");
			}
			return true;
		})
		.trim(),
	body("name")
		.isLength({ min: 3 })
		.withMessage("Min length name is 3 num")
		.trim(),
];

exports.loginValidators = [
	body("email").isEmail().withMessage("Input correct email"),
	body("password", "max length 56 num")
		//- вторым параметром указывается сообщение пользователю которое выводится пользователб
		.isLength({ max: 56 })
		.isAlphanumeric()
		//- дополнительные методы sanitazer для улучшения данных передаваемых на сервер
		.trim(),
];

exports.courseValidators = [
	body("title")
		.isLength({ min: 3 })
		.withMessage("Min length mo then 3 characters")
		.trim(),
	body("price")
		.isLength({ min: 3 })
		.isNumeric()
		.withMessage("Input valid price")
		.trim(),
	body("img", "Input correct URL").isURL(),
];
