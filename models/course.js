//- импортируем класс Schema и функцию model
const { Schema, model } = require("mongoose");

//- создаем инстанс класса Schema
const courseSchema = new Schema({
	//- описываем поля курса
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	img: String,
	//-поле id mongoose будет добавлять самостоятельно
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
});

//-этот метод изменяет _id на id для передачи его на клиент в частности в cart.hbs в в поле data-id="{{id}}
//-чтобы не писать data-id="{{_id}} с нижним подчеркиванием
courseSchema.method("toClient", function () {
	const course = this.toObject();
	course.id = course._id;
	delete course._id;

	return course;
});

module.exports = model("Course", courseSchema);
//-первый параметр название модели, второй параметр это схема
