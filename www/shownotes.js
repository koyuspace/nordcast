var oldhtml = "";

function shownotes(shownotes) {
    oldhtml = $("#view__cast").html();
    $(".fa__nav2").hide();
    $(".addfeed").hide();
    localStorage.setItem("scrollpos", window.scrollY);
    $("#view__cast").html("<h1 id=\"text__shownotes\">Shownotes</h1><br><div id=\"shownotes\">"+twemoji.parse(Base64.decode(shownotes))+"</div>");
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
    window.scroll(0, Number(localStorage.getItem("scrollpos")));
    window.setTimeout(function() {
        localStorage.removeItem("scrollpos");
    }, 200)
}