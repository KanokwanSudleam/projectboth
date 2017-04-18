var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	room: String,
	message: [{ name: String, msg: String, Time: { type: Date, default: Date.now } }]
});



module.exports = mongoose.model('msgchat', schema);
