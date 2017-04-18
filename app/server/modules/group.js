var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/node-login', function(err) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('Connect to mongodb')
// 	}
// })
var Schema = mongoose.Schema;
var group = new Schema({
	name_group: { type: String, unique: true },
	member: { type: Array, unique: true },
	message: [{ name: String, msg: String, Time: { type: Date, default: Date.now } }]

});

module.exports = mongoose.model('group', group);
