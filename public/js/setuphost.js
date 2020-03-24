const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('session');

function host() {
    window.location.replace('host?session=' + code);
}