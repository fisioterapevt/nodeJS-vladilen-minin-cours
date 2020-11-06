const { Router } = require("express");
const Order = require("../models/order");
const auth = require("../middleware/auth");
const router = Router();

//^рендерим страницу
router.get("/", auth, async (req, res) => {
	try {
		//-получаем все заказы относящиеся к данному id пользователя
		const orders = await Order.find({
			"user.userId": req.user._id,
		}).populate("user.userId");

		res.render("orders", {
			isOrder: true,
			title: "Orders",
			orders: orders.map((o) => {
				return {
					...o._doc,
					price: o.courses.reduce((total, c) => {
						return (total += c.count * c.course.price);
					}, 0),
				};
			}),
		});
	} catch (error) {
		console.log(error);
	}
});

//^обрабатываем запрос на заказ
router.post("/", auth, async (req, res) => {
	//-оборачиваем в try catch это хорошая практика для асинхронных функций
	try {
		//-получаем объект пользователя где есть корзина
		const user = await req.user
			.populate("cart.items.courseId")
			.execPopulate();
		//-получаем все курсы которые в корзине
		//- метод map возвращает объект
		const courses = user.cart.items.map((i) => ({
			count: i.count,
			course: { ...i.courseId._doc },
		}));
		//- создаем заказ из модели Order
		const order = new Order({
			user: { name: req.user.name, userId: req.user },
			courses: courses,
		});

		//-подождать когда создатся заказ
		await order.save();
		//-очистить корзину методом из модели user
		await req.user.clearCart();
		//- вернуться на страницу с заказами
		res.redirect("/orders");
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
