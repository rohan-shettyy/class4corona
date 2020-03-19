var express = require('express');
var app = express();
var fs = require('fs');
var server = require('https').createServer({
        key: fs.readFileSync("private.key.pem"),
        cert: fs.readFileSync("domain.cert.pem")
    },
    app).listen(443);
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
var path = require('path');
var cors = require('cors');
// var http = require('http');

// http.createServer(function(req, res) {
//     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//     res.end();
// }).listen(80);

app.get('/insecure', function(req, res) {
    res.send('Dangerous!');
});

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