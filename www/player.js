var playing = false;
var platform = "";
var plmax = false;
var duration = 0;
var elapsed = 0;
var player = document.getElementById("player");
var didmax = false;
var checkheight = true;
var stylePlayer = true;
var isFullscreen = false;
var disableFullscreen = true;

$("#fullscreen").hide();

window.setTimeout(function() {
    if (localStorage.getItem("played") !== "true" && localStorage.getItem("offline") === "false") {
        $("#player__controls").hide();
    } else {
        $("#player__controls").show();
    }
    if (findGetParameter("view") === "settings") {
        $("#view__cast").hide();
    } else {
        $("#view__cast").show();
    }
    if (platform !== "ios") {
        $(".plchangesize").attr("style", "margin-left:-80px;margin-top:4px;");
    } else {
        $(".plchangesize").attr("style", "margin-top:4px;");
    }
    $(".player-controls").attr("style", "width:130px;");
}, 1500);

window.setInterval(function() {
    if ($("#player__controls").is(":visible")) {
        if (findGetParameter("view") === "yourlist") {
            $("#view__main").attr("style", "padding-bottom: 0 !important;");
        }
        if (findGetParameter("view") !== "main") {
            $("#view__"+findGetParameter("view")).css("padding-bottom", $("#player__controls").height()+$("#menubuttons").height()+$(".plchangesize").height()-20+"px");
        } else {
            if (findGetParameter("view") !== "notifications") {
                $("#view__"+findGetParameter("view")).css("padding-bottom", $("#player__controls").height()+$("#menubuttons").height()+$(".plchangesize").height()+"px");
            }
        }
    } else {
        if (!loading) {
            if (findGetParameter("view") === "main") {
                $("#view__"+findGetParameter("view")).css("padding-bottom", $("#menubuttons").height()+"px");
            }
            if (findGetParameter("view") === "yourlist") {
                $("#view__yourlist").attr("style", "padding-bottom: 40px !important;");
                $("#view__main").attr("style", "padding-bottom: 0;");
            } else {
                if (findGetParameter("view") !== "main" && findGetParameter("view") !== "notifications") {
                    $("#view__yourlist").hide();
                    $("#view__"+findGetParameter("view")).css("padding-bottom", $("#menubuttons").height()+20+"px");
                }
            }
        }
    }
}, 2500);

window.setInterval(function() {
    if (!plmax && $("#player__controls").is(":visible") && checkheight) {
        $("#player__controls").attr("style", "bottom: "+Number($("#player__controls").height() + 3.5)+"px;");
    }
    disableFullscreen = true;
    $("#player").attr("width", "800");
    $("#player").attr("width", "600");
}, 1000);

window.setInterval(function() {
    try {
        if (localStorage.getItem("played") === "true") {
            $("#player__controls").show();
        } else {
            $("#player__controls").hide();
        }
    } catch(e) {
        $("#player__controls").hide();
    }
    if (!plmax) {
        $(".timers").hide();
        $(".rangeslider").hide();
        $("#podtitle").hide();
        $(".plchangesize").attr("class", "ion-ios-arrow-up plchangesize");
        $("#plcontrols").attr("css", "margin-left: 60px;");
        if (stylePlayer) {
            $("#player").attr("style", "width:24px;height:24px;margin-left:60px; border-radius: 4px;");
        }
        $("#restart").hide();
        $("#rev").hide();
    } else {
        $(".player-controls").removeAttr("style");
        $(".timers").show();
        $(".rangeslider").show();
        $("#podtitle").show();
        $("#restart").show();
        $("#rev").show();
    }
});

function playcast(file, secret, title, author, podcover, feed, feedtitle) {
    if (file.includes(".mp4") || file.includes(".wmv") || file.includes(".mov") || file.includes(".avi") || file.includes(".mkv")) {
        disableFullscreen = false;
    } else {
        disableFullscreen = true;
    }
    plout();
    if (!playing && !$("#player__controls").is(":visible") && !plmax) {
        $("#player__controls").css("height", "0%");
        if (platform !== "ios") {
            $(".plchangesize").attr("style", "margin-left:-80px;margin-top:4px;");
        } else {
            $(".plchangesize").attr("style", "margin-top:4px;");
        }
    }
    if (plmax) {
        didmax = true;
    }
    var podtitle = Base64.decode(feedtitle) + " - " + Base64.decode(title);
    $("#podtitle").html(twemoji.parse(podtitle));
    if (podtitle.length > 30) {
        $("#podtitle").html("<marquee>"+$("#podtitle").html()+"<marquee>");
    }
    localStorage.setItem("played", "true");
    $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
        var reverse = false;
        $.get(backend+"/api/v1/getreversed", function(data) {
            data.split("\n").forEach(function(vl) {
                if (vl.includes(feed)) {
                    reverse = true;
                }
            });
        });
        var ep = 0;
        if (reverse) {
            ep = callback.entries.length - 1;
        }
        localStorage.setItem("lastplayed-"+feed, Date.now());
        $.get(backend+"/api/v1/lastplayed/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/"+Base64.encode(feed).slice(0, -3)+"/"+Date.now(), function(data) {});
    });
    var player = document.getElementById("player");
    
    $("#range-control").rangeslider({
        polyfill: false,
        onSlideEnd: function(position, value){
            var player = document.getElementById("player");
            player.currentTime = player.duration * value / 100;
        }
    });

    $(player).bind('timeupdate', function(){
        var player = document.getElementById("player");
        var percent = player.currentTime/ player.duration * 100;
        $("#range-control").val(percent).change();
    });

    if (feed !== localStorage.getItem("feed")) {
        window.setTimeout(function() {
            $("#view__cast").hide();
            kicker = true;
            window.setTimeout(function() {
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playing = true;
            }, 2700);
        });
    }

    if (feed === undefined) {
        location.href = "app.html#view=cast&cast="+Base64.encode(localStorage.getItem("feed"));
        window.setTimeout(function() {
            $("#view__cast").hide();
            kicker = true;
            window.setTimeout(function() {
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playing = true;
            }, 2700);
        });
    } else {
        localStorage.setItem("secret", secret);
        localStorage.setItem("feed", feed);
        localStorage.setItem("author", author);
        localStorage.setItem("title", title);
        localStorage.setItem("podcover", podcover);
        localStorage.setItem("feedtitle", feedtitle);
        localStorage.setItem("file", file);
        $("#bplay").attr("onclick", "playcast('"+file+"', '"+secret+"', '"+title+"', '"+author+"', '"+podcover+"', '"+feed+"', '"+feedtitle+"')");
        $("#player__controls").show();
        if (!playing) {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-pause");
            $("#bplay").attr("class", "playbutton ion-md-pause");
            var shoulddownload = true;
            try {
                if (localStorage.getItem("downloaded").includes(secret)) {
                    shoulddownload = false;
                    try {
                        if (!localStorage.getItem("downloaded").includes(secret)) {
                            shoulddownload = true;
                        }
                    } catch (e) {
                        shoulddownload = true;
                    }
                }
            } catch (e) {
                shoulddownload = false;
            }
                try {
                    if (localStorage.getItem("downloaded").includes(secret)) {
                        player.src = localStorage.getItem("download-"+secret);
                        player.play();
                        playing = true;
                    } else {
                        plclose();
                    }
                } catch (e) {
                    player.src = localStorage.getItem("file");
                    player.play();
                    playing = true;
                }
        } else {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-play");
            $("#bplay").attr("class", "playbutton ion-md-play");
            if ($("#player").attr("src") !== file && !playing) {
                $("#player").attr("src", "");
                if (platform !== "ios") {
                    player.pause();
                    playing = false;
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                        playing = false;
                    });
                }
                playing = false;
            } else {
                if (platform !== "ios") {
                    player.pause();
                    playing = false;
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                        playing = false;
                    });
                }
                playing = false;
            }
        }
        if (playing) {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-pause");
            $("#bplay").attr("class", "playbutton ion-md-pause");
            if (localStorage.getItem("uuid") === "dummy") {
                player.currentTime = Number(localStorage.getItem("time-"+secret));
            }
            if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "true") {
                player.currentTime = Number(localStorage.getItem("time-"+secret));
            }
            $(".img__cast2").attr("poster", podcover);
            $.get(backend+"/api/v1/getpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+secret+"/"+localStorage.getItem("instance"), function(data) {
                if (data["login"] === "error") {
                    if (findGetParameter("time") !== null) {
                        player.currentTime = Number(findGetParameter("time"));
                    } else {
                        player.currentTime = Number(localStorage.getItem("time-"+secret));
                    }
                    if (platform !== "ios") {
                        player.play();
                        playing = true;
                    } else {
                        addEventListener('touchstart', function (e) {
                            player.play();
                            playing = true;
                        });
                    }
                } else {
                    if (debug) {
                        console.log(data);
                    }
                    if (data["pos"] === "None") {
                        if (findGetParameter("time") !== null) {
                            player.currentTime = Number(findGetParameter("time"));
                        } else {
                            player.currentTime = Number(localStorage.getItem("time-"+secret));
                        }
                        if (platform !== "ios") {
                            player.play();
                            playing = true;
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                                playing = true;
                            });
                        }
                    } else {
                        player.currentTime = parseInt(data["pos"]);
                        if (platform !== "ios") {
                            player.play();
                            playing = true;
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                                playing = true;
                            });
                        }
                    }
                }
            }).fail(function() {
                if (localStorage.getItem("uuid") !== "dummy") {
                    if (findGetParameter("time") !== null) {
                        player.currentTime = Number(findGetParameter("time"));
                    } else {
                        player.currentTime = Number(localStorage.getItem("time-"+secret));
                    }
                }
                if (platform !== "ios") {
                    player.play();
                    playing = true;
                } else {
                    addEventListener('touchstart', function (e) {
                        player.play();
                        playing = true;
                    });
                }
            });
            if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "false") {
                window.setInterval(function() {
                    if (player.currentTime !== 0 && !player.paused) {
                        $.get(backend+"/api/v1/setpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("secret")+"/"+player.currentTime+"/"+localStorage.getItem("instance"), function(data) { });
                        localStorage.setItem("time-"+secret, player.currentTime);
                    }
                }, 1000);
            } else {
                window.setInterval(function() {
                    if (player.currentTime !== 0 && !player.paused) {
                        localStorage.setItem("time-"+secret, player.currentTime);
                    }
                }, 1000);
            }
            if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "true") {
                window.setInterval(function() {
                    if (player.currentTime !== 0 && !player.paused) {
                        localStorage.setItem("time-"+secret, player.currentTime);
                    }
                }, 1000);
            }
            window.setInterval(function() {
                if (playing) {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
                    $("#bplay").attr("class", "playbutton ion-md-pause");
                    $("#link__report").attr("onclick", "location.href = 'app.html#view=report&cast="+findGetParameter("cast")+"&ep="+secret+"'");
                } else {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
                    $("#bplay").attr("class", "playbutton ion-md-play");
                    $("#link__report").attr("onclick", "location.href = 'app.html#view=report&cast="+findGetParameter("cast")+"'");
                }
            }, 1)
        } else {
            $(".playbutton").attr("class", "playbutton ion-md-play");
        }
    }
    checkheight = false;
    if (localStorage.getItem("played") !== "true" || findGetParameter("view") === "cast") {
        if (!plmax) {
            plout();
        }
    }
}

window.setInterval(function() {
    var player = document.getElementById("player");
    try {
        if (!player.paused) {
            $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
            if ($("#playbtn-copy").html().includes(localStorage.getItem("secret"))) {
                $("#playbtn-copy").attr("class", "playbutton ion-md-pause");
            }
            $("#bplay").attr("class", "playbutton ion-md-pause");
            playing = true;
        } else {
            $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
            if ($("#playbtn-copy").html().includes(localStorage.getItem("secret"))) {
                $("#playbtn-copy").attr("class", "playbutton ion-md-play");
            }
            $("#bplay").attr("class", "playbutton ion-md-play");
            playing = false;
        }
    } catch (e) {}
});

$(document).on("keydown", function (e) {
    var player = document.getElementById("player");
    if (e.which === 37) {
        player.currentTime = player.currentTime - 10;
        return false;
    }
    if (e.which === 39) {
        player.currentTime = player.currentTime + 10;
        return false;
    }
});

//Thanks to https://stackoverflow.com/a/6313008
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function onDeviceReady() {
    window.setInterval(function() {
        var player = document.getElementById("player");
        var timeleft = "-"+String(player.duration - player.currentTime).toHHMMSS();
        if (!timeleft.includes("NaN")) {
            $("#timer").html(String(player.currentTime).toHHMMSS());
        }
    }, 1);
    
    window.setInterval(function() {
        var player = document.getElementById("player");
        var timeleft = "-"+String(player.duration - player.currentTime).toHHMMSS();
        if (timeleft.includes("NaN")) {
            if (navigator.language.includes("de")) {
                $("#timer").html("<span id=\"text__loading\">Lädt...</span>");
            } else {
                $("#timer").html("<span id=\"text__loading\">Loading...</span>");
            }
            $("#timeleft").html("");
        } else {
            $("#timeleft").html(timeleft);
            duration = player.duration;
        }
    }, 100);
    platform = "browser";

    window.setTimeout(function() {
        try {
            if (localStorage.getItem("file") !== null) {
                player.src = localStorage.getItem("file");
            }
        } catch (e) {}
    }, 500);

    window.setTimeout(function() {
        if (localStorage.getItem("played") !== "true" && localStorage.getItem("offline") === "false") {
            $("#player__controls").hide();
        } else {
            $("#player__controls").show();
        }
        $("#player__controls").show();
        var player = document.getElementById("player");
        if (player.paused) {
            if (localStorage.getItem("uuid") === "dummy") {
                player.currentTime = Number(localStorage.getItem("time-"+localStorage.getItem("secret")));
            }
            if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "true") {
                player.currentTime = Number(localStorage.getItem("time-"+localStorage.getItem("secret")));
            }
            if (findGetParameter("time") !== null) {
                player.currentTime = Number(findGetParameter("time"));
            } else {
                player.currentTime = Number(localStorage.getItem("time-"+localStorage.getItem("secret")));
            }
        }
        var podtitle = Base64.decode(localStorage.getItem("feedtitle")) + " - " + Base64.decode(localStorage.getItem("title"));
        $("#podtitle").html(twemoji.parse(podtitle));
        if (podtitle.length > 50) {
            $("#podtitle").html("<marquee>"+$("#podtitle").html()+"<marquee>");
        }
        $(".img__cast2").attr("poster", localStorage.getItem("podcover"));
        $("#bplay").attr("onclick", "playcast('"+localStorage.getItem("file")+"', '"+localStorage.getItem("secret")+"', '"+localStorage.getItem("title")+"', '"+localStorage.getItem("author")+"', '"+localStorage.getItem("podcover")+"', '"+localStorage.getItem("feed")+"', '"+localStorage.getItem("feedtitle")+"')");
        window.setTimeout(function() {
            $("#range-control").rangeslider({
                polyfill: false,
                onSlideEnd: function(position, value){
                    var player = document.getElementById("player");
                    player.currentTime = player.duration * value / 100;
                }
            });
            var player = document.getElementById("player");
            var percent = player.currentTime / player.duration * 100;
            $("#range-control").val(percent).change();
        }, 3000);
        var downloaded = false;
        try {
            if (localStorage.getItem("downloaded").includes(localStorage.getItem("secret"))) {
                downloaded = true;
                try {
                    if (!localStorage.getItem("downloaded").includes(localStorage.getItem("secret"))) {
                        downloaded = false;
                    }
                } catch (e) {
                    downloaded = true;
                }
            }
        } catch(e) {}
        if (downloaded) {
            player.src = localStorage.getItem("download-"+localStorage.getItem("secret"));
        }
    }, 1500);
}

window.setInterval(function() {
    try {
        var color = localStorage.getItem("color-"+Base64.encode(localStorage.getItem("feed")).slice(0, -3));
        var style = "background:rgb(" + color.split("\n")[0] + ") !important;";
        $(".rangeslider__fill").attr("style", $(".rangeslider__fill").attr("style").replaceAll(style) + style);
    } catch (e) {}
}, 1500);

function ffw() {
    var player = document.getElementById("player");
    player.currentTime = player.currentTime + 10;
}

function restart() {
    var player = document.getElementById("player");
    player.currentTime = 0;
}

function rev() {
    var player = document.getElementById("player");
    player.currentTime = player.currentTime - 10;
}

function plclose() {
    plmax = false;
    didmax = false;
    checkheight = false;
    var player = document.getElementById("player");
    if (playing) {
        player.pause();
        playing = false;
        $(".playbutton").attr("class", "playbutton ion-md-play");
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
        $("#bplay").attr("class", "playbutton ion-md-play");
    }
     anime({
        targets: "#player__controls",
        height: 0,
        duration: 500,
        autoplay: true
    });
    window.setTimeout(function() {
        $("#player__controls").hide();
        localStorage.setItem("played", "false");
    }, 500);
    $("body").removeAttr("style");
    $("#player").attr("src", "");
}

function plout() {
    plmax = false;
    checkheight = false;
    anime({
        targets: "#player__controls",
        height: 45,
        duration: 500,
        autoplay: true
    });
    anime({
        targets: "#player",
        width: 24,
        height: 24,
        duration: 500,
        autoplay: true
    });
    $(".plchangesize").attr("class", "ion-ios-arrow-up plchangesize");
    $("#plcontrols").attr("css", "margin-left: 60px;");
    $("#player").attr("style", "width:24px;height:24px;margin-top:12px;margin-left:60px; border-radius: 4px;");
    $(".player-controls").attr("style", "width:130px;");
}

function plin() {
    plmax = true;
    anime({
        targets: "#player__controls",
        height: $(window).height() - 150,
        duration: 500,
        autoplay: true
    });
    anime({
        targets: "#player",
        width: 280,
        height: 280,
        duration: 500,
        autoplay: true
    });
    $("#player").attr("style", "margin-left: auto; margin-right: auto; display: block; float: none; margin-top: 20px; border-radius: 10px;");
    $(".plchangesize").attr("class", "ion-ios-arrow-down plchangesize");
    $(".plchangesize").attr("style", "margin-left: 15px;");
}

function plchangesize() {
    if (!plmax) {
        plin();
    } else {
        didmax = true;
        plout();
    }
}

function fullscreen() {
    isFullscreen = !isFullscreen;
    if (!disableFullscreen) {
        var player = document.getElementById("player");
        player.requestFullscreen();
    }
}

function bplay() {
    playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
}

onDeviceReady();
