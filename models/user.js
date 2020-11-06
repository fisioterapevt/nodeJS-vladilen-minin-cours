const { Schema, model } = require("mongoose");
//const course = require("./course");

const userSchema = new Schema({
	email: { type: String, required: true },
	name: { type: String, required: true },
	cart: {
		items: [
			{
				count: { type: Number, required: true, default: 1 },
				courseId: {
					type: Schema.Types.ObjectId,
					ref: "Course", //- должен совпадать с названием из model(course.js)
					required: true,
				},
			},
		],
	},
});

//^создаем метод сохранения в корзину
//-обязательно добавлять ключевое слово function
userSchema.methods.addToCart = function (course) {
	//-чтобы не было мутаций создаем копию массива items у cart через оператор spread(так же можно через concat())
	const clonedItems = [...this.cart.items];
	//- можно назвать items и сделать как методе removeFromCart
	const idx = clonedItems.findIndex((c) => {
		//-поскольку c.courseId это объект то для сравнения необходимо привести его к строке
		return c.courseId.toString() === course._id.toString();
	});

	//^проверяем есть ли в корзине курс с такин id
	if (idx >= 0) {
		//-если idx не -1 увеличиваем количество курсов на 1
		clonedItems[idx].count = clonedItems[idx].count + 1;
	} else {
		//-если idx равен -1 то есть курс отсутствует в корзине то добавляем его в корзину
		clonedItems.push({
			courseId: course._id,
			count: 1,
		});
	}

	//const newCart = { items: clonedItems };
	//this.cart = newCart;
	//-более короткий код
	this.cart = { items: clonedItems };

	return this.save();
};

//^создаем метод удаления из корзины
userSchema.methods.removeFromCart = function (id) {
	let items = [...this.cart.items];
	const idx = items.findIndex((c) => c.courseId.toString() === id.toString());

	if (items[idx].count === 1) {
		items = items.filter((c) => c.courseId.toString() !== id.toString());
	} else {
		items[idx].count--;
	}

	this.cart = { items }; //- та же записть что и {items: items}
	return this.save();
};

//^создаем метод очистки корзины
userSchema.methods.clearCart = function () {
	this.cart = { items: [] };
	return this.save();
};

module.exports = model("User", userSchema);
