var debug = false;
var donator = true;
var language = "en";

if (!debug) {
    var backend = "https://api.nordcast.app";
} else {
    var backend = "http://localhost:9000";
}

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    }
    if (device.platform === "Android") {
        darkmode.isDarkModeEnabled(
        function(res){
            if (debug) {
                console.log("Dark Mode: "+res);
            }
            if (localStorage.getItem("darkmode") === null) {
                localStorage.setItem("darkmode", String(res));
            }
        }, function(err){
            if (debug) {
                console.err(err);
            }
        });
    }
}

document.addEventListener("deviceready", onDeviceReady, false);
