const { Router } = require("express");
const { validationResult } = require("express-validator");

const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");

const router = Router();

//-проверочная функция является ли юзер создателем курса

function isOwner(course, req) {
	return course.userId.toString() === req.user._id.toString();
}

//-получение данных курсов
router.get("/", async (req, res) => {
	try {
		//-забираем все курсы с помощью метода find
		const courses = await Course.find()
			.populate("userId", "email name")
			.select("price title img");

		res.render("courses", {
			title: "Courses",
			isCourses: true,
			//- передаем userId для возможного редактирования курса именно тем пользователем
			//- который его создал и который активен в сессии
			//- также проверяем есть ли юзер(авторизован ли он )
			userId: req.user ? req.user._id.toString() : null,
			courses,
		});
	} catch (error) {
		console.log(error);
	}
});

//-получить страница редактирования курса
router.get("/:id/edit", auth, async (req, res) => {
	//-проверяем доступно ли
	if (!req.query.allow) {
		//-если не разрешено переход на главную страницу
		return res.redirect("/");
	}

	try {
		//-получаем объект course
		const course = await Course.findById(req.params.id);

		//-запрет заходить на страницу редактирования курса если не совпадают id
		if (!isOwner(course, req)) {
			return res.redirect("/courses");
		}
		//-если allow=true рендерить страни цу
		res.render("course-edit", {
			title: `Edit ${course.title}`,
			course,
		});
	} catch (error) {
		console.log(error);
	}
});

//- отправить отредактированный курс
router.post("/edit", auth, courseValidators, async (req, res) => {
	//- получаем id из req.body
	const { id } = req.body;
	//-получаем ошибки с помощью express-validator
	const errors = validationResult(req);
	//-если массив ошибок не пустой
	if (!errors.isEmpty()) {
		return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
	}
	try {
		//-удаляем id из req.body поскольку mongoose самостоятельно создает id и добавляет нижнее подчеркивание _id
		//- и что бы он не попадал в req.body
		delete req.body.id;

		const course = await Course.findById(id);
		//-запрет отправки отредактированного курса если не совпадают id юзера и создателя курса
		if (!isOwner(course, req)) {
			return res.redirect("/courses");
		}
		Object.assign(course, req.body);
		await course.save();
		res.redirect("/courses");
	} catch (error) {
		console.log(error);
	}
});

//-удаление курса
router.post("/remove", auth, async (req, res) => {
	try {
		//- курс удалится если совпадают id курса и id юзера
		await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
		res.redirect("/courses");
	} catch (error) {
		console.log(error);
	}
});

//- при нажатии на курс переходит на страницу с нужным курсом
router.get("/:id", async (req, res) => {
	try {
		//-получаем объект course
		const course = await Course.findById(req.params.id);
		res.render("course", {
			layout: "empty",
			title: `Course ${course.title}`,
			course,
		});
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
