var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app).listen(80);
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
var path = require('path');
var cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

app.get('/host', function(req, res) {
    res.sendFile(__dirname + '/public/hosting.html');
});

app.get('/createclass', function(req, res) {
    res.sendFile(__dirname + '/public/createClass.html');
});

app.post('/createclass', function(req, res) {
    var user_name = req.body.name;
    var school = req.body.school;
    var s_class = req.body.s_clas;
    var description = req.body.desc;
    var reqcode = req.body.reqcode

    console.log("User name = " + user_name + ", school is " + school);
    res.end("yes");
});

app.get('/joinclass', function(req, res) {
    res.sendFile(__dirname + '/public/joinClass.html');
});

app.post('/joinclass', function(req, res) {
    var user_name = req.body.name;
    var school = req.body.school;
    var s_class = req.body.s_clas;
    var code = req.body.code;

    console.log("User name = " + user_name + ", school is " + school);
    res.end("yes");
});

app.get('/class', function(req, res) {
    res.sendFile(__dirname + '/public/session.html');
});

// Create a server for handling websocket calls
const wss = new WebSocketServer({ server: server });

console.log("Started Websocket Server")

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        // Broadcast any received message to all clients
        console.log('received: %s', message);
        wss.broadcast(message);
    });
});

wss.broadcast = function(data) {
    this.clients.forEach(function(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};