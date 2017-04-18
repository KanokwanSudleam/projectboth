var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var classschedule = new Schema({
	faculty: String,
	department: String,
	major: String,
	id_major: String,
	year: String,
	data: [{
		id_subject: Number,
		subject: String,
		datetime: String,
		classroom: String,
		building: String,
		teacher: String,
		date: String,
		time: String,
		examdate: Number,
		exammonth: Number,
		examtime: String
			//exam time
	}]



});

module.exports = mongoose.model('classschedule', classschedule);
