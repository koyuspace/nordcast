document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function() {
    $("#welcome__error").hide();
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
        $("#welcome__error").hide();
        $("#kslogin").attr("disabled", "");
        var oldHTML = $("#kslogin").html();
        $("#kslogin").html("<img src=\"loading.svg\" height=\"16\" style=\"vertical-align:middle;margin-top:-3px;\" /> "+$("#kslogin").html());
        window.setTimeout(function() {
            $.post(backend+"/api/v1/login", {username: $("#username").val(), password: $("#password").val()}, function(data) {
                if (data["login"] === "ok") {
                    localStorage.setItem("uuid", data["uuid"]);
                    localStorage.setItem("username", $("#username").val());
                    window.setTimeout(function() {
                        location.href = "app.html?nosplash=ok";
                    }, 200)
                } else {
                    $("#kslogin").removeAttr("disabled");
                    $("#kslogin").html(oldHTML);
                    $("#welcome__error").show();
                }
            }).error(function() {
                $("#kslogin").removeAttr("disabled");
                $("#kslogin").html(oldHTML);
                $("#welcome__error").show();
            });
        }, 1000)
    });
    $("#username").keypress(function (e) {
        if (e.which === 13) {
          $("#kslogin").click();
          return false;
        }
    });
    $("#password").keypress(function (e) {
        if (e.which === 13) {
          $("#kslogin").click();
          return false;
        }
    });
});

//Cordova-specific code
function onDeviceReady() {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#fff");
    }
    navigator.globalization.getPreferredLanguage(function (language) {
        //German
        if (language.value.includes("de")) {
            $("#welcome__error").html("<p><b style=\"color:red;\">Der Benutzername und/oder das Passwort ist falsch.</b></p>");
            $("#text__safe").html("Deine Daten sind sicher.");
            $("h1").html("Willkommen bei Nordcast");
            $("#text__welcome").html("Bitte melde dich mit deinem koyu.space-Account an. Solltest du noch keinen Account haben, kannst du dir <a href=\"#\" onclick=\"window.open('https://koyu.space/auth/sign_up', '_system'); return false;\">hier</a> einen machen.");
            $("#username").attr("placeholder", "E-Mailadresse");
            $("#password").attr("placeholder", "Passwort");
            $("#kslogin").html("Anmelden");
        }
    });
}