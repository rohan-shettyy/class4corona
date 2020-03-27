var localVideo;
var localStream;
var localDisplay;
var screenCaptureOn = false;
var displayStream;
var remoteVideo;
var screenToggle;
var peerConnections = {};
var uuid;
var audioStream = new MediaStream();
var audioTag;
var micRequest, activeMic;
var webcam;
var serverConnection;
var potentialCandidates = [];
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('session');
var handsRaised = [];

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

    localVideo = document.getElementById('localVideo');
    localVideo.style.display = 'none';
    localDisplay = document.getElementById('screenCapture');
    audioTag = document.getElementById('studentAudio');
    audioTag.srcObject = audioStream;

    Notification.requestPermission();

    micRequest = document.getElementById('micRequest');
    activeMic = document.getElementById('activeMic');

    screenToggle = document.getElementById('screenshareToggle');
    screenToggle.addEventListener('change', screencapToggled);

    serverConnection = io();
    serverConnection.connect();
    serverConnection.emit('create', code)

    console.log('Opened socket.io connection')

    serverConnection.on('message', gotMessageFromServer);
    serverConnection.on('raise hand', handRaised)

    var webcamConstraints = {
        video: true,
        audio: true,
    };

    function detectWebcam(callback) {
        let md = navigator.mediaDevices;
        if (!md || !md.enumerateDevices) return callback(false);
        md.enumerateDevices().then(devices => {
            callback(devices.some(device => 'videoinput' === device.kind));
        })
    }

    detectWebcam(function(hasWebcam) {
        if (!hasWebcam) {
            webcam = false;
            webcamConstraints.video = false;
        } else {
            webcam = true;
        }
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(webcamConstraints).then(getUserMediaSuccess).catch(errorHandler);
        } else {
            alert('Your browser does not support getUserMedia API');
        }
    });
});

function getDisplayMediaSuccess(screen) {
    screenCaptureOn = true;
    displayStream = screen;
    localDisplay.srcObject = displayStream;
    localDisplay.play();
    localDisplay.style.display = "block";
}

function getUserMediaSuccess(stream) {
    console.log(stream.getTracks())
    localStream = stream;
    localVideo.srcObject = stream;
    var promise = localVideo.play();
    if (promise !== undefined) {
        promise.then(_ => {
            // Autoplay started!
        }).catch(error => {
            // Show something in the UI that the video is muted
            localVideo.muted = true;
            localVideo.play();
            localVideo.muted = false;
        });
    }
    localVideo.style.display = "block";
}

function start(uid) {
    peerConnections[uid] = new RTCPeerConnection(peerConnectionConfig);
    peerConnections[uid].onicecandidate = gotIceCandidate;

    for (const track of localStream.getTracks()) {
        peerConnections[uid].addTrack(track, localStream);

    }
    if (displayStream) {
        for (const track of displayStream.getTracks()) {
            peerConnections[uid].addTrack(track, displayStream);
        }
    }

    peerConnections[uid].ontrack = function(track) {
        gotRemoteStream(track, uid)
    };
}

function gotMessageFromServer(message) {
    var signal = JSON.parse(message);

    if (!peerConnections[signal.uuid]) start(signal.uuid);

    // Ignore messages from ourself
    if (signal.uuid == uuid) return;
    if (signal.sender == 'host') return;
    if (signal.sdp) {

        peerConnections[signal.uuid].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
            if (signal.sdp.type == 'offer') {

                peerConnections[signal.uuid].createAnswer().then((desc) => {
                    createdDescription(desc, signal.uuid)
                }).catch(errorHandler);
            }
        }).catch(errorHandler);
    } else if (signal.ice) {
        peerConnections[signal.uuid].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        serverConnection.emit('message', JSON.stringify({
            'room': code,
            'ice': event.candidate,
            'uuid': uuid,
            'sender': 'host'
        }));
    }
}

function createdDescription(description, uid) {

    peerConnections[uid].setLocalDescription(description).then(function() {
        serverConnection.emit('message', JSON.stringify({
            'room': code,
            'sdp': peerConnections[uid].localDescription,
            'uuid': uuid,
            sender: 'host'
        }));
    }).catch(errorHandler);
}

function errorHandler(error) {
    console.log(error);
}

function screencapToggled() {
    if (this.checked) {
        var screenConstraints = {
            video: true,
            audio: true
        }
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(screenConstraints).then(getDisplayMediaSuccess).catch(errorHandler);
        } else {
            alert('Your browser does not support getDisplayMedia API');
        }
    } else {
        displayStream.getTracks().forEach((track) => {
            track.stop()
        });
        localDisplay.pause();
        localDisplay.removeAttribute('srcObject'); // empty source
        localDisplay.load();
        localDisplay.style.display = 'none';
    }
}

function createUUID() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function stopstream() {
    window.location.replace('phost?session=' + code);
}

function gotRemoteStream(e, uid) {

    if (e.track && e.track.kind == 'audio') {
        peerConnections[uid].audioSrc = e.track;
    }
}

var notifContainers = []
var notifTexts = []
var notifBtns = [];

function handRaised(data) {
    var clientRoom = data.room;
    var clientUUID = data.uuid;
    var clientName = data.name;
    if (!handsRaised.includes(clientUUID)) {
        handsRaised.push(clientUUID);
        notifContainers.push(document.createElement('div'));
        notifContainers[notifContainers.length - 1].classList.add('handRaise');
        notifTexts.push(document.createElement('p'));
        notifTexts[notifTexts.length - 1].appendChild(document.createTextNode(clientName + ' is raising their hand.'));
        notifTexts[notifTexts.length - 1].style.fontFamily = 'Sen !important';
        notifTexts[notifTexts.length - 1].classList.add('text-dark')
        notifBtns.push(document.createElement('button'));
        notifBtns[notifBtns.length - 1].innerText = 'Grant microphone access to ' + clientName;
        notifBtns[notifBtns.length - 1].classList.add('btn', 'btn-outline-primary', 'btn-lg', 'btn-block', 'w-auto');

        var notif = new Notification(clientName + ' is raising their hand.');

        notifBtns[notifBtns.length - 1].addEventListener('click', function(e) {
            audioStream.getTracks().forEach((track) => {
                track.enabled = false;
                audioStream.removeTrack(track)
            });
            addToActive(clientUUID, clientName);
            audioStream.addTrack(peerConnections[clientUUID].audioSrc);
            console.log(audioStream.getAudioTracks());
            audioTag.muted = false;
            audioTag.load();
            audioTag.play();
            micRequest.innerHTML = "";
            serverConnection.emit('unmute', {
                'uuid': clientUUID,
                'room': code
            })
        });

        notifContainers[notifContainers.length - 1].appendChild(notifTexts[notifTexts.length - 1]);
        notifContainers[notifContainers.length - 1].appendChild(notifBtns[notifBtns.length - 1]);
        micRequest.appendChild(notifContainers[notifContainers.length - 1]);
    }
}

function addToActive(clientUUID, clientName) {
    activeMic.innerHTML = '';
    var activeDiv = document.createElement('div');
    activeDiv.classList.add('currentlyActive');
    var activeText = document.createElement('p');
    activeText.appendChild(document.createTextNode(clientName + "'s microphone is currently active."));
    activeText.style.fontFamily = 'Sen !important';
    activeText.classList.add('text-dark')
    var activeBtn = document.createElement('button');
    activeBtn.innerText = 'Revoke microphone access from ' + clientName;
    activeBtn.classList.add('btn', 'btn-outline-primary', 'btn-lg', 'btn-block', 'w-auto');

    activeBtn.onclick = function() {
        endConnection();
        handsRaised.splice(handsRaised.indexOf(clientUUID), 1)
        serverConnection.emit('mute', {
            'uuid': clientUUID,
            'room': code
        })
    }
    activeDiv.appendChild(activeText);
    activeDiv.appendChild(activeBtn);
    activeMic.appendChild(activeDiv);
}

function endConnection() {
    audioStream.getTracks().forEach((track) => {
        track.enabled = false;
        audioStream.removeTrack(track)
    })
    activeMic.innerHTML = '';
}