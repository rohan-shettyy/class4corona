var express = require('express');
var app = express();
var httpApp = express();
var fs = require('fs');
var http = require('http')
var server = require('https').createServer({
    key: fs.readFileSync("private.key.pem"),
    cert: fs.readFileSync("domain.cert.pem")
}, app).listen(443);
var io = require('socket.io')(server);
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var profanity = require('profanity-censor');

var dictionary = ['fuck', 'shit', 'nigga', 'pussy', 'bitch', 'cunt', 'twat', 'nigger', 'slut', 'whore'];
profanity.use(dictionary);

var favicon = require('serve-favicon')

const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ classes: [], students: [], count: 0 }).write()

httpApp.set('port', 80);
httpApp.get("*", function(req, res, next) {
    res.redirect("https://" + req.headers.host);
});

app.use(cookieParser());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'))
app.use(favicon(path.join(__dirname + '/public/favicon/favicon.ico')))

app.get('/classlist', function(req, res) {
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

app.get('/pclass', function(req, res) {
    res.sendFile(__dirname + '/public/clientsetup.html');
});

app.get('/credits', function(req, res) {
    res.sendFile(__dirname + '/public/credits.html')
})

app.get('/createclass', function(req, res) {
    res.sendFile(__dirname + '/public/createClass.html');
});

app.post('/closeclass', function(req, res) {

    res.redirect(301, '/')
});

app.post('/createclass', function(req, res) {

    var user_name = profanity.filter(req.body.cname);
    var school = profanity.filter(req.body.school);
    var s_class = profanity.filter(req.body.s_class);
    var description = profanity.filter(req.body.description);
    var code = req.body.ccode

    console.log(user_name, school, s_class, description, code)

    db.get('classes').push({
        teacher: user_name,
        school: school,
        course: s_class,
        description: description,
        code: code
    }).write()

    res.redirect('/phost?session=' + code)
});

app.post('/joinclass', function(req, res) {

    var user_name = profanity.filter(req.body.jname)
    var code = profanity.filter(req.body.sclass)

    db.get('students').push({
        name: user_name,
        code: code
    }).write()

    console.log(user_name, code)

    res.redirect('/pclass?session=' + code + '&name=' + user_name)
});

app.get('/class', function(req, res) {
    res.sendFile(__dirname + '/public/session.html');
});

app.get('*', function(req, res) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});


io.on('connection', function(socket) {
    console.log('user connected');

    socket.on('create', function(room) {
        socket.join(room);
        console.log("Joined " + room)
    });

    socket.on('message', function(message) {
        try {
            data = JSON.parse(message)
            socket.broadcast.to(data.room).emit('message', message);
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('disconnect', function() {});

    socket.on('raise hand', function(data) {
        socket.broadcast.to(data.room).emit('raise hand', data)
    });

    socket.on('unmute', function(data) {
        socket.broadcast.to(data.room).emit('unmute', data)
    });

    socket.on('mute', function(data) {
        socket.broadcast.to(data.room).emit('mute', data)
    });
});

http.createServer(httpApp).listen(httpApp.get('port'), function() {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
});