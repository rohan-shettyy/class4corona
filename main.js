var express = require('express');
var app = express();
var fs = require('fs');
var server = require('https').createServer({
        key: fs.readFileSync("private.key.pem"),
        cert: fs.readFileSync("domain.cert.pem")
    },
    app).listen(443);
var io = require('socket.io')(server);
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');


app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

app.get('/host', function(req, res) {
    res.sendFile(__dirname + '/public/hosting.html');
});

class Class {
    constructor(teacherName, school, subject, description, reqcode) {
        this.teacherName = teacherName;
        this.school = school;
        this.subject = subject;
        this.description = description;
        this.reqcode = reqcode;
    }
}

classes = []

app.get('/createclass', function(req, res) {
    res.sendFile(__dirname + '/public/createClass.html');
});

app.post('/createclass', function(req, res) {

    var user_name = req.body.name;
    var school = req.body.school;
    var s_class = req.body.s_class;
    var description = req.body.description;
    var reqcode = req.body.reqcode

    console.log(user_name, school, s_class, description, reqcode)
    classes.push(new Class(user_name, school, s_class, description, reqcode))
    console.log(classes);
    res.end("End")
});

app.get('/joinclass', function(req, res) {
    res.cookie("class", classes)
    res.send(req.cookies)
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

rooms = []

io.on('connection', function(socket) {
    console.log('user connected');
    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });
});