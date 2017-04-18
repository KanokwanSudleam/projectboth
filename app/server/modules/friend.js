var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/node-login', function(err) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('Connect to mongodb')
// 	}
// })
var Schema = mongoose.Schema;
var friendlist = new Schema({
	username: String,
	list: [{ fname: String, room: String }],
	group: [{ type: String, ref: 'group' }]
})




module.exports = mongoose.model('friendlist', friendlist);
