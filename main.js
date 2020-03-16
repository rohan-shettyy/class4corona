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

app.use(cors());
app.use(express.urlencoded( {extended: true} ))
// Use correct file directory
app.use(express.static(__dirname + '/public')).listen(3000, function() {
	console.log(`Listening`);
});