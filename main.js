var express = require('express');
var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var path = require('path');
var cors = require('cors');


app.use(cors());
app.use(express.urlencoded( {extended: true} ))
// Use correct file directory

app.use(express.static(__dirname + '/public')).listen(3000, function() {
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
  })