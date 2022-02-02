function share(cast) {
    if (localStorage.getItem("lang") === "de") {
        window.plugins.socialsharing.share("Hey, ich habe diesen Podcast auf Nordcast gefunden und du solltest ihn dir unbedingt anhören: https://nordcast.koyu.space/app.html#view=cast&cast="+cast+"&shared=true");
    } else {
        window.plugins.socialsharing.share("Hey, I found this podcast on Nordcast and you should definitely grab a listen: https://nordcast.koyu.space/app.html#view=cast&cast="+cast+"&shared=true");
    }
}

function tootshare() {
    var sharetext = "Hey, I found this podcast on #Nordcast and you should definitely grab a listen: https://nordcast.koyu.space/app.html#view=cast&cast="+findGetParameter("cast")+"&shared=true";
    if (localStorage.getItem("lang") === "de") {
        sharetext = "Hey, ich habe diesen Podcast auf #Nordcast gefunden und du solltest ihn dir unbedingt anhören: https://nordcast.koyu.space/app.html#view=cast&cast="+findGetParameter("cast")+"&shared=true";
    }
    sharetext = encodeURI(sharetext);
    $.post(backend+"/api/v1/toot/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/public", {content: sharetext}, function(data) {
        if (data["login"] === "ok") {
            if (localStorage.getItem("lang") === "de") {
                $("#text__koyushare").html("Geteilt auf koyu.space!");
                $(".tootshare").html("<img src=\"fediverse.svg\"> Geteilt auf <span id=\"instance\">koyu.space</span>!");
            } else {
                $("#text__koyushare").html("Shared on koyu.space!");
                $(".tootshare").html("<img src=\"fediverse.svg\"> Shared on <span id=\"instance\">koyu.space</span>!");
            }
            $(".koyushare").attr("disabled", "");
            $(".tootshare").attr("disabled", "");
        }
    });
}
