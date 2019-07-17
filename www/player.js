var playing = false;
function playcast(file, secret, title, author, podcover, feed, feedtitle) {
    var player = document.getElementById("player");
    if (feed === undefined) {
        location.href = "app.html#view=cast&cast="+Base64.encode(localStorage.getItem("feed"));
        window.setTimeout(function() {
            $("#view__cast").hide();
            kicker = true;
            window.setTimeout(function() {
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playcast(localStorage.getItem("file"), localStorage.getItem("secret"), localStorage.getItem("title"), localStorage.getItem("author"), localStorage.getItem("podcover"), localStorage.getItem("feed"), localStorage.getItem("feedtitle"));
                playing = true;
            }, 2700)
        });
    } else {
        localStorage.setItem("secret", secret);
        localStorage.setItem("feed", feed);
        localStorage.setItem("author", author);
        localStorage.setItem("title", title);
        localStorage.setItem("podcover", podcover);
        localStorage.setItem("feedtitle", feedtitle);
        localStorage.setItem("file", file);
        $("body").attr("style", "margin-bottom: 190px !important;");
        $("#bplay").attr("onclick", "playcast('"+file+"', '"+secret+"', '"+title+"', '"+author+"', '"+podcover+"', '"+feed+"', '"+feedtitle+"')");
        $("#link__cast").attr("data-cast", Base64.encode(feed));
        $("#player__controls").show();
        if (!playing) {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-pause");
            $("#bplay").attr("class", "playbutton ion-md-pause");
            if ($("#player").attr("src") !== file) {
                $("#player").attr("src", file);
            }
            playing = true;
        } else {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-play");
            $("#bplay").attr("class", "playbutton ion-md-play");
            if ($("#player").attr("src") !== file) {
                $("#player").attr("src", "");
                player.pause();
                playing = false;
                playcast(file);
            } else {
                player.pause();
                playing = false;
            }
        }
        if (playing) {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-pause");
            $("#bplay").attr("class", "playbutton ion-md-pause");
            if (author === "Nordisch Media Tobias Ain") {
                author = "Nordisch Media";
            }
            var podtitle = feedtitle + " - " + Base64.decode(title);
            $("#podtitle").html(twemoji.parse(podtitle));
            if (podtitle.length > 50) {
                $("#podtitle").html("<marquee>"+$("#podtitle").html()+"<marquee>");
            }
            $("#img__cast2").attr("src", podcover);
            $.get(backend+"/api/v1/getpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+secret+"/"+localStorage.getItem("instance"), function(data) {
                if (data["login"] === "error") {
                    player.currentTime = 0;
                    player.play();
                } else {
                    if (debug) {
                        console.log(data);
                    }
                    if (data["pos"] === "None") {
                        player.currentTime = 0;
                        player.play();
                    } else {
                        player.currentTime = parseInt(data["pos"]);
                        player.play();
                    }
                }
            }).error(function() {
                if (localStorage.getItem("uuid") !== "dummy") {
                    player.currentTime = 0;
                }
                player.play();
            });
            if (localStorage.getItem("uuid") !== "dummy") {
                window.setInterval(function() {
                    $.get(backend+"/api/v1/setpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("secret")+"/"+player.currentTime+"/"+localStorage.getItem("instance"), function(data) { });
                }, 1000);
            }
            window.setInterval(function() {
                if (playing) {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
                    $("#bplay").attr("class", "playbutton ion-md-pause");
                } else {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
                    $("#bplay").attr("class", "playbutton ion-md-play");
                }
            }, 1)
        } else {
            $(".playbutton").attr("class", "playbutton ion-md-play");
        }
    }
}

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
        $("#timer").html(String(player.currentTime).toHHMMSS());
    }, 1);
    
    window.setInterval(function() {
        var player = document.getElementById("player");
        $("#timeleft").html("-"+String(player.duration - player.currentTime).toHHMMSS());
    }, 100);
}

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
    if (playing) {
        player.pause();
        playing = false;
        $(".playbutton").attr("class", "playbutton ion-md-play");
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
        $("#bplay").attr("class", "playbutton ion-md-play");
    }
    $("#player__controls").hide();
    $("body").removeAttr("style");
}

document.addEventListener("deviceready", onDeviceReady, false);