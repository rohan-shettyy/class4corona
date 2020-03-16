var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var fs = require('fs');
var path = require('path');
var cors = require('cors');


app.use(cors());
app.use(express.urlencoded( {extended: true} ))
// Use correct file directory

app.use(express.static(__dirname + '/public'))
server.listen(3000, function() {
	console.log(`Listening`);
});

app.get('/video', function(req, res) {
	const path = 'assets/sample.mp4'
	const stat = fs.statSync(path)
	const fileSize = stat.size
	const range = req.headers.range
	if (range) {
	  const parts = range.replace(/bytes=/, "").split("-")
	  const start = parseInt(parts[0], 10)
	  const end = parts[1] 
		? parseInt(parts[1], 10)
		: fileSize-1
	  const chunksize = (end-start)+1
	  const file = fs.createReadStream(path, {start, end})
	  const head = {
		'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': chunksize,
		'Content-Type': 'video/mp4',
	  }
	  res.writeHead(206, head);
	  file.pipe(res);
	} else {
	  const head = {
		'Content-Length': fileSize,
		'Content-Type': 'video/mp4',
	  }
	  res.writeHead(200, head)
	  fs.createReadStream(path).pipe(res)
	}
  });

  app.get('/host', function(req, res) {
	  res.sendFile(__dirname + '/public/hosting.html');
  });

  app.get('/createclass', function(req, res) {
	res.sendFile(__dirname + '/public/createClass.html');
});

app.get('/joinclass', function(req, res) {
	res.sendFile(__dirname + '/public/joinClass.html');
});

app.get('/class', function(req, res) {
	res.sendFile(__dirname + '/public/session.html');
});
var users = [];
var rooms = [];
function generateRoomID() {
	var uid = ""
	for (let i=0; i < 6; i++) {
		uid = uid + Math.floor(Math.random() * 9).toString();
	}
	rooms.push(
		{
		id: uid,
		users: []
		}
	);
	return uid
}

  //Socket.io handlers
  io.on('connection', function(socket){
	  console.log('A user connected');
	  users.push(socket.id);
	socket.on("disconnect", function() {
		console.log("A user disconnected")
		users.splice(users.indexOf(socket.id), 1)
	});

	socket.on("createRoom", function() {
		socket.emit("roomID", generateRoomID());
	});

	socket.on("packet", function(packet) {
		socket.broadcast.emit("packet", packet);
	});
  });