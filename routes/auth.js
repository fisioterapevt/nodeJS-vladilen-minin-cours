const { Router } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const router = Router();

router.get("/login", async (req, res) => {
	res.render("auth/login", {
		title: "Authorization",
		isLogin: true,
		loginError: req.flash("loginError"),
		registerError: req.flash("registerError"),
	});
});

router.get("/logout", async (req, res) => {
	//-для очистки базы данных при выходе вызываем метод destroy у session

	req.session.destroy(() => res.redirect("/auth/login#login"));
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
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
	} catch (error) {}
});

//-регистрация для создания нового пользователя
router.post("/register", async (req, res) => {
	try {
		//-забираем из ответа поля формы
		const { email, password, repeat, name } = req.body;
		//-проверяем существует ли пользователь с таким имейлом
		//-создаем переменную candidate и обращаемся к моделе пользователя и вызываем метод findOne() куда передаем имейл
		const candidate = await User.findOne({ email });
		if (candidate) {
			//-если есть совпадение
			//-сообщаем об ошибке. Первый параметр ключ сообщения
			req.flash("registerError", "User alredy exist this email");
			res.redirect("/auth/login#register");
		} else {
			//-если нет совпадения зарегистрировать
			//-шифруем пароль
			const hashPassword = await bcrypt.hash(password, 10); //- 10 - это сложность шифрования
			const user = new User({
				email,
				name,
				password: hashPassword,
				cart: { items: [] },
			});
			await user.save();
			res.redirect("/auth/login#login");
		}
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
