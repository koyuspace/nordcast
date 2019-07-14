var backend = "https://api.nordcast.app";
var debug = false;

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    }
}

document.addEventListener("deviceready", onDeviceReady, false);
