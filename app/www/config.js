var backend = "http://192.168.178.22:9000";
var debug = false;

function onDeviceReady() {
    screen.orientation.lock('portrait');
    StatusBar.styleLightContent();
    StatusBar.backgroundColorByHexString("#fff");
}