navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let mediaRecorder;
let recordedChunks;

document.addEventListener("DOMContentLoaded", function(e) {

  let webcamButton = document.getElementById('camButton');
  webcamButton.addEventListener("click", function(e) {
    if (webcamButton.innerText == "Enable Webcam") {
      webcamButton.innerText = "Disable Webcam";
      document.getElementById("webcamPlayer").style.display = "block";
      navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => {
        document.getElementById("webcamPlayer").srcObject = stream;
        document.getElementById("webcamPlayer").play();
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        setInterval(function(){
          mediaRecorder.stop();
          mediaRecorder.start();
        }, 5000);
      }).catch((err) => {
        console.log('Failed to get local stream' ,err);
      });
    } else {
      webcamButton.innerText = "Enable Webcam";
      document.getElementById("webcamPlayer").srcObject.getTracks().forEach(track => {
        track.stop();
      });
    }
  });

  function handleDataAvailable() {
    console.log("data-available");
    if (event.data.size > 0) {
      recordedChunks = event.data;
      console.log(recordedChunks);
      download();
    }
  }

  function download() {
    var blob = new Blob([recordedChunks], {
      type: "video/webm"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
    
  }

  // Begin socket host connection
  var socket = io();
});