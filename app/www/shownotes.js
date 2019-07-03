var oldhtml = "";

function shownotes(shownotes) {
    oldhtml = $("#view__main").html();
    $(".fa__nav2").hide();
    $("#view__main").html("<div id=\"shownotes\">"+Base64.decode(shownotes)+"</div>");
    $("#view__main").css("padding", "20px");
    $("#view__main").css("padding-top", "100px");
    $("#snclose").show();
    scrollTo(0,0);
}

function restoreview() {
    $(".fa__nav2").show();
    $("#view__main").html(oldhtml);
    if (playing) {
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
    } else {
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
    }
}