document.addEventListener("deviceready", onDeviceReady, false);
var warning_nologin = "Warning: If you don't login you'll be only able to listen to a select number of podcasts only since special APIs require authentication. Are you sure you want to continue?";
$(document).ready(function() {
    $("#welcome__error").hide();
    $("#view__welcome").hide();
    $("#nav").hide();
    window.setTimeout(function() {
        $("#logo__intro").hide();
        $("#view__welcome").show();
        $("#nav").show();
    }, 2000);
    $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
        if (data["login"] === "ok" && data["uuid"] === localStorage.getItem("uuid")) {
            location.href = "app.html";
        }
    });
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
    $("#nologin").click(function (e) {
        if (window.confirm(warning_nologin)) {
            localStorage.setItem("uuid", "dummy");
            localStorage.setItem("username", "dummy");
            window.setTimeout(function() {
                location.href = "app.html#nosplash=ok";
            }, 50);
        }
        e.preventDefault();
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
            $("#nologin").html("Weiter ohne Account");
            warning_nologin = "Warnung: Ohne einen Account wirst du nur in der Lage sein eine handvoll an Podcasts zu hören, da bestimmte Schnittstellen einen Account benötigen. Möchtest du wirklich fortfahren?";
        }
    });
}