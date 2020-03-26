$(document).ready(function() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || null;

    //we need to pass the stream properties to the getUserMedia function.
    var video_audio_properties = { video: true, audio: true };

    if (navigator.getUserMedia != null) {
        navigator.getUserMedia(video_audio_properties, onSuccess, onError);
        console.log('Success')
    } else {
        alert("microphone and webcam API not supported");
    }
});