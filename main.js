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
var low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ classes: [], students: [], count: 0 }).write()


app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))

app.use('/', function(req, res) {
    var a_schools = db.get('classes').map('school').value();
    var a_courses = db.get('classes').map('course').value();
    var a_codes = db.get('classes').map('code').value();

    console.log(a_schools.join(), a_schools.join());

    res.cookie("schools", a_schools.join());
    res.cookie("courses", a_courses.join());
    res.cookie("codes", a_codes.join());

    res.sendFile(__dirname + '/public/index.html');
});

app.get('/host', function(req, res) {
    res.sendFile(__dirname + '/public/hosting.html');
});

app.get('/phost', function(req, res) {
    res.sendFile(__dirname + '/public/hostsetup.html');
});


app.get('/createclass', function(req, res) {
    res.sendFile(__dirname + '/public/createClass.html');
});

app.post('/createclass', function(req, res) {

    var user_name = req.body.name;
    var school = req.body.school;
    var s_class = req.body.s_class;
    var description = req.body.description;
    var code = req.body.code

    console.log(user_name, school, s_class, description, code)

    db.get('classes').push({
        teacher: user_name,
        school: school,
        course: s_class,
        description: description,
        code: code
    }).write()

    res.end("End")
});

app.get('/joinclass', function(req, res) {
    res.sendFile(__dirname + '/public/joinClass.html');
});

app.post('/joinclass', function(req, res) {

    var user_name = req.body.name;
    var code = req.body.code;

    db.get('students').push({
        name: user_name,
        code: code
    }).write()

    res.end("yes");
});

app.get('/class', function(req, res) {
    res.sendFile(__dirname + '/public/session.html');
});

io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('create', function(room) {
        socket.join(room);
        console.log("Joined " + room)
    });
    socket.on('message', function(message) {
        data = JSON.parse(message)
        socket.broadcast.to(data.room).emit('message', message);
    });

    socket.on('disconect', function(name) {

        db.get('students').remove({ name: name }).write()
    });

    socket.on('raise hand', function(data) {
        socket.broadcast.to(data.room).emit('raise hand', data)
    });
});