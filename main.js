var express = require('express');
var SocketIO = require("socket.io")
var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var io = SocketIO(server)


var users = {};
var name = '';

app.get('/:name', function(req,res){
	name = req.param.name;
	res.sendFile(path.join(__dirname, "/public/classStudent.html"))
});

io.sockets.on("connection", function(socket){
	users[socket.id] = name;

		socket.on("nRoom", function(room){
			socket.join(room);
			socket.broadcast.in(room).emit("node new user", users[socket.id] + " new user has joined");
		});

		socket.on("node new message", function(data){
			io.sockets.in("nRoom").emit('node news', users[socket.id] + ": "+ data);
		});
})

app.use(cors());
app.use(express.urlencoded( {extended: true} ))
// Use correct file directory
app.use(express.static(__dirname + '/public')).listen(3000, function() {
	console.log(`Listening`);
});