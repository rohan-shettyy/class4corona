var arrayOfBlobs = [];
var socket = io();
socket.on("packet", function (packet) {
    arrayOfBlobs.append(packet);
    appendToSourceBuffer();
});


var mediaSource = new MediaSource();

// 2. Create an object URL from the `MediaSource`
var url = URL.createObjectURL(mediaSource);

// 3. Set the video's `src` to the object URL
var video = document.getElementById("stream");
video.src = url;

// 4. On the `sourceopen` event, create a `SourceBuffer`
var sourceBuffer = null;
mediaSource.addEventListener("sourceopen", function()
{
    // NOTE: Browsers are VERY picky about the codec being EXACTLY
    // right here. Make sure you know which codecs you're using!
    sourceBuffer = mediaSource.addSourceBuffer("video/webm; codecs=\"opus,vp8\"");

    // If we requested any video data prior to setting up the SourceBuffer,
    // we want to make sure we only append one blob at a time
    sourceBuffer.addEventListener("updateend", appendToSourceBuffer);
});

// 5. Use `SourceBuffer.appendBuffer()` to add all of your chunks to the video
function appendToSourceBuffer()
{
    if (
        mediaSource.readyState === "open" &&
        sourceBuffer &&
        sourceBuffer.updating === false
    )
    {
        sourceBuffer.appendBuffer(arrayOfBlobs.shift());
    }

    // Limit the total buffer size to 20 minutes
    // This way we don't run out of RAM
    if (
        video.buffered.length &&
        video.buffered.end(0) - video.buffered.start(0) > 1200
    )
    {
        sourceBuffer.remove(0, video.buffered.end(0) - 1200)
    }
}