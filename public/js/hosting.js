// Javascript
navigator.mediaDevices.getUserMedia({
    video: {
      width:     1280,
      height:    720,
      frameRate: 24
    }
  }
).then(function(stream) {
  let video = document.getElementById('webcamPlayer');
  video.srcObject = stream;
  video.onloadedmetadata = function(e) {
    let button = document.getElementById('playweb');
    button.onclick = function(e) {
        if (button.innerText == "Enable Webcam") {
            video.play();
            button.innerText = "Disable Webcam";
        } else {
            video.pause();
            button.innerText = "Enable Webcam";
        }
    }
    
  };
}).catch(function(err) {
  // deal with an error (such as no webcam)
});