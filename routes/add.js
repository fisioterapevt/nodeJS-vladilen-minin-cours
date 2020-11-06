const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

//- в роуты которые не должны быть показаны без регистрации добавляем мидлвэр auth
router.get("/", auth, (req, res) => {
	res.render("add", { title: "Add courses", isAdd: true });
});

router.post("/", auth, async (req, res) => {
	////- создаем экземпляр класса Course и передаем в него данный с формы
	//const course = new Course(req.body.title, req.body.price, req.body.img);
	const course = new Course({
		title: req.body.title,
		price: req.body.price,
		img: req.body.img,
		userId: req.user,
	});

	//-обрабатываем потенциальные ошибки
	try {
		//- вызываем у метод save класса Course
		await course.save();
		res.redirect("/courses");
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
