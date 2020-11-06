const { Router } = require("express");
const Course = require("../models/course");
const auth = require("../middleware/auth");
const router = Router();

//-создаем функцию хелпер для создания плоского массива курсов содержащегося в корзине пользователя
function mapCartItems(cart) {
	//console.log(" from mapCartItems", cart.items);
	return cart.items.map((c) => ({
		...c.courseId._doc,
		id: c.courseId.id,
		count: c.count,
	}));
}
//-создаем функцию хелпер для подсчета стоимости курсов содержащихся в корзине пользователя
function computePrice(courses) {
	return courses.reduce((total, course) => {
		return (total += course.price * course.count);
	}, 0);
}

//- добавляем в корзину
router.post("/add", auth, async (req, res) => {
	//-получаем пользователя
	const course = await Course.findById(req.body.id);
	//-получаем пользователя
	//await Cart.add(course);
	await req.user.addToCart(course);
	res.redirect("/cart");
});

//- удаляем из корзины
router.delete("/remove/:id", auth, async (req, res) => {
	await req.user.removeFromCart(req.params.id);
	//console.log(req.user);
	const user = await req.user.populate("cart.items.courseId").execPopulate();
	//console.log("USER.CART FROM router.delete()", user.cart);
	const courses = mapCartItems(user.cart);
	//console.log("FROM DELETE", courses);

	const cart = { courses, price: computePrice(courses) };

	res.status(200).json(cart);
});

//-получаем корзину
router.get("/", auth, async (req, res) => {
	const user = await req.user.populate("cart.items.courseId").execPopulate();
	//////- создаем массив курсов из данных в корзине определенного юзера
	const courses = mapCartItems(user.cart);

	res.render("cart", {
		title: "Cart",
		isCart: true,
		courses: courses,
		price: computePrice(courses),
	});
});

module.exports = router;
