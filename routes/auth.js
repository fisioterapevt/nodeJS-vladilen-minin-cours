const { Router } = require("express");
const User = require("../models/user");
const router = Router();

router.get("/login", async (req, res) => {
	res.render("auth/login", { title: "Authorization", isLogin: true });
});

router.get("/logout", async (req, res) => {
	//-для очистки базы данных при выходе вызываем метод destroy у session

	req.session.destroy(() => res.redirect("/auth/login#login"));
});

router.post("/login", async (req, res) => {
	const user = await User.findById("5f59b990024f3605ef61f054");
	//-добавляем пользователя в сессию
	req.session.user = user;
	req.session.isAuthenticated = true;
	req.session.save((err) => {
		if (err) {
			throw err;
		} else {
			res.redirect("/");
		}
	});
});

router.post("/register");

module.exports = router;
