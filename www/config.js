var debug = true;
var donator = true;
var language = "en";

var backend = "https://api.nordcast.app";

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    window.location.href
        .split("#")[1]
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    } else {
/*         window.setInterval(function() {
            $(".dlbutton").hide();
            $(".share").hide();
        }); */
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

function handleOpenURL(url) {
    window.setTimeout(function() {
        location.href = "app.html#view=cast&cast="+url.replaceAll("nordcast://cast/", "");
    }, 0);
}