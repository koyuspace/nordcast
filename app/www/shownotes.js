var oldhtml = "";

function shownotes(shownotes) {
    oldhtml = $("#view__main").html();
    $("#view__main").html("<div id=\"shownotes\">"+Base64.decode(shownotes)+"</div>");
    $("#view__main").css("padding", "20px");
    $("#view__main").css("padding-top", "100px");
    $("#snclose").show();
    scrollTo(0,0);
}

function restoreview() {
    $("#view__main").html(oldhtml);
}