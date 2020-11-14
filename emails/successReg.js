const keys = require("../keys");

module.exports = function (email) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: "Успешная регистрация",
		html: `
    <h1>Welcome to oure shop</h1>
    <p>You have successfully registered</p>
    <p>Your Email - ${email}</p>
    <hr/>
    <a href='${keys.BASE_URL}'>Shop</a>
    `,
	};
};
