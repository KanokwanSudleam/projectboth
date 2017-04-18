var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	direction: String,
	time: Array
});



module.exports = mongoose.model('train', schema);
