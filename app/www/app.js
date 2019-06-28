document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function() {
    $("#view__main").css("padding-top", "90px");
    var searchtoggle = false;
    $("#wrapper__search").hide();
    localStorage.setItem("podlist", "https://aboutweb.podigee.io/feed/mp3,https://www.nrwision.de/mediathek/sendungen/abschied-von-der-steinkohle/rss/100/")
    $("#view__main").hide();
    $("#view__settings").hide();
    $("#nav").hide();
    window.setTimeout(function() {
        $("#logo__intro").hide();
        $("#view__main").show();
        $("#nav").show();
    }, 2000);
    $("#logout").click(function() {
        localStorage.clear()
        window.setTimeout(function() {
            location.href = "index.html";
        }, 200);
    });
    if (localStorage.getItem("podlist") === null) {
        $("#section__list").html("<p style=\"text-align:center;\">Es befinden sich keine Podcasts in deiner Liste.</p>")
    } else {
        $("#section__list").html($("#section__list").html()+"<p>");
        localStorage.getItem("podlist").split(",").forEach(function(feed) {
            $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                $("#section__list").html($("#section__list").html()+"<img src=\""+callback.feed.image.href+"\" class=\"card__small\" />")
            });
        });
        $("#section__list").html($("#section__list").html()+"</p>");
    }
    $("#section__featured").html();
    $("#section__featured").html($("#section__featured").html()+"<div><img src=\""+backend+"/api/v1/getbanner/1\" class=\"card__big\" /></div>");
    $("#section__featured").html($("#section__featured").html()+"<div><img src=\""+backend+"/api/v1/getbanner/2\" class=\"card__big\" /></div>");
    $("#section__featured").html($("#section__featured").html()+"<div><img src=\""+backend+"/api/v1/getbanner/3\" class=\"card__big\" /></div>");

    $(".card__big").primaryColor({
        callback: function(color) {
            $(this).css('box-shadow', '0px 0px 13px 2px rgba('+color+',0.75)');
        }
    });
    
    $(".fa__nav2").click(function() {
        if (searchtoggle === false) {
            $("#wrapper__search").show();
            searchtoggle = true;
            $("#view__main").css("padding-top", "150px");
        } else {
            $("#wrapper__search").hide();
            searchtoggle = false;
            $("#view__main").css("padding-top", "90px");
        }
    });
    $(".fa__nav").click(function() {
        $("#view__main").hide();
        $(".fa__nav").hide();
        $(".fa__nav2").hide();
        $("#wrapper__search").hide();
        $("#view__main").css("padding-top", "90px");
        searchtoggle = false;
        $("#view__settings").show();
    });
    $("#logo__nav").click(function() {
        $("#view__main").show();
        $(".fa__nav").show();
        $(".fa__nav2").show();
        $("#view__settings").hide();
    });
    $("#qq").keyup(function() {
        $.getJSON("https://searchapi.koyu.space/" + $("#qq").val(), function(data) {
            $("#qq").autocomplete({
                source: data[1],
                select: function() {
                    setTimeout(function() {
                        $("#submit").click();
                    }, 50);
                }
            });
        });
    });
});

//Cordova-specific code
function onDeviceReady() {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#fff");
    }
}