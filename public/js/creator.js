var socket = io();

document.addEventListener('DOMContentLoaded', () => {
    let button = document.getElementById("roomCreate");
    button.addEventListener('click', (e) => {
        socket.emit("createRoom");
    });
});