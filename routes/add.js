const { Router } = require("express");
const { validationResult } = require("express-validator");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");

const router = Router();

//- в роуты которые не должны быть показаны без регистрации добавляем мидлвэр auth
router.get("/", auth, (req, res) => {
	res.render("add", { title: "Add courses", isAdd: true });
});
//-создаем новый курс с валидированием полей
router.post("/", auth, courseValidators, async (req, res) => {
	//-получаем ошибки с помощью express-validator
	const errors = validationResult(req);
	//-если массив ошибок не пустой
	if (!errors.isEmpty()) {
		return res.status(422).render("add", {
			title: "Add courses",
			isAdd: true,
			//-выводим первое сообщение из массива
			error: errors.array()[0].msg,
			//-для того что бы при ошибке данные с формы не удалялись создаем объект дата с введенными данными
			data: {
				title: req.body.title,
				price: req.body.price,
				img: req.body.img,
			},
		});
	}

	//- создаем экземпляр класса Course и передаем в него данный с формы
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
