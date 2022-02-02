var es = false;
var error = false;

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

$(document).ready(function() {
    window.setInterval(function() {
        $.get(backend+"/getstatus?"+Date.now(), function(data) {
            if (localStorage.getItem("uuid") === "dummy") {
                location.href = "app.html#view=main";
            } else {
                if (localStorage.getItem("offline") === "true") {
                    location.href = "app.html#view=main";
                }
            }
        }).fail(function() {
            if (localStorage.getItem("uuid") === "dummy") {
                location.href = "index.html#mode=offline";
            }
        })
    }, 1500);
    if (localStorage.getItem("darkmode") === "true") {
        $("head").append("<link rel=\"stylesheet\" href=\"dark.css\">");
        $("#logo__intro").attr("src", "logo_dark.png");
    }
    $("#text__offline").hide();
    $("#welcome__error").hide();
    $("#view__welcome").hide();
    $("#logo__intro").attr("style", "top: 50%;");
    window.setTimeout(function() {
        try {
            if (!error) {
                $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                    if (data["login"] === "ok" && data["uuid"] === localStorage.getItem("uuid")) {
                        location.href = "app.html#view=main";
                    }
                }).fail(function() {
                    if (localStorage.getItem("uuid") === "dummy" && findGetParameter("mode") !== "offline") {
                        location.href = "app.html#view=main";
                    }
                });
                try {
                    if (findGetParameter("mode") === "offline") {
                        $("#text__offline").show();
                        $("#logo__intro").attr("style", "margin-top:-32px;");
                        $("#logo__intro").show();
                        $("#view__welcome").hide();
                    } else {
                        if (localStorage.getItem("uuid") === "dummy") {
                            location.href = "app.html#view=main";
                        }
                    }
                } catch(e) { }
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
                        }, 1000)
                    } else {
                        $("#kslogin").removeAttr("disabled");
                        $("#kslogin").html(oldHTML);
                        $("#welcome__error").show();
                    }
                }).fail(function() {
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
        localStorage.setItem("uuid", "dummy");
        localStorage.setItem("username", "dummy");
        window.setTimeout(function() {
            location.href = "app.html#view=main";
        }, 50);
        e.preventDefault();
    });
try {
    if (localStorage.getItem("uuid") === null || localStorage.getItem("uuid") === "dummy" && findGetParameter("mode") !== "offline") {
         $("#view__welcome").attr("style", "");
         $("#logo__intro").hide();
     } else {
         $("#logo__intro").show();
     }
} catch (e) {
    $("#view__welcome").attr("style", "");
    $("#logo__intro").hide();
}

var userLang = navigator.language || navigator.userLanguage;
if (userLang.includes("de")) {
    localStorage.setItem("lang", "de")
    $("#welcome__error").html("<p><b style=\"color:red;\">Der Benutzername und/oder das Passwort ist falsch.</b></p>");
    $("#text__safe").html("Deine Daten sind sicher.");
    $("#header__welcome").html("Willkommen bei Nordcast");
    $("#text__welcome").html("Bitte melde dich mit deinem Account im Fediversum an. Solltest du noch keinen Account haben, kannst du dir <a href=\"signup.html\">hier</a> einen machen.");
    $("#username").attr("placeholder", "E-Mailadresse");
    $("#password").attr("placeholder", "Passwort");
    $("#instance").attr("placeholder", "Server (z.B. koyu.space)");
    $("#kslogin").html("Anmelden");
    $("#nologin").html("Weiter ohne Account");
}
});
