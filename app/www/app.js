$(document).ready(function() {
    function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        location.search
            .substr(1)
            .split("&")
            .forEach(function (item) {
              tmp = item.split("=");
              if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
            });
        return result;
    }
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
        if (data["login"] !== "ok" && data["uuid"] !== localStorage.getItem("uuid")) {
            localStorage.clear();
            window.setTimeout(function() {
                location.href = "index.html";
            }, 200);
        }
    }).error(function() {
        localStorage.clear();
        window.setTimeout(function() {
            location.href = "index.html";
        }, 200);
    });
    var searchtoggle = false;
    $("#wrapper__search").hide();
    $("#profile__picture").hide();
    $("#player").hide();
    if (findGetParameter("cast")) {
        $("#logo__intro").hide();
        $("#view__settings").hide();
        $("#nav").show();
        var feed = findGetParameter("cast");
        $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/pod", function(data) {
            $("#view__main").html(data);
            $("#logo__nav").click(function() {
                location.href = "app.html?nosplash=ok";
            });
            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                if (data["podlist"].includes(feed)) {
                    $("#button__follow").hide();
                    $("#button__unfollow").show();
                } else {
                    $("#button__unfollow").hide();
                    $("#button__follow").show();
                }
            });
            window.setTimeout(function() {
                $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                    if (debug) {
                        console.log(callback);
                    }
                    $("#img__cast").attr("src", callback.feed.image.href);
                    $("#img__cast").primaryColor({
                        callback: function(color) {
                            $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                        }
                    });
                    $("#text__cast").html(twemoji.parse(callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0]));
                    $("#text__subtitle").html(callback.feed.subtitle);
                    $("#text__author").html(callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0]);
                    $("#text__description").html(callback.feed.summary.replaceAll("\n", "<br />"));
                    callback.entries.forEach(function(item) {
                        var secret = "";
                        secret = item.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-");
                        var podurl = "";
                        item.links.forEach(function(el) {
                            if (el.type.includes("audio")) {
                              podurl = el.href;
                            }
                        });
                        $("#podtable tbody").append("<tr><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+item.title.replaceAll("'", "")+"', '"+callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0]+"', '"+callback.feed.image.href+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(item.title)+"</td></tr>");
                    });
                    $("#button__follow").click(function() {
                        $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                            var podlist = data["podlist"];
                            data["podlist"].split(",").forEach(function(element) {
                                if (element !== feed) {
                                    $.post(backend+"/api/v1/setlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), {podlist: podlist+","+feed},function(data) {
                                        $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                                            data["podlist"].split(",").forEach(function(item) {
                                                if (data["podlist"].includes(feed)) {
                                                    $("#button__follow").hide();
                                                    $("#button__unfollow").show();
                                                } else {
                                                    $("#button__unfollow").hide();
                                                    $("#button__follow").show();
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                    $("#button__unfollow").click(function() {
                        $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                            var podlist = data["podlist"];
                            podlist.split(",").forEach(function(element) {
                                if (element === feed) {
                                    var pl = podlist.replaceAll(","+feed, "").replaceAll(feed, "");
                                    $.post(backend+"/api/v1/setlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), {podlist: pl}, function(data) {
                                        if (data["action"] === "success") {
                                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                                                data["podlist"].split(",").forEach(function(item) {
                                                    if (data["podlist"].includes(feed)) {
                                                        $("#button__follow").hide();
                                                        $("#button__unfollow").show();
                                                    } else {
                                                        $("#button__unfollow").hide();
                                                        $("#button__follow").show();
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                }).error(function() {
                        $("#view__main").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                });
            }, 500);
            $("#view__main").css("padding-top", "60px");
        });
    } else if(findGetParameter("search")) {
        $("#view__main").css("padding-top", "60px");
        $("#view__main").hide();
        $("#view__settings").hide();
        $("#nav").hide();
        $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/search", function(data) {
            $("#view__main").html(data);
            $("#text__query").html(findGetParameter("search"));
            $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+findGetParameter("search"), function(data) {
                data["results"].forEach(function(item) {
                    $("#searchtable tbody").append("<tr><td><a href=\"app.html?cast="+item.feedUrl+"\"><img src=\""+item.artworkUrl100+"\" class=\"card__small\"></a></td><td><a href=\"app.html?cast="+item.feedUrl+"\" style=\"color:#333;\">"+twemoji.parse(item.collectionName)+"</a></td></tr>");
                });
            });
        });
    } else {
        if (findGetParameter("nosplash") === "ok") {
            $("#logo__intro").hide();
        }
        $("#view__main").css("padding-top", "90px");
        $("#view__main").hide();
        $("#view__settings").hide();
        $("#nav").hide();
        $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/main", function(data) {
            $("#view__main").html(data);
            window.setTimeout(function() {
                $("#logout").click(function() {
                    localStorage.clear()
                    window.setTimeout(function() {
                        location.href = "index.html";
                    }, 200);
                });
                $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                    if (data["podlist"] === "None") {
                        $("#section__list").html("<br /><br /><p style=\"text-align:center;width:60%;margin:0 auto;\" id=\"error__nocasts\">There are no podcasts in your list.</p><br /><br />")
                    } else {
                        $("#section__list").html($("#section__list").html()+"<p>");
                        data["podlist"].split(",").forEach(function(feed) {
                            $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                $("#section__list").html($("#section__list").html()+"<a href=\"app.html?cast="+callback.href+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" /></a>");
                            });
                        });
                        $("#section__list").html($("#section__list").html()+"</p>");
                    }
                });
                $.get(backend+"/api/v1/getoriginals", function(data) {
                    if (data["podlist"] !== "") {
                        $("#section__originals").html($("#section__originals").html()+"<p>");
                        data["podlist"].split(",").forEach(function(feed) {
                            $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                $("#section__originals").html($("#section__originals").html()+"<a href=\"app.html?cast="+callback.href+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__smaller\" /></a>");
                            });
                        });
                        $("#section__originals").html($("#section__originals").html()+"</p>");
                    }
                });

                $.get(backend+"/api/v1/getfeatured", function(data) {
                    data.forEach(function(item) {
                        $("#section__featured").html($("#section__featured").html()+"<div><a href=\"app.html?cast="+item[1]+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" /></a></div>");
                        $(".card__big").primaryColor({
                            callback: function(color) {
                                $(this).css('box-shadow', '0px 0px 13px 2px rgba('+color+',0.75)');
                            }
                        });
                    });
                });

                $.get(backend+"/api/v1/getname/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                    $(".placeholder__username").html(data["ksname"]);
                    $.get(backend+"/api/v1/getemoji/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                        var ksemoji = data["ksemoji"];
                        ksemoji.forEach(function(emoji) {
                            $(".placeholder__username").html($(".placeholder__username").html().replaceAll(":" + emoji["shortcode"] + ":", "<img src=\"" + emoji["url"] + "\" height=\"16\">"));
                        });
                    });
                    $(".placeholder__username").html(twemoji.parse($(".placeholder__username").html()));
                }).error(function() {
                    $("#text__username").hide();
                });
            }, 800);
        });
    }

    $.get(backend+"/api/v1/getpic/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
        $("#profile__picture").attr("src", data["kspic"]);
        $("#profile__picture").show();
    }).error(function() {
        $("#profile__picture").hide();
    });

    $(".fa__nav2").click(function() {
        if (searchtoggle === false) {
            $("#wrapper__search").show();
            searchtoggle = true;
            $("#view__main").css("padding-top", "165px");
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
    $("#qq").keydown(function() {
        function qq() {
            $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+$("#qq").val(), function(data) {
                var results = [];
                data["results"].forEach(function(el) {
                    results.push(el["collectionName"]);
                });
                $("#qq").autocomplete({
                    source: results,
                    select: function() {
                        setTimeout(function() {
                            data["results"].forEach(function(el) {
                                if (el["collectionName"] == $("#qq").val()) {
                                    location.href = "app.html?cast="+el["feedUrl"];
                                }
                            });
                        }, 50);
                    }
                });
            });
        }
        $("#qq").keydown(qq());
    });
    $("#qq").keypress(function (e) {
        if (e.which === 13) {
          location.href = "app.html?search="+$("#qq").val();
          return false;
        }
    });
    var jumper = document.getElementsByName("a");
    jumper.onclick = function(event) {
        var e = event || window.event ;
        if(e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = true ;
        }
        location.replace(this.href);
        jumper = null;
    }
    $("#logo__intro").hide();
    $("#view__main").show();
    $("#nav").show();
});

document.addEventListener("deviceready", onDeviceReady, false);
//Cordova-specific code
function onDeviceReady() {
    if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#fff");
    }
    window.setTimeout(function() {
        navigator.globalization.getPreferredLanguage(function (language) {
            //German
            if (language.value.includes("de")) {
                localStorage.setItem("lang", "de");
                $("#text__featured").html("Angesagt");
                $("#text__list").html("Deine Liste");
                $("#text__hello").html("Hallo");
                $("#text__by").html("von");
                $("#logout").html("Abmelden");
                $("#view__settings h1").html("Einstellungen");
                $("#qq").attr("placeholder", "Suchbegriff");
                $("#button__follow").html("Folgen");
                $("#button__unfollow").html("Entfolgen");
                window.setTimeout(function() {
                    $("#text__results").html("Suchergebnisse für");
                    $("#error__nocasts").html("Es befinden sich keine Podcasts in deiner Liste.");
                    $("#error__nocast").html("Dieser Podcast ist nicht verfügbar");
                }, 600);
            } else {
                localStorage.setItem("lang", "ca");
            }
        });
    }, 1200);
}