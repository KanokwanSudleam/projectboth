var express = require('express');
var mongoose = require('mongoose');
var friendlist = require('../app/server/modules/friend')
var messagechat = require('../app/server/modules/message')
var groupchat = require('../app/server/modules/group')
var socketio = require('socket.io');
var jwt = require('jsonwebtoken');
// const translate = require('google-translate-api')
var googleTranslate = require('google-translate')("AIzaSyBIYxmb4Ye8Gcr_WvtoWaRtTJSKctST0vQ");
//var db = require('./chat-db');
var router = express.Router();
var io;

router.listen = function(server) {
	console.log('Express server listening on port ' + server);
	io = socketio.listen(server);
	//io.set('log level', 2);
	io.on('connection', function(socket) {
		webinfor_bot(socket)
		normal_chat(socket)
		chatbot(socket)
		group_chat(socket)
		webinfor(socket)
	});

}

mongoose.connect('mongodb://127.0.0.1:27017/node-login', function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connect to mongodb')
	}
})
var account = require('../app/server/modules/account')
var train = require('../app/server/modules/train')
var classschedule = require('../app/server/modules/classschedule')



// var server = http.createServer(app).listen(app.get('port'), function() {
// 	console.log('Express server listening on port ' + app.get('port'));
// });
//var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);
router.get('/', function(req, res) {

		res.send('hihihiiiihhiih')
	})
	// router.post('/webinfor/save', function(req, res) {

// 	var text = req.body.text
// 	var factory = req.body.factory1
// 	var announce = req.body.announce1
// 	var msg = {
// 		text: text,
// 		factory: factory,
// 		announce: announce,
// 		username: 'bot'
// 	}


// 	res.redirect('/webinfor');
// 	msg_web(msg)
// 	console.log(msg)

// })

// //console.log(msg)

// function msg_web(msg) {
// 	//webinfor_bot(socket, msg)


// }

function webinfor_bot(socket) {
	router.post('/webinfor/save', function(req, res) {

		var text = req.body.text
		var factory = req.body.factory1
		var announce = req.body.announce1
		var category = req.body.category
		var faculty = req.body.major
			// var id_faculty = faculty.split(",");
			// console.log(id_faculty[0])
		console.log("faculty", typeof faculty)
			// var msg = {
			// 	text: text,
			// 	factory: factory,
			// 	announce: announce,
			// 	username: 'bot'
			// }

		if (typeof faculty === "string") {
			console.log("strings")
		} else {
			for (var i = 0; i < faculty.length; i++) {

				var find_user = account.find({ "id_faculty": faculty[i] }).distinct("user", function(err, docs) {

					console.log(docs)
					for (var j = 0; j < docs.length; j++) {

						var roomname = "chatbot" + docs[j]
						socket.emit('web', {
							username: 'chatbot',
							message: docs[j]
						});
						console.log(docs[j])

						// socket.removeAllListeners()
						// socket.join(roomname);
						// io.sockets.in(roomname).emit('web', {
						// 	username: 'chatbot' + docs[j],
						// 	message: docs[j]
						// });

					}
				})
			}
		}

		// msg_web(msg)
		// console.log(msg)


		// socket.removeAllListeners()
		// socket.join('bot');
		// io.sockets.in('bot').emit('what', {
		// 	username: msg.username,
		// 	message: msg.text + msg.factory + msg.announce
		// });
		// socket.emit('chat', {
		// 	username: msg.username,
		// 	message: msg.text
		// });

		res.redirect('/webinfor');
	})

}




///////////////////////////////////////////////////////////////////////////////////////
// //send friend's name to webchat 
// app.post('/webchat', function(req, res) { //find old msg in room
// 	var room = req.body.room
// 	var fname = req.body.fname
// 	var myname = req.body.myname
// 	var text = { friend: fname, my: myname, room: room }
// 		// console.log(text)
// 	var find_msg = messagechat.findOne({ 'room': room }, function(err, data) {
// 		if (err) throw err;
// 		// console.log('find_sucess:', data.message)
// 		console.log(data.message)
// 		send_data(room, fname, myname, data.message)

// 	});
// 	//res.render('chat', text);
// 	function send_data(room, fname, myname, msgdata) {
// 		var text = { friend: fname, my: myname, room: room, msgdata: msgdata }
// 		res.render('chat', text);
// 		console.log("send_sucess", text)
// 	}
// });
////////////////////////////////////////////////////////////////////////////////////
function contains(a, obj) {
	for (var i = 0; i < a.length; i++) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}

//save new msg from client
function normal_chat(socket) {
	socket.removeAllListeners()
	socket.on('test', function(room) {
		console.log("room", room)
		socket.join(room.room);
		save_message(room.room, room.username, room.message)
		if (room.room == 'chatbot' + room.username) {
			io.sockets.in(room.room).emit('chat', room);
			py_msg(room.message, function(class_nlp) {
				//console.log(class_nlp)
				var input = class_nlp.split(",")

				var classname = input[0].trim()
					//current time
				var d = new Date()
				var currentTime = d.getHours() + "." + d.getMinutes()
				currentTime = parseFloat(currentTime)
					//next train
				if (classname == "next train") {
					var direction = input[1].replace("\r\n", "").trim()
					if (direction == "both") {
						console.log("check both")
						var msgfind = train.find({}, function(err, data) {
							for (var i = 0; i < data[0].time.length; i++) {
								if (currentTime < data[0].time[i]) {
									var newmsg = "in" + data[0].time[i]
									sendnlp(room.room, room.message, newmsg)

									break
								}
							}
							for (var i = 0; i < data[1].time.length; i++) {
								if (currentTime < data[1].time[i]) {
									var outmsg = "out" + data[1].time[i]
									console.log(outmsg)
									sendnlp(room.room, room.message, outmsg)
									break
								}
							}
						})


					} else {
						console.log("check in out")
						var msgfind = train.findOne({ 'direction': direction }, function(err, data) {
							for (var i = 0; i < data.time.length; i++) {
								if (currentTime < data.time[i]) {
									console.log(data.time[i])
									sendnlp(room.room, room.message, data.time[i])
									break
								}
							}
						})

					}
					//train table
				} else if (classname == "train table") {
					var direction = input[1].replace("\r\n", "").trim()
					if (direction == "both") {
						var bothimg = ["<img src=" + "\"" + "/img/train.jpg" + "\"" + "class=" + "\"" + "img-responsive" + "\"" + "height=" + "\"" + "150" + "\"" + "width=" + "\"" + "180" + "\"" + ">", "<img src=" + "\"" + "/img/train.jpg" + "\"" + "class=" + "\"" + "img-responsive" + "\"" + "height=" + "\"" + "150" + "\"" + "width=" + "\"" + "180" + "\"" + ">"]
						for (var i = 0; i < bothimg.length; i++) {
							sendnlp(room.room, room.message, bothimg[i])

						}
						console.log("picture of in and out table")
					} else if (direction == "in") {
						var img = "<img src=" + "\"" + "/img/train.jpg" + "\"" + "class=" + "\"" + "img-responsive" + "\"" + "height=" + "\"" + "150" + "\"" + "width=" + "\"" + "180" + "\"" + ">"

						console.log("in picture")
						sendnlp(room.room, room.message, img)
					} else {
						var outimg = " <img src = " + "\"" + "/img/train.jpg" + "\"" + "class=" + "\"" + "img-responsive" + "\"" + "height=" + "\"" + "150" + "\"" + "width=" + "\"" + "180" + "\"" + ">"
						console.log("out picture")
						sendnlp(room.room, room.message, outimg)
					}
				}
				//class schedule
				else if (classname == "class schedule") {
					var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
					var day = input[1]
					var time = input[2]
					var subject = input[3].replace("\r\n", "").trim()
					var d = new Date()
					var currentDay = d.getDay()
					var classen = account.findOne({ "user": room.username }, function(err, data) {

						classEnrolled = data.classEnrolled
						if (subject != "") {
							if (contains(classEnrolled, subject)) {
								var output = classschedule.findOne({ "data.subject": subject }, { 'data.$': 1 }, function(err, result) {
										console.log(result.data[0].subject)
										console.log(result.data[0].date)
										console.log(result.data[0].time)
										var msgsub = result.data[0].subject + " " + result.data[0].date + " " + result.data[0].time
										sendnlp(room.room, room.message, msgsub)
									})
									// console.log(output.data.subject)
							} else {
								console.log("you don't have this subject")
								var test = "you don't have this subject"
								sendnlp(room.room, room.message, test)

							}
						} else if (time == "none") {
							if (day == "tomorrow")
								currentDay = (currentDay + 1) % 7
							else if (day == "after tomorrow")
								currentDay = (currentDay + 2) % 7
							else if (day == "yesterday")
								currentDay = (currentDay - 1) % 7

							//var output = classschedule.findOne({ "data.date": days[currentDay] }, function(err, data) {
							var output = classschedule.findOne({ "data.date": days[currentDay] }, function(err, data) {
								for (var i = 0; i < data.data.length; i++) {
									if (data.data[i].date == days[currentDay] && contains(classEnrolled, data.data[i].subject)) {
										console.log(data.data[i].subject)
										console.log(data.data[i].date)
										console.log(data.data[i].time)
										var misub = data.data[i].subject + " " + data.data[i].date + " " + data.data[i].time
										sendnlp(room.room, room.message, misub)
									}
								}

							})

						} else {
							if (day == "tomorrow")
								currentDay = (currentDay + 1) % 7
							else if (day == "after tomorrow")
								currentDay = (currentDay + 2) % 7
							else if (day == "yesterday")
								currentDay = (currentDay - 1) % 7

							var output = classschedule.findOne({ "data.date": days[currentDay] }, function(err, data) {
								for (var i = 0; i < data.data.length; i++) {
									if (data.data[i].date == days[currentDay] && data.data[i].time == time) {
										console.log(data.data[i].subject)
										console.log(data.data[i].date)
										console.log(data.data[i].time)
										var minsub = "Subject:" + data.data[i].subject + "Date:" + data.data[i].date + "Time:" + data.data[i].time
										sendnlp(room.room, room.message, minsub)
									}
								}

							})


						}






					})
				}
				//exam time
				else if (classname == "exam schedule") {
					var day = input[1].trim()
					var time = input[2].trim()
					var subject = input[3].replace("\r\n", "").trim()
					var d = new Date()
					var currentDate = d.getDate()
					var currentMonth = d.getMonth()
					var classen = account.findOne({ "user": room.username }, function(err, data) {

						classEnrolled = data.classEnrolled
						if (subject != "") {
							if (contains(classEnrolled, subject)) {
								var output = classschedule.findOne({ "data.subject": subject }, { 'data.$': 1 }, function(err, result) {

										console.log(result.data[0].subject)
										console.log(result.data[0].examdate)
										console.log(result.data[0].exammonth)
										var textsub = result.data[0].subject + " " + result.data[0].examdate + " " + result.data[0].exammonth
										sendnlp(room.room, room.message, textsub)
									})
									// console.log(output.data.subject)
							} else {
								console.log("you don't have this subject")
								sendnlp(room.room, room.message, "you don't have this subject")
							}
						} else if (time == "none") {
							if (day == "tomorrow")
								currentDate = (currentDate + 1)
							else if (day == "after tomorrow")
								currentDate = (currentDate + 2)
							else if (day == "yesterday")
								currentDate = (currentDate - 1)

							//var output = classschedule.findOne({ "data.date": days[currentDay] }, function(err, data) {
							var output = classschedule.findOne({ "data.exammonth": currentMonth }, function(err, data) {
								console.log(data)
								for (var i = 0; i < data.data.length; i++) {

									//if (data.data[i].exammonth == currentMonth && data.data[i].examdate == currentDate&& contains(classEnrolled ,data.data[i].subject ))
									if (contains(classEnrolled, data.data[i].subject)) {

										console.log(data.data[i].subject)
										console.log(data.data[i].examtime)
										var exesub = data.data[i].subject + " " + data.data[i].examtime
										sendnlp(room.room, room.message, exesub)

									} else { console.log("you dont have exam in this day") }

								}

							})

						}

					})


				}
				//class table
				else if (classname == "class table") {
					var classen = account.findOne({ "user": room.username }, function(err, data) {
						classEnrolled = data.classEnrolled
						var output = classschedule.findOne({ "data.subject": classEnrolled[0] }, function(err, result) {
							for (var i = 0; i < result.data.length; i++) {
								if (contains(classEnrolled, result.data[i].subject)) {

									console.log(result.data[i].subject)
									console.log(result.data[i].date)
									console.log(result.data[i].time)
									var subtime = result.data[i].subject + " " + result.data[i].date + " " + result.data[i].time
									sendnlp(room.room, room.message, subtime)
								}
							}

						})
					})
				} else if (classname == "exam table") {
					var classen = account.findOne({ "user": room.username }, function(err, data) {
						classEnrolled = data.classEnrolled
						var output = classschedule.findOne({ "data.subject": classEnrolled[0] }, function(err, result) {
							for (var i = 0; i < result.data.length; i++) {
								if (contains(classEnrolled, result.data[i].subject)) {

									console.log(result.data[i].subject)
									console.log(result.data[i].examdate)
									console.log(result.data[i].exammonth)
									console.log(result.data[i].examtime)
									var exetable = result.data[i].subject + " " + result.data[i].examdate + " " + result.data[i].exammonth + " " + result.data[i].examtime
									sendnlp(room.room, room.message, exetable)
								}
							}

						})
					})
				} else if (classname == "teacher") {
					subject = input[1].trim()
					var output = classschedule.findOne({ "data.subject": subject }, { 'data.$': 1 }, function(err, result) {
						console.log(result)
						console.log(result.data[0].teacher)

						sendnlp(room.room, room.message, result.data[0].teacher)
					})

				} else if (classname == "add event") {
					var new_data = {
							new_username: 'bot',
							new_message: room.message,
							nlp_msg: classname
						}
						// save_message(room.room, new_data.new_username, new_data.nlp_msg)
					io.sockets.in(room.room).emit('chat', new_data);

				} else {
					console.log("addddadddd", classname)
					var new_data = {
						new_username: 'bot',
						new_message: room.message,
						nlp_msg: classname
					}
					save_message(room.room, new_data.new_username, new_data.nlp_msg)
					io.sockets.in(room.room).emit('chat', new_data);
				}
			})

		} else {
			if (room.message.slice(0, 4) === "@bot") {
				var msg_nlp = room.message.split("@bot");
				py_msg(msg_nlp[1], function(class_nlp) {
					//console.log(class_nlp)
					var bot_res = {
						new_username: 'bot',
						new_room: room.room,
						new_message: room.message,
						nlp_msg: class_nlp
					}
					console.log('show', bot_res)
					save_message(room.room, bot_res.new_username, bot_res.nlp_msg)
					io.sockets.in(room.room).emit('message', bot_res);
				})

			} else {
				io.sockets.in(room.room).emit('message', room);
			}

		}
	});
}

function sendnlp(room, message, class_nlp) {
	var new_data = {
		new_username: 'bot',
		new_message: message,
		nlp_msg: class_nlp
	}
	save_message(room, new_data.new_username, new_data.nlp_msg)
	io.sockets.in(room).emit('chat', new_data);
}
//////////webinfor////////////
function webinfor(socket) {
	// socket.removeAllListeners()
	// socket.removeAllListeners()
	socket.on('webinfor_chat', function(data) {
		console.log("data", data)
			// socket.emit('what', {
			// 	username: 'bot',
			// 	message: "docs[j]"
			// });

		socket.join('bot');
		io.sockets.in('bot').emit('chat', {
			username: 'bot',
			message: "msg.text + msg.factory + msg.announce",
			nlp_msg: "test"
		});


		// for (var i = 0; i < data.id_major.length; i++) {

		// 	var find_user = account.find({ "id_faculty": data.id_major[i] }).distinct("user", function(err, docs) {

		// 		console.log(docs)
		// 		for (var j = 0; j < docs.length; j++) {

		// 			var roomname = "chatbot" + docs[j]
		// 			socket.emit('chat', {
		// 				username: 'bot',
		// 				nlp_msg: docs[j]
		// 			});
		// 			console.log("docs", docs[j])

		// 			// socket.removeAllListeners()
		// 			// socket.join(roomname);
		// 			// io.sockets.in(roomname).emit('web', {
		// 			// 	username: 'chatbot' + docs[j],
		// 			// 	message: docs[j]
		// 			// });

		// 		}
		// 	})
		// }

	});
}
//////////group group group////////////
function group_chat(socket) {
	// socket.removeAllListeners()
	socket.on('group', function(room) {
		socket.join(room.group);
		save_group(room.group, room.username, room.message)
		io.sockets.in(room.group).emit('group', room);
	});
}


////////// bot bot bot ////////////////
function chatbot(socket) {

	socket.on('wtf', function(data) {
		console.log(data)
		socket.join('bot');
		save_message(data.room, data.username, data.message)
		io.sockets.in('bot').emit('chat', data);
		py_msg(data.message, function(class_nlp) {
				//console.log(class_nlp)
				var new_data = {
					new_username: 'bot',
					new_message: data.message,
					nlp_msg: class_nlp
				}
				save_message(data.room, new_data.new_username, new_data.nlp_msg)
				io.sockets.in('bot').emit('chat', new_data);
			})
			// console.log(data.username, data.message)
			// socket.join(data.room);
			// io.sockets.in(data.room).emit('chat', data);
	})
}


function save_message(name_room, name_user, new_message) {
	var save_msg = messagechat.findOne({ 'room': name_room }, function(err, user) {
		//if (err) throw err;
		if (user == null) {
			var create_msg = new messagechat({ room: name_room, message: [{ name: name_user, msg: new_message }] });
			create_msg.save(function(err) {
				// we've saved the myfriend into the db here
				if (err) throw err;
				console.log('save sucess')
			});
		} else {
			var update_msg = messagechat.findOneAndUpdate({ room: name_room }, { $push: { "message": { name: name_user, msg: new_message } } }, { safe: true, upsert: true, new: true },
				function(err, user) {
					if (err) throw err;

					console.log('update_sucess')

				});




		}
	});
}

function save_group(name_group, name_user, message) {
	var update_msg = groupchat.findOneAndUpdate({ name_group: name_group }, { $push: { "message": { name: name_user, msg: message } } }, { safe: true, upsert: true, new: true },
		function(err, user) {
			if (err) throw err;

			console.log('update_sucess')

		});






}

function py_msg(msg, class_msg) {



	function include(arr, obj) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == obj) return true;
		}
	}



	var spawn = require('child_process').spawn;
	var scriptExecution = spawn("python", ["script.py"]);
	// Handle normal output
	scriptExecution.stdout.on('data', function(data) {
		//console.log("what", String.fromCharCode.apply(null, data));
		class_msg(String.fromCharCode.apply(null, data));

	});

	// Write data (remember to send only strings or numbers, otherwhise python wont understand)
	//var data = JSON.stringify("ฝนตกมั๊ย");

	var data = JSON.stringify(msg);
	//console.log(data)
	//scriptExecution.stdin.write(data);
	scriptExecution.stdin.write(jwt.sign({ 'some': data }, "secret"));
	// End data write
	scriptExecution.stdin.end();

}
// translate('Ik spreek Engels', { to: 'th' }).then(res => {
// 	console.log(res.text);
// 	//=> I speak English 
// 	console.log(res.from.language.iso);
// 	//=> nl
// 	// var word = res.text; //ans
// 	// callback(word)

// }).catch(err => {
// 	console.error(err);
// });
// googleTranslate.translate('My name is Brandon', 'es', function(err, translation) {
// 	console.log(translation.translatedText);
// 	// =>  Mi nombre es Brandon
// });


// function googletranslate(text, callback) {


// 	translate(text, { to: 'en' }).then(res => {
// 		console.log(res.text); // => I speak English
// 		console.log(res.from.language.iso); //=> nl
// 		// var word = res.text; //ans
// 		// callback(word)

// 	}).catch(err => {
// 		console.error(err);
// 	});
// };

// var save_data = new train({
// 	direction: "out",
// 	time: [7.00, 7.38, 8.19, 8.55, 11.07, 13.01, 13.46, 16.16, 17.26, 18.04, 18.39, 19.11, 19.22]
// });
// save_data.save(function(err) {
// 	// we've saved the myfriend into the db here
// 	if (err) throw err;
// 	console.log('save sucess')
// });

module.exports = router;
