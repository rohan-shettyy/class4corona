document.addEventListener('DOMContentLoaded', function() {
var arrayOfBlobs = [];
var socket = io();
socket.on("packet", function (packet) {
    
    arrayOfBlobs.push(packet);
    document.getElementById('stream').src = packet

});
});