const { Router } = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); //-встроенная библиотека не нужно устанавливать
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const User = require("../models/user");
const keys = require("../keys/index");
const regEmail = require("../emails/successReg");
const resetEmail = require("../emails/reset");
const {
	registerValidators,
	loginValidators,
} = require("../utils/validators");

const router = Router();

//-создаем транспортер для почты
//-первый параметр сервис которым пользуемся
const transporter = nodemailer.createTransport(
	sendgrid({
		//-передаем объект конфигурации
		auth: {
			api_key: keys.SENDGRID_API_KEY,
		},
	})
);

//-открыть страницу входа
router.get("/login", async (req, res) => {
	res.render("auth/login", {
		title: "Authorization",
		isLogin: true,
		loginError: req.flash("loginError"),
		registerError: req.flash("registerError"),
	});
});

//-выход
router.get("/logout", async (req, res) => {
	//-для очистки базы данных при выходе вызываем метод destroy у session
	req.session.destroy(() => res.redirect("/auth/login#login"));
});

//- запрос на вход
router.post("/login", loginValidators, async (req, res) => {
	const { email, password } = req.body;
	try {
		//-получаем ошибки с помощью express-validator
		const errors = validationResult(req);
		//-если массив ошибок не пустой
		if (!errors.isEmpty()) {
			//-выводим первое сообщение из массива
			req.flash("loginError", errors.array()[0].msg);
			//-и возвращаемся на страницу регистрации
			return res.status(422).redirect("/auth/login");
		}

		//-создаем переменную candidate и обращаемся к моделе пользователя и вызываем метод findOne() куда передаем имейл
		const candidate = await User.findOne({ email });
		if (candidate) {
			//-если есть кандидат проверяем пароль на совпадение с помощью библиотеки bcrypt
			const areSame = await bcrypt.compare(password, candidate.password);
			if (areSame) {
				//-если совпадает добавляем пользователя в сессию
				req.session.user = candidate;
				req.session.isAuthenticated = true;
				req.session.save((err) => {
					if (err) {
						throw err;
					} else {
						res.redirect("/");
					}
				});
			} else {
				//-если нет
				//-сообщаем об ошибке. Первый параметр ключ сообщения
				req.flash("loginError", "Password is wrong");
				res.redirect("/auth/login#login");
			}
		} else {
			//-если нет кандидата сообщаем об ошибке
			req.flash("loginError", "User not found");
			res.redirect("/auth/login#login");
		}
	} catch (error) {
		console.log(error);
	}
});

//-регистрация для создания нового пользователя с валидированием из utils/validators
router.post("/register", registerValidators, async (req, res) => {
	try {
		//-забираем из ответа поля формы
		const { email, password, name } = req.body;

		//-получаем ошибки с помощью express-validator
		const errors = validationResult(req);
		console.log(errors);
		//-если массив ошибок не пустой
		if (!errors.isEmpty()) {
			//-выводим первое сообщение из массива
			req.flash("registerError", errors.array()[0].msg);
			//-и возвращаемся на страницу регистрации
			return res.status(422).redirect("/auth/login#register");
		}

		//-если нет совпадения зарегистрировать
		//-шифруем пароль
		const hashPassword = await bcrypt.hash(password, 10); //- 10 - это сложность шифрования
		//- создаем нового пользователя
		const user = new User({
			email,
			name,
			password: hashPassword,
			cart: { items: [] },
		});
		//-сохраняем нового пользователя
		await user.save();
		//-отправляем письмо на почту пользователя об успешной регистрации
		await transporter.sendMail(regEmail(email));
		//- переходим на страницу входа
		res.redirect("/auth/login#login");
		////-отправляем письмо на почту пользователя об успешной регистрации
		//await transporter.sendMail(regEmail(email));
	} catch (error) {
		console.log(error);
	}
});

//-сброс пароля
router.get("/reset", (req, res) => {
	res.render("auth/reset", {
		title: "Forgot password ?",
		error: req.flash("error"),
	});
});

//-создание нового пароля
router.get("/password/:token", async (req, res) => {
	//- для максимальной защиты добавляем проверки
	if (!req.params.token) {
		return res.redirect("/auth/login");
	}

	try {
		const user = User.findOne({
			resetToken: req.params.token,
			resetTokenExp: { $gt: Date.now() },
		});

		if (!user) {
			return res.redirect("/auth/login");
		} else {
			res.render("auth/password", {
				title: "Change password",
				error: req.flash("error"),
				userId: (await user)._id.toString(),
				token: req.params.token,
			});
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/reset", (req, res) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if (err) {
				req.flash("error", "Something wrong, repeat later");
				return res.redirect("/auth/reset");
			}

			const token = buffer.toString("hex");
			//-проверяем соответствует email  отправленный с клиента какому либо пользователб в базе данных
			const candidate = await User.findOne({ email: req.body.email });
			if (candidate) {
				//- если email найден
				candidate.resetToken = token;
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
				await candidate.save();
				await transporter.sendMail(resetEmail(candidate.email, token));
				res.redirect("/auth/login");
			} else {
				req.flash("error", "This email not found");
				res.redirect("/auth/reset");
			}
		});
	} catch (error) {
		console.log(error);
	}
});

//-изменение пароля
router.post("/password", async (req, res) => {
	try {
		//-проверяем существует ли такой пользователь
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: { $gt: Date.now() },
		});
		if (user) {
			//-если есть такой user
			//-шифруем новый пароль
			user.password = await bcrypt.hash(req.body.password, 10);
			//-удаляем старые данные относящиеся к восстановлению пароля
			user.resetToken = undefined;
			user.resetTokenExp = undefined;
			await user.save();
			res.redirect("/auth/login");
		} else {
			req.flash("loginError", "Token expired");
			res.redirect("/auth/login");
		}
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
