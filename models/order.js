const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
	//-сохраняем какие курсы были куплены
	courses: [
		{
			course: { type: Object, required: true },
			count: { type: Number, required: true },
		},
	],
	//-сохраняем пользователя который сделал заказ
	user: {
		name: String,
		userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	//-сохраняем дату когда заказ был сделан
	date: { type: Date, default: Date.now },
});

module.exports = model("Order", orderSchema);
