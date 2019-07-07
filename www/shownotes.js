var oldhtml = "";

function shownotes(shownotes) {
    oldhtml = $("#view__cast").html();
    $(".fa__nav2").hide();
    $("#view__cast").html("<div id=\"shownotes\">"+twemoji.parse(Base64.decode(shownotes))+"</div>");
    $("#view__cast").css("padding", "20px");
    $("#view__cast").css("padding-top", "100px");
    $("#snclose").show();
    scrollTo(0,0);
}

function restoreview() {
    $(".fa__nav2").show();
    $("#view__cast").html(oldhtml);
}