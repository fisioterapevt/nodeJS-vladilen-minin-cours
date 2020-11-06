const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

//-получение данных курсов
router.get("/", async (req, res) => {
	//-забираем все курсы с помощью метода find
	const courses = await Course.find()
		.populate("userId", "email name")
		.select("price title img");

	res.render("courses", {
		title: "Courses",
		isCourses: true,
		courses,
	});
});

//-получить страница редактирования курса
router.get("/:id/edit", auth, async (req, res) => {
	//-проверяем доступно ли
	if (!req.query.allow) {
		//-если не разрешено переход на главную страницу
		return res.redirect("/");
	}
	//-получаем объект course
	const course = await Course.findById(req.params.id);
	//-если allo=true рендерить страницу
	res.render("course-edit", {
		title: `Edit ${course.title}`,
		course,
	});
});

//- отправить отредактированный курс
router.post("/edit", auth, async (req, res) => {
	//- получаем id из req.body
	const { id } = req.body;
	//-удаляем id из req.body поскольку mongoose самостоятельно создает id и добавляет нижнее подчеркивание _id
	//- и что бы он не попадал в req.body
	delete req.body.id;
	await Course.findByIdAndUpdate(id, req.body);
	res.redirect("/courses");
});

//-удаление курса
router.post("/remove", auth, async (req, res) => {
	try {
		await Course.deleteOne({ _id: req.body.id });
		res.redirect("/courses");
	} catch (error) {
		console.log(error);
	}
});

//- при нажатии на курс переходит на страницу с нужным курсом
router.get("/:id", async (req, res) => {
	//-получаем объект course
	const course = await Course.findById(req.params.id);
	res.render("course", {
		layout: "empty",
		title: `Course ${course.title}`,
		course,
	});
});

module.exports = router;
