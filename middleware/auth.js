//-не позволяет переходить на роуты если нет авторизации
module.exports = function (req, res, next) {
	if (!req.session.isAuthenticated) {
		return res.redirect("/auth/login");
	}
	next();
};
