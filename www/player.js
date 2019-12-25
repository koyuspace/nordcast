var playing = false;
var platform = "";
var plmax = false;
var duration = 0;
var elapsed = 0;

function addControls(file, secret, title, author, podcover, feed, feedtitle) {
    // Taken from the docs on https://github.com/ghenry22/cordova-music-controls-plugin

    var player = document.getElementById("player");
    try {
        var artist = "";
        if (Base64.decode(author) === "undefined") {
            artist = Base64.decode(feedtitle);
        } else {
            artist = Base64.decode(author);
        }
        MusicControls.create({
            track       : Base64.decode(title),
            artist      : artist,
            album       : feedtitle,
            cover       : podcover,
            isPlaying   : playing,							// optional, default : true
            dismissable : false,							// optional, default : false

            hasPrev   : false,		// show previous button, optional, default: true
            hasNext   : false,		// show next button, optional, default: true
            hasClose  : true,		// show close button, optional, default: false
        
            // iOS only, optional
            
            duration : duration, // optional, default: 0
            elapsed : elapsed, // optional, default: 0
            hasSkipForward : true, //optional, default: false. true value overrides hasNext.
            hasSkipBackward : true, //optional, default: false. true value overrides hasPrev.
            skipForwardInterval : 10, //optional. default: 0.
            skipBackwardInterval : 10, //optional. default: 0.
            hasScrubbing : true, //optional. default to false. Enable scrubbing from control center progress bar 
        
            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated
            ticker	  : 'Now playing "'+feedtitle+'"',
            //All icons default to their built-in android equivalents
            //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
            playIcon: 'media_play',
            pauseIcon: 'media_pause',
            prevIcon: 'media_prev',
            nextIcon: 'media_next',
            closeIcon: 'media_close',
            notificationIcon: 'notification'
        }, function() {
            if (debug) {
                console.log("Media controls initalized");
            }
        }, function() {
            if (debug) {
                console.log("Cannot initialize media controls");
            }
        });
        function events(action) {

            const message = JSON.parse(action).message;
              switch(message) {
                  case 'music-controls-pause':
                      playcast(file, secret, title, author, podcover, feed, feedtitle);
                      break;
                  case 'music-controls-play':
                      playcast(file, secret, title, author, podcover, feed, feedtitle);
                      break;
                  case 'music-controls-destroy':
                      plclose();
                      break;
          
                  // External controls (iOS only)
                  case 'music-controls-toggle-play-pause' :
                      bplay();
                      break;
                  case 'music-controls-seek-to':
                      const seekToInSeconds = JSON.parse(action).position;
                      MusicControls.updateElapsed({
                          elapsed: seekToInSeconds,
                          isPlaying: true
                      });
                      player.currentTime = seekToInSeconds;
                      // Do something
                      break;
          
                  // Headset events (Android only)
                  // All media button events are listed below
                  case 'music-controls-media-button' :
                      playcast(file, secret, title, author, podcover, feed, feedtitle);
                      break;
                  case 'music-controls-headset-unplugged':
                      if (playing) {
                        playcast(file, secret, title, author, podcover, feed, feedtitle);
                      }
                      break;
                  default:
                      break;
              }
          }
          
          // Register callback
          MusicControls.subscribe(events);
          
          // Start listening for events
          // The plugin will run the events function each time an event is fired
          MusicControls.listen();
    } catch(e) {}
}

function playcast(file, secret, title, author, podcover, feed, feedtitle) {
    if (!playing && $("#player__controls").attr("style") === "display: none;" && !plmax) {
        $("#player__controls").css("height", "0%");
    }
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
        $("body").attr("style", "margin-bottom: 150px !important;");
        $("#bplay").attr("onclick", "playcast('"+file+"', '"+secret+"', '"+title+"', '"+author+"', '"+podcover+"', '"+feed+"', '"+feedtitle+"')");
        $("#link__cast").attr("data-cast", Base64.encode(feed));
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
            if (shoulddownload) {
                if (localStorage.getItem("offline") === "false") {
                    player.src = localStorage.getItem("file");
                    player.play();
                    playing = true;
                    if (device.platform !== "browser") {
                        MusicControls.destroy(function() {
                            if (debug) {
                                console.log("Media controls destroyed")
                            }
                        }, function() {
                            if (debug) {
                                console.log("Error destroying media controls")
                            }
                        });
                        addControls(file, secret, title, author, podcover, feed, feedtitle);
                    }

                } else {
                    plclose();
                }
            } else {
                try {
                    if (localStorage.getItem("downloaded").includes(secret)) {
                        player.src = localStorage.getItem("download-"+secret);
                        player.play();
                        playing = true;
                        if (device.platform !== "browser") {
                            MusicControls.destroy(function() {
                                if (debug) {
                                    console.log("Media controls destroyed")
                                }
                            }, function() {
                                if (debug) {
                                    console.log("Error destroying media controls")
                                }
                            });
                            addControls(file, secret, title, author, podcover, feed, feedtitle);
                        }
                    } else {
                        plclose();
                    }
                } catch (e) {
                    player.src = localStorage.getItem("file");
                    player.play();
                    playing = true;
                    if (device.platform !== "browser") {
                        MusicControls.destroy(function() {
                            if (debug) {
                                console.log("Media controls destroyed")
                            }
                        }, function() {
                            if (debug) {
                                console.log("Error destroying media controls")
                            }
                        });
                        addControls(file, secret, title, author, podcover, feed, feedtitle);
                    }
                }
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
                    if (device.platform !== "browser") {
                        MusicControls.destroy(function() {
                            if (debug) {
                                console.log("Media controls destroyed")
                            }
                        }, function() {
                            if (debug) {
                                console.log("Error destroying media controls")
                            }
                        });
                        addControls(file, secret, title, author, podcover, feed, feedtitle);
                    }
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                        playing = false;
                        if (device.platform !== "browser") {
                            MusicControls.destroy(function() {
                                if (debug) {
                                    console.log("Media controls destroyed")
                                }
                            }, function() {
                                if (debug) {
                                    console.log("Error destroying media controls")
                                }
                            });
                            addControls(file, secret, title, author, podcover, feed, feedtitle);
                        }
                    });
                }
                playing = false;
            } else {
                if (platform !== "ios") {
                    player.pause();
                    playing = false;
                    if (device.platform !== "browser") {
                        MusicControls.destroy(function() {
                            if (debug) {
                                console.log("Media controls destroyed")
                            }
                        }, function() {
                            if (debug) {
                                console.log("Error destroying media controls")
                            }
                        });
                        addControls(file, secret, title, author, podcover, feed, feedtitle);
                    }
                } else {
                    addEventListener('touchstart', function (e) {
                        player.pause();
                        playing = false;
                        if (device.platform !== "browser") {
                            MusicControls.destroy(function() {
                                if (debug) {
                                    console.log("Media controls destroyed")
                                }
                            }, function() {
                                if (debug) {
                                    console.log("Error destroying media controls")
                                }
                            });
                            addControls(file, secret, title, author, podcover, feed, feedtitle);
                        }
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
            var podtitle = Base64.decode(feedtitle) + " - " + Base64.decode(title);
            $("#podtitle").html(twemoji.parse(podtitle));
            if (podtitle.length > 50) {
                $("#podtitle").html("<marquee>"+$("#podtitle").html()+"<marquee>");
            }
            $("#img__cast2").attr("src", podcover);
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
                        if (device.platform !== "browser") {
                            MusicControls.destroy(function() {
                                if (debug) {
                                    console.log("Media controls destroyed")
                                }
                            }, function() {
                                if (debug) {
                                    console.log("Error destroying media controls")
                                }
                            });
                            addControls(file, secret, title, author, podcover, feed, feedtitle);
                        }
                    } else {
                        addEventListener('touchstart', function (e) {
                            player.play();
                            playing = true;
                            if (device.platform !== "browser") {
                                MusicControls.destroy(function() {
                                    if (debug) {
                                        console.log("Media controls destroyed")
                                    }
                                }, function() {
                                    if (debug) {
                                        console.log("Error destroying media controls")
                                    }
                                });
                                addControls(file, secret, title, author, podcover, feed, feedtitle);
                            }
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
                            if (device.platform !== "browser") {
                                MusicControls.destroy(function() {
                                    if (debug) {
                                        console.log("Media controls destroyed")
                                    }
                                }, function() {
                                    if (debug) {
                                        console.log("Error destroying media controls")
                                    }
                                });
                                addControls(file, secret, title, author, podcover, feed, feedtitle);
                            }
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                                playing = true;
                                if (device.platform !== "browser") {
                                    MusicControls.destroy(function() {
                                        if (debug) {
                                            console.log("Media controls destroyed")
                                        }
                                    }, function() {
                                        if (debug) {
                                            console.log("Error destroying media controls")
                                        }
                                    });
                                    addControls(file, secret, title, author, podcover, feed, feedtitle);
                                }
                            });
                        }
                    } else {
                        player.currentTime = parseInt(data["pos"]);
                        if (platform !== "ios") {
                            player.play();
                            playing = true;
                            if (device.platform !== "browser") {
                                MusicControls.destroy(function() {
                                    if (debug) {
                                        console.log("Media controls destroyed")
                                    }
                                }, function() {
                                    if (debug) {
                                        console.log("Error destroying media controls")
                                    }
                                });
                                addControls(file, secret, title, author, podcover, feed, feedtitle);
                            }
                        } else {
                            addEventListener('touchstart', function (e) {
                                player.play();
                                playing = true;
                                if (device.platform !== "browser") {
                                    MusicControls.destroy(function() {
                                        if (debug) {
                                            console.log("Media controls destroyed")
                                        }
                                    }, function() {
                                        if (debug) {
                                            console.log("Error destroying media controls")
                                        }
                                    });
                                    addControls(file, secret, title, author, podcover, feed, feedtitle);
                                }
                            });
                        }
                    }
                }
            }).error(function() {
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
                    if (device.platform !== "browser") {
                        MusicControls.destroy(function() {
                            if (debug) {
                                console.log("Media controls destroyed")
                            }
                        }, function() {
                            if (debug) {
                                console.log("Error destroying media controls")
                            }
                        });
                        addControls(file, secret, title, author, podcover, feed, feedtitle);
                    }
                } else {
                    addEventListener('touchstart', function (e) {
                        player.play();
                        playing = true;
                        if (device.platform !== "browser") {
                            MusicControls.destroy(function() {
                                if (debug) {
                                    console.log("Media controls destroyed")
                                }
                            }, function() {
                                if (debug) {
                                    console.log("Error destroying media controls")
                                }
                            });
                            addControls(file, secret, title, author, podcover, feed, feedtitle);
                        }
                    });
                }
            });
            if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "false") {
                window.setInterval(function() {
                    $.get(backend+"/api/v1/setpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("secret")+"/"+player.currentTime+"/"+localStorage.getItem("instance"), function(data) { });
                }, 1000);
            } else {
                window.setInterval(function() {
                    localStorage.setItem("time-"+secret, player.currentTime);
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
    if (!plmax) {
        window.setTimeout(function() {
            anime({
                targets: "#player__controls",
                height: 166,
                duration: 500,
                autoplay: true
            });
        }, 500);
    }
}

window.setInterval(function() {
    var player = document.getElementById("player");
    if (!player.paused) {
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
        $("#bplay").attr("class", "playbutton ion-md-pause");
        playing = true;
    } else {
        $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
        $("#bplay").attr("class", "playbutton ion-md-play");
        playing = false;
    }
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
            elapsed = player.currentTime;
            if (device.platform !== "browser") {
                MusicControls.updateElapsed({
                    elapsed: elapsed, // seconds
                    isPlaying: true
                });
            }
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
            duration = player.duration;
        }
    }, 100);
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
    anime({
        targets: "#player__controls",
        height: 0,
        duration: 500,
        autoplay: true
    });
    window.setTimeout(function() {
        $("#player__controls").hide();
    }, 510);
    $("body").removeAttr("style");
    if (device.platform !== "browser") {
        MusicControls.destroy(function() {
            if (debug) {
                console.log("Media controls destroyed")
            }
        }, function() {
            if (debug) {
                console.log("Error destroying media controls")
            }
        });
    }
    $("#player").attr("src", "");
}

function plout() {
    anime({
        targets: "#player__controls",
        height: 166,
        duration: 500,
        autoplay: true
    });
    anime({
        targets: "#img__cast2",
        width: 64,
        height: 64,
        duration: 500,
        autoplay: true
    });
    plmax = false;
    $(".plchangesize").attr("class", "ion-ios-arrow-up plchangesize");
    $("#plcontrols").attr("css", "margin-left: 60px;");
    $("#img__cast2").attr("style", "");
}

function plin() {
    anime({
        targets: "#player__controls",
        height: $(window).height() - 103,
        duration: 500,
        autoplay: true
    });
    anime({
        targets: "#img__cast2",
        width: 330,
        height: 330,
        duration: 500,
        autoplay: true
    });
    $("#img__cast2").attr("style", "margin-left: auto; margin-right: auto; display: block; float: none; margin-top: 20px;");
    $(".plchangesize").attr("class", "ion-ios-arrow-down plchangesize");
    plmax = true;
}

function plchangesize() {
    if (!plmax) {
        plin();
    } else {
        plout();
    }
}

document.addEventListener("deviceready", onDeviceReady, false);