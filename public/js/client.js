var localVideo;
var localStream;
var remoteStream = new MediaStream();
var displayStream = new MediaStream();
var remoteVideo;
var remoteDisplay;
var camTransceiver, screenTransceiver;
var peerConnection;
var uuid;
var serverConnection;
var potentialCandidates = [];
let inboundStream = null;
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('session');
const name = urlParams.get('name');


var peerConnectionConfig = {
    'iceServers': [{
            'urls': 'stun:stun.stunprotocol.org:3478'
        },
        {
            'urls': 'stun:stun.l.google.com:19302'
        },
    ],
    sdpSemantics: 'unified-plan'
};

$(document).ready(function() {
    uuid = createUUID();

    remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    remoteDisplay = document.getElementById('remoteDisplay');
    remoteDisplay.srcObject = displayStream;
    remoteDisplay.play();

    serverConnection = io().connect();
    serverConnection.emit('create', code)

    serverConnection.emit('isclient', name)

    serverConnection.on('message', gotMessageFromServer);

    serverConnection.on('unmute', function(data) {
        if (data.uuid == uuid) {
            document.getElementById('mutedDiv').style.display = 'none';
            document.getElementById('unmutedDiv').style.display = 'block';
        }
    });
    serverConnection.on('mute', function(data) {
        if (data.uuid == uuid) {
            document.getElementById('mutedDiv').style.display = 'block';
            document.getElementById('unmutedDiv').style.display = 'none';
        }
    });

    navigator.mediaDevices.getUserMedia({
        audio: true
    }).then(function(stream) {
        localStream = stream
    }).catch(function(err) {
        alert("Microphone Permissions are needed")
    });
});

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.ontrack = gotRemoteStream;
    peerConnection.addTrack(localStream.getTracks()[0]);
    camTransceiver = peerConnection.addTransceiver("video");
    screenTransceiver = peerConnection.addTransceiver("video");
    peerConnection.createOffer().then((desc) => {
        createdDescription(desc);
    }).catch(errorHandler);
}

function gotMessageFromServer(message) {
    if (!peerConnection) start(false);

    var signal = JSON.parse(message);

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
        serverConnection.emit('message', JSON.stringify({
            'room': code,
            'ice': event.candidate,
            'uuid': uuid,
            'sender': 'client'
        }));
    }
}

function createdDescription(description) {

    peerConnection.setLocalDescription(description).then(function() {
        serverConnection.emit('message', JSON.stringify({
            'room': code,
            'sdp': peerConnection.localDescription,
            'uuid': uuid,
            'sender': 'client'
        }));
    }).catch(errorHandler);
}

function gotRemoteStream(e) {
    if (e.streams[0].getVideoTracks().length > 0) {

        if (e.streams && e.streams[0]) {
            if (e.transceiver.mid == screenTransceiver.mid) {
                displayStream.addTrack(e.track);
            } else if (e.transceiver.mid == camTransceiver.mid) {
                remoteVideo.srcObject = e.streams[0];
            }
        } else {
            if (!inboundStream) {
                inboundStream = new MediaStream();
                remoteVideo.srcObject = inboundStream;
            }
            inboundStream.addTrack(e.track);
        }
    } else {
        console.log(e)
        document.getElementById('audioOnly').srcObject = e.streams[0];
        document.getElementById('audioOnly').play();
    }
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

function raiseHand() {
    serverConnection.emit("raise hand", {
        "room": code,
        "uuid": uuid,
        'name': name
    });
}