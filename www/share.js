function share() {
    if (localStorage.getItem("lang") === "de") {
        window.plugins.socialsharing.share("Hey, ich habe diesen Podcast auf Nordcast gefunden und du solltest ihn dir unbedingt anhören: https://web.nordcast.app/app.html#view=cast&cast="+findGetParameter("cast")+"&shared=true");
    } else {
        window.plugins.socialsharing.share("Hey, I found this podcast on Nordcast and you should definitely grab a listen: https://web.nordcast.app/app.html#view=cast&cast="+findGetParameter("cast")+"&shared=true");
    }
}