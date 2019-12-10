document.addEventListener("deviceready", onDeviceReady, false);
var warning_nologin = "Warning: If you don't login you'll be only able to listen to podcasts. This might be suitable for you, but you won't be able to follow podcasts or save your current listening position. Are you sure you want to continue?";
var es = false;
var error = false;

$(document).ready(function() {
    if (localStorage.getItem("darkmode") === "true") {
        $("head").append("<link rel=\"stylesheet\" href=\"dark.css\">");
        $("#logo__intro").attr("src", "logo_dark.png");
    }
    $("#text__offline").hide();
    $("#welcome__error").hide();
    $("#view__welcome").hide();
    $("#nav").hide();
    $("#logo__intro").attr("style", "top: 50%;");
    window.setTimeout(function() {
        $("#logo__intro").hide();
        $("#view__welcome").show();
        $("#nav").show();
        try {
            if (!error) {
                $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                    if (data["login"] === "ok" && data["uuid"] === localStorage.getItem("uuid")) {
                        location.href = "app.html#view=main";
                    }
                }).fail(function() {
                    if (localStorage.getItem("uuid")) {
                        location.href = "app.html#view=main";
                    }
                });
                if (localStorage.getItem("uuid") === "dummy") {
                    location.href = "app.html#view=main";
                }
            }
        } catch (e) {}
    }, 200);
    $("#kslogin").click(function() {
        //Blocking gab, don't judge me
        if ($("#instance").val().toLowerCase().includes("gab.com") || $("#instance").val().toLowerCase().includes("gab.ai")) {
            $("#kslogin").removeAttr("disabled");
            $("#kslogin").html(oldHTML);
            window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_system');
            return false;
        } else {
            $("#welcome__error").hide();
            $("#kslogin").attr("disabled", "");
            var oldHTML = $("#kslogin").html();
            $("#kslogin").html("<img src=\"loading.svg\" height=\"16\" style=\"vertical-align:middle;margin-top:-3px;\" /> "+$("#kslogin").html());
            window.setTimeout(function() {
                $.post(backend+"/api/v1/login", {username: $("#username").val(), password: $("#password").val(), instance: $("#instance").val()}, function(data) {
                    if (data["login"] === "ok") {
                        localStorage.setItem("uuid", data["uuid"]);
                        localStorage.setItem("username", $("#username").val());
                        localStorage.setItem("instance", $("#instance").val());
                        window.setTimeout(function() {
                            location.href = "app.html#view=main";
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
        }
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
    $("#instance").keypress(function (e) {
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
                location.href = "app.html#view=main";
            }, 50);
        }
        e.preventDefault();
    });
});

//Cordova-specific code
function onDeviceReady() {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#fff");
        StatusBar.styleDefault();
        if (localStorage.getItem("darkmode") === "true") {
            StatusBar.backgroundColorByHexString("#191919");
            StatusBar.styleLightContent();
        }
    }
    navigator.globalization.getPreferredLanguage(function (language) {
        //German
        if (language.value.includes("de")) {
            $("#welcome__error").html("<p><b style=\"color:red;\">Der Benutzername und/oder das Passwort ist falsch.</b></p>");
            $("#text__safe").html("Deine Daten sind sicher.");
            $("#header__welcome").html("Willkommen bei Nordcast");
            $("#text__welcome").html("Bitte melde dich mit deinem koyu.space-Account an. Solltest du noch keinen Account haben, kannst du dir <a href=\"#\" onclick=\"window.open('https://koyu.space/auth/sign_up', '_system'); return false;\">hier</a> einen machen.");
            $("#username").attr("placeholder", "E-Mailadresse");
            $("#password").attr("placeholder", "Passwort");
            $("#instance").attr("placeholder", "Instanz");
            $("#kslogin").html("Anmelden");
            $("#nologin").html("Weiter ohne Account");
            warning_nologin = "Warnung: Ohne einen Account wirst du nur in der Lage sein Podcasts zu hören. Das mag zwar passend für dich sein, aber du kannst dann weder Podcasts folgen noch dort weiterhören, wo du aufgehört hast. Möchtest du wirklich fortfahren?";
        }
    });
}