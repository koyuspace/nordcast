var backend = "https://api.nordcast.app";
var debug = false;

function onDeviceReady() {
    if (device.platform === "Android" || device.platform === "iOS") {
        screen.orientation.lock('portrait');
        StatusBar.backgroundColorByHexString("#fff");
    }
    document.addEventListener("backbutton", function (e) {
        e.preventDefault();
        if (!loading) {
            $("#view__cast").hide();
            $("#view__search").hide();
            $("#view_settings").hide();
            $("#view__main").hide();
            $(".fa__nav").show();
            $(".fa__nav2").show();
            location.href = "app.html#view=main";
            loadview();
        }
    });
}

document.addEventListener("deviceready", onDeviceReady, false);