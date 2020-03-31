const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('session');
var localStream;

$(document).ready(function() {
    var video = document.querySelector("#localVideo");

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                video.srcObject = stream;
            })
            .catch(function(err) {
                console.log("Something went wrong!");
            });
    }

});

function host() {
    window.location.replace('host?session=' + code);
}