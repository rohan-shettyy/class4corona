var localVideo;
var localStream;
var remoteStream = new MediaStream();
var remoteVideo;
var peerConnection;
var uuid;
var serverConnection;
var potentialCandidates = [];

var peerConnectionConfig = {
    'iceServers': [
        { 'urls': 'stun:stun.stunprotocol.org:3478' },
        { 'urls': 'stun:stun.l.google.com:19302' },
    ]
};

function pageReady() {
    uuid = createUUID();

    remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    serverConnection = new WebSocket('wss://' + window.location.hostname + ':443');
    serverConnection.onmessage = gotMessageFromServer;

    var constraints = {
        video: false,
        audio: true,
    };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }

}

function getUserMediaSuccess(stream) {
    localStream = stream;
    // localVideo.srcObject = stream;
}

function start(isCaller) {
    console.log("pressed Start")
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    console.log("new RTCconnection")
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
    for (const track of localStream.getTracks()) {
        peerConnection.addTrack(track, localStream);
      }
    peerConnection.createOffer().then((desc) => {
        createdDescription(desc);
    }).catch(errorHandler);
}

function gotMessageFromServer(message) {
    if (!peerConnection) start(false);

    var signal = JSON.parse(message.data);

    // Ignore messages from ourself
    if (signal.uuid == uuid) return;
    if (signal.sender == 'client') return;
    if (signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            // Only create answers in response to offers
            if (signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if (signal.ice) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        serverConnection.send(JSON.stringify({ 'ice': event.candidate, 'uuid': uuid, 'sender': 'client' }));
    }
}

function createdDescription(description) {
    console.log('got description');

    peerConnection.setLocalDescription(description).then(function() {
        serverConnection.send(JSON.stringify({ 'sdp': peerConnection.localDescription, 'uuid': uuid, 'sender': 'client' }));
    }).catch(errorHandler);
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    console.log(event)
    remoteStream.addTrack(event.track, remoteStream);
    remoteVideo.play();
}

function errorHandler(error) {
    console.log(error);
}

function createUUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}