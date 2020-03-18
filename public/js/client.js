var localVideo;
var localStream;
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

    serverConnection = new WebSocket('wss://' + window.location.hostname + ':443');
    serverConnection.onmessage = gotMessageFromServer;
}

function start(isCaller) {
    console.log("pressed Start")
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    console.log("new RTCconnection")
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
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
    console.log(signal.sdp.type)
    if (signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            // Only create answers in response to offers
            if (signal.sdp.type == 'offer') {
                peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
                potentialCandidates.forEach((candidate) => {
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate.ice)).catch(errorHandler);
                });
            }
        }).catch(errorHandler);
    } else if (signal.ice) {
        if (!peerConnection || !peerConnection.remoteDescription) {
            potentialCandidates.push({ 'ice': signal.ice, 'uuid': signal.uuid });
        } else if (peerConnection.remoteDescription) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
        }
    }
}

function gotIceCandidate(event) {
    console.log(event.candidate)
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
    remoteVideo.srcObject = event.streams[0];
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