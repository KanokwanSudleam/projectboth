var express = require('express');
// var router = express.Router();
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var FY = require('./modules/Faculty');
var mongoose = require('mongoose');
var friendlist = require('./modules/friend')
var messagechat = require('./modules/message')
var groupchat = require('./modules/group')
	// var dbfaculty = require('./modules/dbfaculty')
var dbfaculty = require('./modules/newfaculty')
var classschedule = require('./modules/classschedule')
	// var messagechat = require('./modules/message')
	//router.use('/chat', require('./chat/webchat'));
	//var messagechat = require('./modules/message');


module.exports = function(app) {
	// main login page //
	app.get('/', function(req, res) {
		// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined) {
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		} else {
			// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o) {
				if (o != null) {
					req.session.user = o;
					res.redirect('/home');
				} else {
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});

	app.post('/', function(req, res) {
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o) {
			if (!o) {
				res.status(400).send(e);
			} else {
				req.session.user = o;
				if (req.body['remember-me'] == 'true') {
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}

		});
	});

	app.post('/webchat', function(req, res) { //find old msg in room
		var room = req.body.room
		var fname = req.body.fname
		var myname = req.body.myname
		var text = { friend: fname, my: myname, room: room }
			// console.log(text)
		var find_msg = messagechat.findOne({ 'room': room }, function(err, data) {
			if (err) throw err;
			// console.log('find_sucess:', data.message)
			console.log(data.message)
			send_data(room, fname, myname, data.message)

		});
		//res.render('chat', text);
		function send_data(room, fname, myname, msgdata) {
			var text = { friend: fname, my: myname, room: room, msgdata: msgdata }
			res.render('chat', text);
			console.log("send_sucess", text)
		}
	});
	app.get('/chat', function(req, res) {
		res.render('index');
	});
	app.get('/angular', function(req, res) {
		res.render('angular');
	});
	app.get('/both', function(req, res) {
		res.render('index2');
	});
	app.get('/addfriend', function(req, res) {
		// if (req.session.user == null) {
		// 	// if user is not logged-in redirect back to login page //
		// 	res.redirect('/');
		// } else {
		var nuser = req.session.user
		var tt = friendlist.findOne({ 'username': nuser.user }, function(err, user) {
			//if (err) throw err;
			if (user == null) {
				var myfriend = new friendlist({ username: nuser.user, list: [{ fname: 'chatbot', room: 'chatbot' }] });
				myfriend.save(function(err) {
					// we've saved the myfriend into the db here
					if (err) throw err;
					console.log('save sucess')
				});
			} else {
				console.log('have a user')
					//var test = { test: user.list };
					//var test = { fname: 'chat' }
					//console.log(test)
					//console.log(test)
					//sdata(test);
				res.render('addfriend', {
					title: 'Control Panel',
					countries: CT,
					udata: req.session.user,
					data: user.list

				});
				//res.render('addfriend', test);
				// }
				//console.log(user)
			}
		});
		//}

	});

	app.post('/addfriend', function(req, res) {
		var name_friend = req.body.friend
		var username = req.body.username
		var roomname = username + name_friend;
		var ff = friendlist.findOneAndUpdate({ username: username }, { $push: { "list": { fname: name_friend, room: roomname } } }, { safe: true, upsert: true, new: true },
			function(err, user) {
				if (err) throw err;
				// var test = { test: user.list };
				// //console.log(test)
				// sdata(test);
				if (user != null) {
					var bb = friendlist.findOneAndUpdate({ username: name_friend }, { $push: { "list": { fname: username, room: roomname } } }, { safe: true, upsert: true, new: true },
						function(err, user) {
							if (err) throw err;

							console.log('ss')
							res.redirect('/fristpage');
						}
					)
				} else {
					console.log('sucess')
					res.redirect('/fristpage');
				}
			});


	});
	/////////////////////////////////////////////////////////////////////////////////////////////////
	app.get('/chat/:fname/:room/:username', function(req, res) {

		var fname = req.params.fname;
		var room = req.params.room;
		var myname = req.params.username
		var history_msg = {}
			//var text = { friend: fname, my: myname, room: room, msgdata: 'msgdata' }

		// console.log(fname)
		// console.log(room)
		// console.log(myname)
		//res.render('chat', text);
		//console.log(room)

		var msgfind = messagechat.findOne({ 'room': room }, function(err, data) {
			//if (err) throw err;
			// console.log('find_sucess:', data.message)
			// console.log(data.message)
			console.log('data', data)
			if (data == null) {
				var addmsg = new messagechat({ room: room, message: { name: 'bot', msg: "start with" + fname } })
				addmsg.save(function(err) {
						console.log('save freind message')
						var text = { message: { name: 'bot', msg: "start with" + fname } }
						send_normal(room, fname, myname, text.message)
					})
					// send_normal(room, fname, myname, data.message)

				// console.log('data  null get', data)
				// console.log('data  null get name', data.message.name)
				// console.log('data  null get msg', data.message.msg)

				// var text = { message: { name: 'bot', msg: "start with" + fname } }
				// send_normal(room, fname, myname, text.message)
			} else {
				send_normal(room, fname, myname, data.message)
			}
		});

		//res.render('chat', text);
		function send_normal(room, fname, myname, msgdata) {
			var text = { msgdata: msgdata }
			console.log('msgdata', msgdata)
			console.log('text', text)
			console.log('text msgdata', text.msgdata)

			var profile = { friend: fname, my: myname, room: room }
				//var text = { friend: fname, my: myname, room: room, msgdata: msgdata }
			if (room == 'chatbot' || fname == 'chatbot') {
				res.redirect('/fristpage');
			} else {
				find_list(myname, function(user) {
						//history_msg.push(text);
						console.log("user", user)
						var user_list = user.list
						var user_group = user.group
						console.log("user_group", user_group)
						res.render('fristpage', {
							udata: req.session.user,
							data: user_list,
							group: user_group,
							history: text.msgdata,
							profile: profile
						})
					})
					// console.log("send_sucess", text)
			}

		}

		function find_list(myname, user_list) {
			var list = friendlist.findOne({ 'username': myname }, function(err, user) {
				if (err) throw err;

				user_list(user)



			})
		}
	});
	/////////////////////////////////////////////////////////////////////////////////////////
	app.get('/group/:name_group', function(req, res) {
		var nuser = req.session.user.user
		var name_group = req.params.name_group


		var groupfind = groupchat.findOne({ 'name_group': name_group }, function(err, data) {
			if (err) throw err;
			console.log('data', data.member) //	data ["temp","both2"]
			console.log('msg', data.message)
				//msg [ { Time: 2017-03-24T07:34:15.155Z,
				//   _id: 58d4cbf7db1e581a0418a405,
				//   name: 'bot',
				//   msg: 'start with ryue' } ]
			var profile = { my: nuser, group: name_group }

			find_all(profile, function(user) { // have message/member/user/namegroup
				//history_msg.push(text);
				var user_list = user.list
				var user_group = user.group
				res.render('grouppage', {
					udata: req.session.user,
					data: user_list,
					group: user_group,
					history: data.message,
					member: data.member,
					profile: profile
				})
			})

		});

		function find_all(profile, user_all) {
			var list = friendlist.findOne({ 'username': profile.my }, function(err, user) {
				if (err) throw err;
				user_all(user)

			})
		}


	});
	/////////////////////////////////////////////////////////////////////////////////////////
	app.get('/member/:name_group', function(req, res) {
			var name_group = req.params.name_group
			var memberfind = groupchat.findOne({ 'name_group': name_group }, function(err, data) {
				if (err) throw err;
				console.log('data', data.member) //	data ["temp","both2"]
					//msg [ { Time: 2017-03-24T07:34:15.155Z,
					//   _id: 58d4cbf7db1e581a0418a405,
					//   name: 'bot',
					//   msg: 'start with ryue' } ]
				res.json(data.member);

			});

		})
		/////////////////////////////////////////////////////////////////////////////////////////
	app.get('/group', function(req, res) {
		var nuser = req.session.user
		var tt = friendlist.findOne({ 'username': nuser.user }, function(err, user) {
			if (err) throw err;
			console.log("user", user.list)
			res.render('group', {
				data: user.list
			});
		});
	})

	/////////////////////////////////////////////////////////////////////////////////////////
	app.get('/showfriend', function(req, res) {
		var nuser = req.session.user
		var tt = friendlist.findOne({ 'username': nuser.user }, function(err, user) {
			if (err) throw err;
			// if (user == null) {
			// 	var myfriend = new friendlist({ username: nuser.user, list: [{ fname: 'chatbot', room: 'chatbot' }] });
			// 	myfriend.save(function(err) {
			// 		// we've saved the myfriend into the db here
			// 		if (err) throw err;
			// 		console.log('save sucess')
			// 	});
			// } else {
			// 	console.log('have a user')
			// 		//var test = { test: user.list };
			// 		//var test = { fname: 'chat' }
			// 		//console.log(test)
			// 		//console.log(test)
			// 		//sdata(test);
			// 	res.render('addfriend', {
			// 		title: 'Control Panel',
			// 		countries: CT,
			// 		udata: req.session.user,
			// 		data: user.list

			// 	});
			res.json(user.list);
			// }
			//console.log(user)

		});
	})
	app.get('/facultydata', function(req, res) {
		res.json({ faculty: FY })
	})
	app.get('/facultyda', function(req, res) {
		res.json({ faculty: FY })
	})

	/////////////////////////////////////////////////////////////////////////////////////////
	app.post('/creategroup', function(req, res) {
		var name_group = req.body.name_group
		var friend_groups = req.body.friend_groups // [ 'chatbot', 'temp', 'both', 'both2' ]
		var nuser = req.session.user.user

		console.log("nuser", nuser)
		console.log("name_group", name_group)
		console.log("friend", friend_groups)

		var checkgroup = groupchat.findOne({ 'name_group': name_group }, function(err, data) {

			if (data == null) {
				create_group(name_group, friend_groups, nuser);


			} else {
				res.send("you can't create this group")
			}
		});



		function create_group(name_group, friend_groups, nuser) {

			var cf = new groupchat({ name_group: name_group })
			cf.save(function(err) {
				if (err) return handleError(err);
				console.log('save new name_group complete')
				add_member(friend_groups, name_group)
				listgroup(nuser, cf.name_group, friend_groups)

			})
		}

		function add_member(friend_groups, name_group) {
			var member_add = groupchat.findOneAndUpdate({ name_group: name_group }, { $set: { "member": friend_groups } }, { safe: true, upsert: true, new: true },
				function(err, user) {
					if (err) throw err;
					console.log('add member', user)
					if (user.message != null) {
						add_fristmsg(name_group);


					}
				})
		}

		function add_fristmsg(name_group) {
			var frist_add = groupchat.findOneAndUpdate({ name_group: name_group }, { $push: { "message": { name: 'bot', msg: "start with " + name_group } } }, { safe: true, upsert: true, new: true },
				function(err, user) {
					if (err) throw err;
					console.log('add groupmsg', user)
				})

		}

		function listgroup(nuser, name_group, friend_groups) {
			var find = friendlist.findOneAndUpdate({ username: nuser }, { $push: { "group": name_group } }, { safe: true, upsert: true, new: true }, function(err, data) {
				if (err) throw err;
				console.log("find", data)
				for (var i = 0; i < friend_groups.length; i++) {
					console.log(friend_groups[i])
					var addall = friendlist.findOneAndUpdate({ username: friend_groups[i] }, { $push: { "group": name_group } }, { safe: true, upsert: true, new: true }, function(err, data) {
						if (err) throw err;
						console.log("addall", data)
					})
				}

			})
			res.redirect('/fristpage');
		}

	});

	/////////////////////////////////////////////////////////////////////////////////////////
	app.post('/addgroup', function(req, res) { // add friend to group
		var name_group = req.body.name_group
		var namefriend = req.body.friend

		console.log(namefriend)
			// update newfriend in GroupDB
		add_group(name_group, namefriend)


		function add_group(name_group, namefriend) {
			var find = friendlist.findOneAndUpdate({ username: namefriend }, { $push: { "group": name_group } }, { safe: true, upsert: true, new: true }, function(err, data) {
				// if (err) throw err;
				if (data == null) {
					res.send('Can not found user')
				} else {
					console.log("addgroup complete", data)
					add_member(namefriend, name_group)
				}

			})
		}

		function add_member(namefriend, name_group) {
			var member_add = groupchat.findOneAndUpdate({ name_group: name_group }, { $push: { "member": namefriend } }, { safe: true, upsert: true, new: true },
				function(err, user) {
					if (err) throw err;
					console.log('add member', user)
					res.redirect('/group/' + name_group)

				})
		}
	});
	/////////////////////////////////////////////////////////////////////////////////////////
	app.post('/leavegroup', function(req, res) {
		var user = req.body.name
		var group = req.body.group

		del_member(user, group)

		function del_member(user, group) {
			var del = groupchat.update({ name_group: group }, { $pull: { "member": user } }, { safe: true, upsert: true, new: true }, function(err, data) {
				if (err) throw err;
				console.log('delete from group', data)
				group_del(user, group)

			})
		}

		function group_del(user, group) {
			var del_group = friendlist.update({ username: user }, { $pull: { "group": group } }, { safe: true, upsert: true, new: true }, function(err, data) {
				if (err) throw err;
				console.log('delete group from friendlist', data)
				res.redirect('/fristpage');
			})
		}

	})

	/////////////////////////////////////////////////////////////////////////////////////////
	app.post('/show', function(req, res) {
		var fname = req.body.fname;
		console.log(fname)
	});
	app.get('/webinfor', function(req, res) {
		dbfaculty.find().distinct("faculty", function(err, docs) {
			if (err) {
				console.log(err)
			} else {
				// console.log(docs)
				// for (var i = 0; i < docs.length; i++) {
				// 	// dbfaculty.find({ "faculty": docs[i] }, function(err, data) {
				// 	// 	if (err) throw err;
				// 	// 	for (var j = 0; j < data.length; j++) {
				// 	// 		console.log(j, data[j])
				// 	// 	}
				// 	// })
				// 	dbfaculty.find({ "faculty": docs[i] }).distinct("department", function(err, department) {
				// 		if (err) throw err;
				// 		console.log(i, department)

				// 	})
				// }
				res.render('webinfor', {
					udata: req.session.user,
					data: docs
				});
			}
		})



	});

	app.post('/choosefaculty', function(req, res) {
		var faculty = req.body['faculty']
		console.log(faculty)
		dbfaculty.find({ "faculty": faculty }).distinct("department", function(err, department) {
			if (err) throw err;
			console.log(department)
			res.json(department);

		})


	})
	app.post('/choosedepartment', function(req, res) {
		var faculty = req.body['faculty']
		var department = req.body['department']
		dbfaculty.find({ "faculty": faculty, "department": department }, function(err, major) {
			if (err) throw err;
			console.log(major)
			res.json(major)
		})
	})

	app.get('/webchat', function(req, res) {
		res.render('chat');
	});

	//////////////////////////////////////////////////////////////////////////////////////////////////
	app.get('/profile', function(req, res) {
		if (req.session.user == null) {
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		} else {
			res.render('senddata', {
				title: 'Control Panel',
				countries: CT,
				udata: req.session.user
			});
		}
		//res.render('senddata');
		console.log(req.session.user)
	});


	//////////////////////////////////////////////////////////////////////////////////////////////
	app.get('/fristpage', function(req, res) {
			// get friendlist
			var nuser = req.session.user
			var history_msg = []
			var tt = friendlist.findOne({ 'username': nuser.user }, function(err, user) {
				//if (err) throw err;
				if (user == null) {
					var myfriend = new friendlist({ username: nuser.user, list: [{ fname: 'chatbot', room: 'chatbot' + nuser.user }] });
					myfriend.save(function(err) {
						// we've saved the myfriend into the db here
						if (err) throw err;
						console.log('save sucess')
						var addmsgbot = new messagechat({ room: 'chatbot' + nuser.user, message: { name: 'chatbot', msg: "start with bot" } })
						addmsgbot.save(function(err) {
							console.log('save frist message')
							var text = { room: 'chatbot' + nuser.user, friend: 'chatbot', my: nuser.user, msgdata: { name: 'chatbot', msg: 'start with bot' } }
							send_data(text)
						})
					});
				} else {
					console.log('have a user')

					var find_msg = messagechat.findOne({ 'room': 'chatbot' + nuser.user }, function(err, data) {
						// if (err) throw err;
						if (data == null) {
							console.log('data null')
							var addmsgbot = new messagechat({ room: 'chatbot' + nuser.user, message: { name: 'chatbot', msg: "start with bot" } })
							addmsgbot.save(function(err) {
								console.log('save frist message')
								var text = { room: 'chatbot' + nuser.user, friend: 'chatbot', my: nuser.user, msgdata: { name: 'chatbot', msg: 'start with bot' } }
								send_data(text)
							})
						} else {
							console.log('have data bot')
								// console.log(data.message)
							var text = { room: 'chatbot' + nuser.user, friend: 'chatbot', my: nuser.user, msgdata: data.message }
							send_data(text)
								// history_msg.push(text)
						}

					})
				}

			})

			function send_data(data) {
				var text = { msgdata: data.msgdata }
				var profile = { friend: data.friend, my: data.my, room: data.room }
				history_msg.push(text);
				find_list(profile.my, function(user) {
					console.log("user", user)
					var user_group = user.group
					console.log("user_group", user_group)
					res.render('fristpage', {
						udata: req.session.user,
						data: user.list,
						group: user_group,
						history: history_msg[0].msgdata,
						profile: profile
					})
				})

			}

			function find_list(myname, user_list) {
				var list = friendlist.findOne({ 'username': myname }, function(err, user) {
					if (err) throw err;

					user_list(user)



				})
			}

		})
		//------------------------------------------------------------------------------------------------
		// admin 
	app.get('/adminpage', function(req, res) {
		dbfaculty.find({}, function(err, docs) {
			// console.log("docs", docs)
			if (err) {
				console.log('err');
			} else {
				dbfaculty.find().distinct("faculty", function(err, list) {
					if (err) {
						console.log(err)
					} else {
						classschedule.find({}, function(err, name) {
							if (err) {
								console.log(err)
							} else {
								console.log("name", name)
								res.render('adminpage', {
									data: docs,
									list: list,
									name: name
								})
							}

						})



					}
				})

			}
		});

	})
	app.post('/adminadd', function(req, res) {

		var faculty = req.body.Faculty
		var department = req.body.Department
		var major = req.body.Major

		var addnew = new dbfaculty({
			faculty: faculty,
			department: department,
			major: major
		})

		addnew.save(function(err) {

			if (err) throw err;
			console.log("save complete")
			dbfaculty.find({}, function(err, docs) {
				if (err) {
					console.log('err');
				} else {
					res.redirect('/adminpage')

				}
			});

		})


	})

	app.post('/editfaculty', function(req, res) {
		var new_faculty = req.body.new_faculty
		var new_department = req.body.new_department
		var new_major = req.body.new_major
		var id = req.body.new_id


		// console.log(new_faculty)
		// console.log(new_department)
		// console.log(new_major)
		console.log("id", id)

		var edit_new = dbfaculty.findByIdAndUpdate(id, { $set: { "faculty": new_faculty, "department": new_department, "major": new_major } }, { safe: true, upsert: true, new: true }, function(err, docs) {
			if (err) throw err;
			console.log("save edit complete")
			dbfaculty.find({}, function(err, docs) {
				if (err) {
					console.log(err)
				} else {
					res.redirect('/adminpage')
				}
			})
		})


		// var edit_major = dbfaculty.findOneAndUpdate({ "_id": id }, { $set: { "faculty": faculty }, { "department": department }, { "major": major } }, { safe: true, upsert: true, new: true },
		// 	function(err, user) {
		// 		if (err) throw err;
		// 		console.log("save edit complete")
		// 		dbfaculty.find({}, function(err, docs) {
		// 			if (err) {
		// 				console.log('err');
		// 			} else {
		// 				res.redirect('/adminpage')

		// 			}
		// 		});




		// 	})




	})

	app.post('/delfaculty', function(req, res) {
		var id = req.body.del_id

		var del = dbfaculty.remove({ _id: id }, function(err, docs) {
			if (err) throw err;
			console.log("complete")
			dbfaculty.find({}, function(err, docs) {
				if (err) {
					console.log(err)
				} else {
					res.redirect('/adminpage')
				}
			})


		})


	})
	app.post('/createschedule', function(req, res) {

		var data_ma = req.body.major
		var year = req.body.year
		var faculty = req.body.faculty
		var data_de = req.body.department

		var department = data_de.split(",");
		var major = data_ma.split(",");


		var addnew = new classschedule({

			faculty: faculty,
			department: department[1],
			major: major[1],
			id_major: major[0],
			year: year,
		})

		addnew.save(function(err) {

			if (err) throw err;
			console.log("save complete")
			dbfaculty.find({}, function(err, docs) {
				if (err) {
					console.log('err');
				} else {
					res.redirect('/adminpage')

				}
			});

		})



	})

	app.get('/show/:faculty/:department/:major/:year', function(req, res) {
		var faculty = req.params.faculty
		var department = req.params.department
		var major = req.params.major
		var year = req.params.year
		console.log(faculty)
		console.log(department)
		console.log(major)

		console.log(year)

		classschedule.find({
			"faculty": faculty,
			"department": department,
			"major": major,
			"year": year
		}, function(err, name) {
			if (err) {
				console.log(err)
			} else {
				console.log("name11111", name)
				res.render('classschedule', {
					name: name
				})
			}
		})


	})
	app.post('/addclass', function(req, res) {
		var faculty = req.body.faculty
		var data_de = req.body.department
		var major = req.body.major
		var year = req.body.year
		var id_subject = req.body.id_subject
		var subject = req.body.subject
		var datetime = req.body.datetime
		var classroom = req.body.classroom
		var building = req.body.building
		var teacher = req.body.teacher
		var id = req.body.id

		console.log("id", id)

		var department = data_de.split(",");
		var edit_new = classschedule.findByIdAndUpdate(id, {
			$push: {
				"data": {
					id_subject: id_subject,
					subject: subject,
					datetime: datetime,
					classroom: classroom,
					building: building,
					teacher: teacher
				}
			}
		}, { safe: true, upsert: true, new: true }, function(err, docs) {
			if (err) throw err;
			console.log("save edit complete")
			console.log(docs)
			classschedule.find({
				"faculty": faculty,
				"department": department,
				"major": major,
				"year": year
			}, function(err, name) {
				if (err) {
					console.log(err)
				} else {
					console.log("name", name)
					res.render('classschedule', {
						name: name
					})
				}
			})
		})


	})

	app.post('/editclassschedule', function(req, res) {
		var id_subject = req.body.new_id_subject
		var subject = req.body.new_subject
		var datetime = req.body.new_datetime
		var classroom = req.body.new_classroom
		var building = req.body.new_building
		var teacher = req.body.new_teacher
		var id = req.body.new_id
		var faculty = req.body.faculty
		var department = req.body.department
		var major = req.body.major
		var year = req.body.year
		console.log("faculty", faculty)

		// var findid = classschedule.findById(id, function(err, result) {
		// 	if (err) {
		// 		console.log(err)
		// 	} else {
		// 		var newdata = result.data
		// 		for (var i = 0; i < newdata.length; i++) {
		// 			if (newdata[i].id_subject = id_subject) {
		// 				console.log(i, "found")


		// 				var finddata = classschedule.findOneAndUpdate({ "_id": id, "data.id_subject": id_subject }, {
		// 					$set: {

		// 						id_subject: id_subject,
		// 						subject: subject,
		// 						datetime: datetime,
		// 						classroom: classroom,
		// 						building: building,
		// 						teacher: teacher

		// 					}
		// 				}, function(err, all) {
		// 					if (err) {
		// 						console.log(err)
		// 					} else {
		// 						console.log("all", all)
		// 					}
		// 				})
		// 			} else {

		// 				console.log("not found")
		// 			}

		// 		}
		// 	}
		// })
		var finddata = classschedule.findOneAndUpdate({ "_id": id, "data.id_subject": id_subject }, {
			$set: {
				"data": {
					id_subject: id_subject,
					subject: subject,
					datetime: datetime,
					classroom: classroom,
					building: building,
					teacher: teacher
				}

			}
		}, function(err, all) {
			if (err) {
				console.log(err)
			} else {
				console.log("all", all)
				var show = 'show/' + faculty + '/' + department + '/' + major + '/' + year

				res.redirect('/' + show)
					// res.redirect('/adminpage')


			}
		})




	})
	app.post('/delclass', function(req, res) {

	})




	//////////////////////////////////////////////////////////////////////////////////////////////
	// logged-in user homepage //

	app.get('/home', function(req, res) {
		if (req.session.user == null) {
			// if user is not logged-in redirect back to login page //
			res.redirect('/');
		} else {
			res.render('home', {
				title: 'Control Panel',
				countries: CT,
				udata: req.session.user
			});
		}
	});

	app.post('/home', function(req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			AM.updateAccount({
				id: req.session.user._id,
				name: req.body['name'],
				email: req.body['email'],
				pass: req.body['pass'],
				country: req.body['country']
			}, function(e, o) {
				if (e) {
					res.status(400).send('error-updating-account');
				} else {
					req.session.user = o;
					// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined) {
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });
					}
					res.status(200).send('ok');
				}
			});
		}
	});

	app.post('/logout', function(req, res) {
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e) { res.status(200).send('ok'); });
	})

	// creating new accounts //


	app.get('/signup', function(req, res) {
		console.log(res);
		dbfaculty.find().distinct("faculty", function(err, docs) {
				if (err) {
					console.log(err)
				} else {

					res.render('Signup', {
						data: docs,
						title: 'Signup'
					});
				}
			})
			// res.render('signup', { title: 'Signup', countries: CT, faculty: FY });
	});

	app.post('/signup', function(req, res) {

		var data = { faculty: FY }
		var name = req.body['name']
		var email = req.body['email']
		var user = req.body['user']
		var pass = req.body['pass']
			// var faculty = req.body.faculty
		var id_faculty = req.body.major
			// var submajor = req.body.submajor
		var studenid = req.body['studentid']
		var phone = req.body['phone']

		// var new_faculty = data.faculty[faculty].faculty
		// var new_major = data.faculty[faculty].major[major].main

		AM.addNewAccount({
			name: name,
			email: email,
			user: user,
			pass: pass,
			// faculty: new_faculty,
			// major: new_major,
			// submajor: submajor,
			id_faculty: id_faculty,
			studenid: studenid,
			phone: phone
		}, function(e) {
			if (e) {
				res.status(400).send(e);
			} else {
				res.status(200).send('ok');
			}
		});

	});

	// password reset //

	app.post('/lost-password', function(req, res) {
		// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o) {
			if (o) {
				EM.dispatchResetPasswordLink(o, function(e, m) {
					// this callback takes a moment to return //
					// TODO add an ajax loader to give user feedback //
					if (!e) {
						res.status(200).send('ok');
					} else {
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			} else {
				res.status(400).send('email-not-found');
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e) {
			if (e != 'ok') {
				res.redirect('/');
			} else {
				// save the user's email in a session instead of sending to the client //
				req.session.reset = { email: email, passHash: passH };
				res.render('reset', { title: 'Reset Password' });
			}
		})
	});

	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
		// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
		// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o) {
			if (o) {
				res.status(200).send('ok');
			} else {
				res.status(400).send('unable to update password');
			}
		})
	});

	// view & delete accounts //

	app.get('/print', function(req, res) {
		AM.getAllRecords(function(e, accounts) {
			res.render('print', { title: 'Account List', accts: accounts });
		})
	});

	app.post('/delete', function(req, res) {
		AM.deleteAccount(req.body.id, function(e, obj) {
			if (!e) {
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e) { res.status(200).send('ok'); });
			} else {
				res.status(400).send('record not found');
			}
		});
	});

	app.get('/reset', function(req, res) {
		AM.delAllRecords(function() {
			res.redirect('/print');
		});
	});

	app.get('/long', function(req, res) {
		//console.log(res);
		res.render('long');
	});

	app.get('/chat', function(req, res) {
		res.render('index');
	});


	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found' }); });

	// 	app.get('/test', function(req, res, next) {
	//   //res.send('respond with a resource');
	//   var sql = "SELECT * FROM PRcontent";

	// console.log(sql)
	//  router.query(sql,function(record){
	//  	//console.log(data);
	//  	//res.send("OK")

	//  	var data={
	//  		customer: record

	//  	}
	//  	console.log(data)
	//  	res.render('/test',data);


	//  });

	// });




};
//module.exports = router;
// exports.senduser = function(user) {
// 	console.log(user)
// }
