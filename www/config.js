var backend = "https://api.nordcast.app";
var debug = false;

function onDeviceReady() {
    screen.orientation.lock('portrait');
    StatusBar.backgroundColorByHexString("#fff");
}

document.addEventListener("deviceready", onDeviceReady, false);