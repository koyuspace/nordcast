var playing = false;
var platform = "";
var fileTransfer;

/*
Filesystem access
Sources:    https://www.tutorialspoint.com/cordova/cordova_file_system.htm
            https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
            https://stackoverflow.com/questions/12874021/phonegap-download-mp3-file
            https://stackoverflow.com/questions/34692092/cordova-check-if-file-in-url-exists
*/

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
        $("body").attr("style", "margin-bottom: 150px !important;");
        $("#bplay").attr("onclick", "playcast('"+file+"', '"+secret+"', '"+title+"', '"+author+"', '"+podcover+"', '"+feed+"', '"+feedtitle+"')");
        $("#link__cast").attr("data-cast", Base64.encode(feed));
        $("#player__controls").show();
        if (!playing) {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-pause");
            $("#bplay").attr("class", "playbutton ion-md-pause");
            var shoulddownload = true;
            if (localStorage.getItem("download-")+secret !== null) {
                shoulddownload = false;
                try {
                    if (!localStorage.getItem("downloaded").includes(secret)) {
                        shoulddownload = true;
                    }
                } catch (e) {
                    shoulddownload = true;
                }
            }
            if (shoulddownload) {
                window.setTimeout(function() {
                    fileTransfer.download(
                        file,
                        'cdvfile://localhost/persistent/Nordcast/downloads/'+secret+'.mp3',
                        function(entry) {
                            if (debug) {
                                console.log("download complete: " + entry.toURL());
                            }
                            player.src = entry.toURL();
                            $("#dlbtn-"+secret+" i").attr("class", "ion-md-checkmark-circle dlbutton");
                            localStorage.setItem("download-"+secret, entry.toURL());
                            localStorage.setItem("downloaded", localStorage.getItem("downloaded")+","+secret);
                            player.play();
                        },
                        function(error) {
                            if (debug) {
                                console.log("download error source " + error.source);
                                console.log("download error target " + error.target);
                                console.log("download error code " + error.code);
                            }
                            try {
                                if (localStorage.getItem("downloaded").includes(secret)) {
                                    $("#player").attr("src", localStorage.getItem("download-"+secret));
                                    $("#dlbtn-"+secret+" i").attr("class", "ion-md-checkmark-circle dlbutton");
                                    player.play();
                                } else {
                                    plclose();
                                }
                            } catch (e) {
                                $("#player").attr("src", file);
                                player.play();
                                $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud dlbutton");
                            }
                        },
                        false
                    );
                },0);
            } else {
                $("#player").attr("src", localStorage.getItem("download-"+secret));
                $("#dlbtn-"+secret+" i").attr("class", "ion-md-checkmark-circle dlbutton");
            }
            if ($("#player").attr("src") !== file) {
                if (localStorage.getItem("download-"+secret) !== undefined) {
                    $("#player").attr("src", localStorage.getItem("download-"+secret));
                    $("#dlbtn-"+secret+" i").attr("class", "ion-md-checkmark-circle dlbutton");
                } else {
                    $("#player").attr("src", file);
                }
            }
            playing = true;
        } else {
            $(".playbutton").attr("class", "playbutton ion-md-play");
            $("#cast-"+secret).attr("class", "playbutton ion-md-play");
            $("#bplay").attr("class", "playbutton ion-md-play");
            if ($("#player").attr("src") !== file && !playing) {
                $("#player").attr("src", "");
                if (platform !== "ios") {
                    player.pause();
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                    });
                }
                playing = false;
                playcast(file);
            } else {
                if (platform !== "ios") {
                    player.pause();
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                    });
                }
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
            var podtitle = Base64.decode(feedtitle) + " - " + Base64.decode(title);
            $("#podtitle").html(twemoji.parse(podtitle));
            if (podtitle.length > 50) {
                $("#podtitle").html("<marquee>"+$("#podtitle").html()+"<marquee>");
            }
            $("#img__cast2").attr("src", podcover);
            $.get(backend+"/api/v1/getpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+secret+"/"+localStorage.getItem("instance"), function(data) {
                if (data["login"] === "error") {
                    player.currentTime = 0;
                    if (platform !== "ios") {
                        player.play();
                    } else {
                        addEventListener('touchstart', function (e) {
                            player.play();
                        });
                    }
                } else {
                    if (debug) {
                        console.log(data);
                    }
                    if (data["pos"] === "None") {
                        player.currentTime = 0;
                        if (platform !== "ios") {
                            player.play();
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                            });
                        }
                    } else {
                        player.currentTime = parseInt(data["pos"]);
                        if (platform !== "ios") {
                            player.play();
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                            });
                        }
                    }
                }
            }).error(function() {
                if (localStorage.getItem("uuid") !== "dummy") {
                    player.currentTime = 0;
                }
                if (platform !== "ios") {
                    player.play();
                } else {
                    addEventListener('touchstart', function (e) {
                        player.play();
                    });
                }
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
        var timeleft = "-"+String(player.duration - player.currentTime).toHHMMSS();
        if (!timeleft.includes("NaN")) {
            $("#timer").html(String(player.currentTime).toHHMMSS());
        }
    }, 1);
    
    window.setInterval(function() {
        var player = document.getElementById("player");
        var timeleft = "-"+String(player.duration - player.currentTime).toHHMMSS();
        if (timeleft.includes("NaN")) {
            navigator.globalization.getPreferredLanguage(function (language) {
                if (language.value.includes("de")) {
                    $("#timer").html("<span id=\"text__loading\">Lädt...</span>");
                } else {
                    $("#timer").html("<span id=\"text__loading\">Loading...</span>");
                }
            });
            $("#timeleft").html("");
        } else {
            $("#timeleft").html(timeleft);
        }
    }, 100);
    fileTransfer = new FileTransfer();
    platform = device.platform;
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
    $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud dlbutton");
}

document.addEventListener("deviceready", onDeviceReady, false);