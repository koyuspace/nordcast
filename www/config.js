var backend = "http://localhost:9000";
var debug = false;

function onDeviceReady() {
    screen.orientation.lock('portrait');
    StatusBar.backgroundColorByHexString("#fff");
}

document.addEventListener("deviceready", onDeviceReady, false);