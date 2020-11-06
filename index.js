const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const Handlebars = require("handlebars");
const expressHandlebars = require("express-handlebars");
const {
	allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

const homeRoutes = require("./routes/home");
const cartRoutes = require("./routes/cart");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");

const MONGODB_URI =
	"mongodb+srv://tim:tFfQSVHiKWXry7Lt@cluster0.rj3ex.mongodb.net/shop";

const app = express(); //- сервер
const hbs = expressHandlebars.create({
	defaultLayout: "main",
	extname: "hbs",
	handlebars: allowInsecurePrototypeAccess(Handlebars),
}); //- конфигурация движка handlebars(extname - название расширения, по умолчанию handlebars)

//! Создание хранилища сессий
const store = new MongoStore({
	collection: "sessions",
	uri: MONGODB_URI,
});

////! конфигурация движка
////-регистрация модуля hbs как движок для рендеринга HTMl страниц
app.engine("hbs", hbs.engine);
////- использование движка
app.set("view engine", "hbs");
//-доступ до папки с HTML файлами
app.set("views", "views");

//* блок использовался до создания пользователей
////-создаем свой мидлвэр
//app.use(async (req, res, next) => {
//	try {
//		const user = await User.findById("5f59b990024f3605ef61f054");
//		req.user = user;
//		next();
//	} catch (error) {
//		console.log(error);
//	}
//});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

//^настройка session
app.use(
	session({
		secret: "some secret",
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);
//^подключаем свой мидлвэйр
app.use(varMiddleware);
app.use(userMiddleware);
//! регистрация роутов
//-роуты вынесены из этого файла в отдельные в папку routes
app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000; //- более гибкое указание порта

//!создаем подключение к базе данных
async function start() {
	//-обработаем возможные ошибки
	try {
		await mongoose.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		});

		//* блок использовался до создания пользователей и сессий
		////- проверяем есть ли пользователь в системе
		//const candidate = await User.findOne();
		////-если пользователя нет то создаем его автоматически
		//if (!candidate) {
		//	const user = new User({
		//		email: "timbright.it@gmail.com",
		//		name: "Tim Bright",
		//		cart: { items: [] },
		//	});
		//	await user.save();
		//}

		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.log(error);
	}
}
//-вызываем подключение к базе даннных
start();
