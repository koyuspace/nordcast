document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function() {
    $("#view__welcome").hide();
    $("#nav").hide();
    window.setTimeout(function() {
        $("#logo__intro").hide();
        $("#view__welcome").show();
        $("#nav").show();
    }, 2000);
    if (localStorage.getItem("uuid") !== null) {
        location.href = "app.html";
    }
    $("#kslogin").click(function() {
        $("#kslogin").attr("disabled", "");
        var oldHTML = $("#kslogin").html();
        $("#kslogin").html("<i class=\"fas fa-sync-alt fa-spin\"></i> "+$("#kslogin").html());
        window.setTimeout(function() {
            $.post(backend+"/api/v1/login", {username: $("#username").val(), password: $("#password").val()}, function(data) {
                if (data["login"] === "ok") {
                    localStorage.setItem("uuid", data["uuid"]);
                    window.setTimeout(function() {
                        location.href = "app.html";
                    }, 200)
                } else {
                    $("#kslogin").removeAttr("disabled");
                    $("#kslogin").html(oldHTML);
                    $("#welcome__error").html("<p><b style=\"color:red;\">Der Benutzername und/oder das Passwort ist falsch.</b></p>");
                }
            }).error(function() {
                $("#kslogin").removeAttr("disabled");
                $("#kslogin").html(oldHTML);
                $("#welcome__error").html("<p><b style=\"color:red;\">Der Benutzername und/oder das Passwort ist falsch.</b></p>");
            });
        }, 1000)
    });
});

//Cordova-specific code
function onDeviceReady() {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#fff");
    }
}