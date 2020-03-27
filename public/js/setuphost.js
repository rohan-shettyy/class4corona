const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('session');

navigator.mediaDevices.getUserMedia({
    audio: true
}).then(function(stream) {
    localStream = stream
}).catch(function(err) {
    alert("Microphone Permissions are needed")
});

function host() {
    window.location.replace('host?session=' + code);
}