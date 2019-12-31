var oldhtml = "";

function shownotes(shownotes) {
    oldhtml = $("#view__cast").html();
    $(".fa__nav2").hide();
    $(".addfeed").hide();
    $("#view__cast").html("<h1 id=\"text__shownotes\">Shownotes</h1><br><div id=\"shownotes\">"+twemoji.parse(Base64.decode(shownotes))+"</div>");
    $("#view__cast").css("padding", "20px");
    $("#view__cast").css("padding-top", "110px");
    $("#view__cast").css("padding-bottom", "0px");
    $("#snclose").show();
    $("#snclose").attr("onclick", "restoreview()");
    scrollTo(0,0);
}

function restoreview() {
    $(".fa__nav2").show();
    $("#snclose").hide();
    if (donator) {
        $(".addfeed").show();
    }
    $("#view__cast").html(oldhtml);
}