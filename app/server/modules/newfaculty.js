var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	faculty: String,
	department: String,
	major: String
});

module.exports = mongoose.model('newfaculty', schema);
