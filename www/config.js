var backend = "https://api.nordcast.app";
var debug = true;

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    }
	if (debug) {
		function handleOpenURL(url) {
			setTimeout(function() {
				alert("received url: " + url);
			}, 0);
		}
	}
}

document.addEventListener("deviceready", onDeviceReady, false);