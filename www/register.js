document.addEventListener("deviceready", onDeviceReady, false);
var locale = "en";

$(document).ready(function() {
    if (localStorage.getItem("darkmode") === "true") {
        $("head").append("<link rel=\"stylesheet\" href=\"dark.css\">");
        $("#logo__nav").attr("src", "logo_dark.png");
    }

    $("#view__okay").hide();
    $("#error__register").hide();

    window.setInterval(function() {
        $(".text-domain").html(findGetParameter("server"));
    });

    $("#text__terms").click(function() {
        $("#checkbox").click();
    });

    $("#submit__register").click(function() {
        $("#error__register").hide();
        $("#submit__register").html("<img src=\"loading.svg\" height=\"16\" style=\"margin-top:-3px;\"> "+$("#submit__register").html());
        $("#submit__register").attr("disabled", "");
        if ($("#checkbox").is(":checked")) {
            $.post(backend+"/api/v1/register/"+locale+"/"+findGetParameter("server"), {username: $("#username").val(), email: $("#email").val(), password: $("#password").val()}, function(data) {
                if (data["action"] === "success") {
                    $("#view__register").hide();
                    $("#view__okay").show();
                } else {
                    $("#submit__register").html($("#submit__register").html().replace("<img src=\"loading.svg\" height=\"16\" style=\"margin-top:-3px;\">", ""));
                    $("#submit__register").removeAttr("disabled");
                    $("#error__register").show();
                }
            }).fail(function() {
                $("#submit__register").html($("#submit__register").html().replace("<img src=\"loading.svg\" height=\"16\" style=\"margin-top:-3px;\">", ""));
                $("#submit__register").removeAttr("disabled");
                $("#error__register").show();
            });
        } else {
            $("#submit__register").html($("#submit__register").html().replace("<img src=\"loading.svg\" height=\"16\" style=\"margin-top:-3px;\">", ""));
            $("#submit__register").removeAttr("disabled");
            $("#error__register").show();
        }
    });

    $("#password").keypress(function (e) {
        if (e.which === 13) {
          $("#submit__register").click();
          return false;
        }
    });

    window.setTimeout(function() {
        if (localStorage.getItem("lang") === "de") {
            $("#view__register h1").html("Registriere dich auf <span class=\"text-domain\">koyu.space</span>");
            $("#register__intro").html("Wir können folgende Server empfehlen:");
            $("#username").attr("placeholder", "Benutzername");
            $("#email").attr("placeholder", "E-Mailadresse");
            $("#password").attr("placeholder", "Passwort");
            $("#text__terms").html("Ich akzeptiere die <a href=\"#\" onclick=\"window.open('https://"+findGetParameter("server")+"/terms', '_system'); return false;\">Datenschutzerklärung</a> und <a href=\"#\" onclick=\"window.open('https://"+findGetParameter("server")+"/about/more', '_system'); return false;\">Regeln</a> von <span class=\"text-domain\">koyu.space</span>.");
            $("#submit__register").html("Registrieren");
            $("#register__return").html("Zur App zurückkehren");
            $("#register__success__text").html("Du wirst eine E-Mail in den nächsten paar Minuten erhalten, die dir erklärt wie du deinen Account aktivieren kannst. Sobald deine E-Mail bestätigt wurde kannst du dich mit deinen Zugangsdaten in der App anmelden. Solltest du keine E-Mail erhalten haben prüfe bitte deinen Spam-Ordner oder informiere den Server-Besitzer von <span class=\"text-domain\">koyu.space</span>.");
            $("#register__success").html("Deine Registrierung war erfolgreich");
            locale = "de";
        } else {
            $("#text__terms").html("I accept the <a href=\"#\" onclick=\"window.open('https://"+findGetParameter("server")+"/terms', '_system'); return false;\">privacy policy</a> and <a href=\"#\" onclick=\"window.open('https://"+findGetParameter("server")+"/about/more', '_system'); return false;\">server rules</a> of <span class=\"text-domain\">koyu.space</span>.");
        }
    },500);
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
}