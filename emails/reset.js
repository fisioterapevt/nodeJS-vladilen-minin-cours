const keys = require("../keys");

module.exports = function (email, token) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: "Reset password",
		html: `
    <h1>Do yuo want change your password?</h1>
    <p>If not, ignore this message</p>
    <p>Or, click this link below:</p>
    <p><a href="${keys.BASE_URL}/auth/password/${token}">Create new password</a></p>
    <hr/>
    <a href='${keys.BASE_URL}'>Shop</a>
    `,
	};
};
