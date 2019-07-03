function shownotes(rss, shownotes) {
    oldhtml = $("#view__main").html();
    $("#view__main").html("");
    $("#view__main").append(shownotes);
    $("#view__main").css("padding", "20px");
    $("#view__main").css("padding-top", "100px");
    $("a").attr("onclick", "window.open('"+$("a").attr("href")+"', '_system')");
    $("a").attr("href", "");
    $("#snclose").show();
}