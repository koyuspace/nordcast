var backend = "http://localhost:9000";
var debug = true;

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    }
}

document.addEventListener("deviceready", onDeviceReady, false);