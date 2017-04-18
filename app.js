/**
 * Node.js Login Boilerplate
 * More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
 * Copyright (c) 2013-2016 Stephen Braitsch
 **/

var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
// var mongoose = require('mongoose');

var socket_server = require('./lib/socket-server.js')
	// var friendlist = require('./app/server/modules/friend')
	// var messagechat = require('./app/server/modules/message')
var cors = require("cors");
var app = express();
var path = require('path');


app.locals.pretty = true;
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));
app.use(cors());
// build mongo database connection url //

var dbHost = process.env.DB_HOST || '127.0.0.1'
var dbPort = process.env.DB_PORT || 27017;
var dbName = process.env.DB_NAME || 'node-login';

var dbURL = 'mongodb://' + dbHost + ':' + dbPort + '/' + dbName;
if (app.get('env') == 'live') {
	// prepend url with authentication credentials // 
	dbURL = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + dbHost + ':' + dbPort + '/' + dbName;
}
// mongoose.connect('mongodb://127.0.0.1:27017/node-login', function(err) {
// 	if (err) {
// 		console.log(err);
// 	} else {
// 		console.log('Connect to mongodb')
// 	}
// })
var web = require('./lib/socket-server.js');
app.use('/web', web);


app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	// store: new MongoStore({ url: dbURL })
}));

require('./app/server/routes')(app);



var server = http.createServer(app).listen(app.get('port'));
socket_server.listen(server);

module.exports = app;




// var myfriend = new friendlist({ username: 'long', list: [{ fname: 'chatbot', room: 'usernamefriendname' }] });
// myfriend.save(function(err) {
// 	// we've saved the myfriend into the db here
// 	if (err) throw err;
// 	console.log('save sucess')
// });
// friendlist.findOneAndUpdate({ username: 'A' }, { list: [{ fname: 'F' }, { fname: 'C' }, { fname: 'D' }] }, function(err, user) {
// 	if (err) throw err;

// 	// we have the updated user returned to us
// 	console.log(friendlist);
// });
////////////////////////////////////////////////////////////////////////////////////////////////////////
// var message_chat = require('./app/server/modules/message')
// 	//console.log(message_chat)
// var create_msg = new message_chat({ room: 'nameroom' });
// create_msg.save(function(err) {
// 	// we've saved the myfriend into the db here
// 	if (err) throw err;
// 	console.log('save sucess')
// });
/////////////////////////////////////////////////////////////////////////////////////////////////////////


// var server = http.createServer(app).listen(app.get('port'), function() {
// 	console.log('Express server listening on port ' + app.get('port'));
// });
// var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] })(server);

// io.on('connection', function(socket) {
// 	app.post('/webinfor/save', function(req, res) {

// 		var text = req.body.text
// 		var factory = req.body.factory1
// 		var announce = req.body.announce1
// 		var msg = {
// 			text: text,
// 			factory: factory,
// 			announce: announce,
// 			username: 'bot'
// 		}
// 		console.log(msg)
// 		socket.removeAllListeners()
// 		socket.join('bot');
// 		io.sockets.in('bot').emit('what', {
// 			username: msg.username,
// 			message: msg.text + msg.factory + msg.announce
// 		});
// 		// socket.emit('chat', {
// 		// 	username: msg.username,
// 		// 	message: msg.text
// 		// });

// 		res.redirect('/webinfor');
// 	})
// })


// ///////////////////////////////////////////////////////////////////////////////////////
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
// ////////////////////////////////////////////////////////////////////////////////////
// io.on('connection', function(socket) { //save new msg from client
// 	socket.removeAllListeners()
// 	socket.on('test', function(room) {
// 		socket.join(room.room);
// 		//console.log(room)
// 		save_message(room.room, room.username, room.message)
// 		if (room.message.slice(0, 4) === "@bot") {
// 			var msg_nlp = room.message.split("@bot");
// 			py_msg(msg_nlp[1], function(class_nlp) {
// 				//console.log(class_nlp)
// 				var bot_res = {
// 					new_username: 'bot',
// 					new_room: room.room,
// 					new_message: room.message,
// 					nlp_msg: class_nlp
// 				}
// 				console.log('show', bot_res)
// 				io.sockets.in(room.room).emit('message', bot_res);
// 			})

// 		} else {
// 			io.sockets.in(room.room).emit('message', room);
// 		}
// 	});
// 	////////// bot bot bot ////////////////
// 	socket.on('wtf', function(data) {
// 		socket.join(data.room);
// 		io.sockets.in(data.room).emit('chat', data);
// 		py_msg(data.message, function(class_nlp) {
// 				//console.log(class_nlp)
// 				var new_data = {
// 					new_username: 'bot',
// 					new_room: data.room,
// 					new_message: data.message,
// 					nlp_msg: class_nlp
// 				}
// 				io.sockets.in(data.room).emit('chat', new_data);
// 			})
// 			// console.log(data.username, data.message)
// 			// socket.join(data.room);
// 			// io.sockets.in(data.room).emit('chat', data);
// 	});

// });

// function save_message(name_room, name_user, new_message) {
// 	var save_msg = messagechat.findOne({ 'room': name_room }, function(err, user) {
// 		//if (err) throw err;
// 		if (user == null) {
// 			var create_msg = new messagechat({ room: name_room, message: [{ name: name_user, msg: new_message }] });
// 			create_msg.save(function(err) {
// 				// we've saved the myfriend into the db here
// 				if (err) throw err;
// 				console.log('save sucess')
// 			});
// 		} else {
// 			var update_msg = messagechat.findOneAndUpdate({ room: name_room }, { $push: { "message": { name: name_user, msg: new_message } } }, { safe: true, upsert: true, new: true },
// 				function(err, user) {
// 					if (err) throw err;

// 					console.log('update_sucess')

// 				});




// 		}
// 	});
// }

// function py_msg(msg, class_msg) {
// 	var english = ["w", "e", "E", "r", "R", "t", "T", "y", "u", "U", "i", "I", "o", "p", "P", "[", "{", "]",
// 		"a", "A", "s", "S", "d", "D", "f", "F", "g", "G", "h", "H", "j", "J", "k", "K", "l", "L",
// 		";", ":", "q", "z", "x", "c", "C", "v", "V", "b", "n", "N", "m", ",", "<", ".", ">", "/", "?",
// 		"1", "4", "5", "6", "^", "7", "8", "9", "0", "-", "="
// 	]
// 	var thai = ["ไ", "ำ", "ฎ", "พ", "ฑ", "ะ", "ธ", "ั", "ี", "๊", "ร", "ณ", "น", "ย", "ญ", "บ", "ฐ", "ล", "ฟ",
// 		"ฤ", "ห", "ฆ", "ก", "ฏ", "ด", "โ", "เ", "ฌ", "้", "็", "่", "๋", "า", "ษ", "ส", "ศ", "ว", "ซ", "ง",
// 		"ผ", "ป", "แ", "ฉ", "อ", "ฮ", "ิ", "ื", "์", "ท", "ม", "ฒ", "ใ", "ฬ", "ฝ", "ฦ", "ๅ", "ภ", "ถ", "ุ", "ู", "ึ", "ค", "ต", "จ", "ข", "ช"
// 	]


// 	function include(arr, obj) {
// 		for (var i = 0; i < arr.length; i++) {
// 			if (arr[i] == obj) return true;
// 		}
// 	}

// 	function ThaiToEng(a) {
// 		//convert to array
// 		var temp = [];
// 		for (var i = 0; i < a.length; i++) {
// 			temp.push(a[i]);
// 		}
// 		//find index
// 		var index = []
// 		for (var i = 0; i < temp.length; i++) {
// 			if (include(thai, temp[i])) {
// 				index.push(thai.indexOf(temp[i]));
// 			}
// 		}
// 		//covert to englsh
// 		var b = "";
// 		for (var i = 0; i < index.length; i++) {
// 			b = b.concat(english[index[i]]);
// 		}
// 		return (b);
// 	}


// 	var spawn = require('child_process').spawn;
// 	var scriptExecution = spawn("python", ["script.py"]);
// 	// Handle normal output
// 	scriptExecution.stdout.on('data', function(data) {
// 		//console.log("what", String.fromCharCode.apply(null, data));
// 		class_msg(String.fromCharCode.apply(null, data));

// 	});

// 	// Write data (remember to send only strings or numbers, otherwhise python wont understand)
// 	//var data = JSON.stringify("ฝนตกมั๊ย");

// 	var data = JSON.stringify(ThaiToEng(msg));
// 	//console.log(data)
// 	scriptExecution.stdin.write(data);

// 	// End data write
// 	scriptExecution.stdin.end();

// }
