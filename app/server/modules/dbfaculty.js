var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	faculty: String,
	major: [{ main: String, sub: [{ major: String }] }]
});

module.exports = mongoose.model('faculty', schema);
