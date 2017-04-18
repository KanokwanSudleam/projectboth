var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	name: String,
	email: String,
	user: String,
	pass: String,
	id_faculty: String,
	// faculty: String,
	// major: String,
	// submajor: String,
	studenid: Number,
	phone: Number,
	Time: { type: Date, default: Date.now },
	classEnrolled: Array
});



module.exports = mongoose.model('account-login', schema);
