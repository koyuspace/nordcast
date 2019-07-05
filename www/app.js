$(document).ready(function() {
    $("#player__controls").hide();
    function findGetParameter(parameterName) {
        var result = null;
        if (window.location.href.includes(parameterName)) {
            result = decodeURIComponent(window.location.href.split("=")[1]);
        } else {
            result = false;
        }
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
    loadview();
    function loadview() {
        $("#snclose").hide();
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
        }, 900);
        if (findGetParameter("cast")) {
            $("#logo__intro").hide();
            $("#view__settings").hide();
            $("#nav").show();
            var feed = findGetParameter("cast");
            $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/pod", function(data) {
                $("#view__main").html(data);
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
                        $("#img__cast2").attr("src", callback.feed.image.href);
                        $("#img__cast").primaryColor({
                            callback: function(color) {
                                $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                            }
                        });
                        $("#text__cast").html(twemoji.parse(callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0]));
                        $("#text__subtitle").html(callback.feed.subtitle);
                        $("#text__author").html(callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0]);
                        $("#text__description").html(callback.feed.summary_detail.value.replaceAll("\n", "<br />"));
                        callback.entries.forEach(function(item) {
                            var secret = "";
                            secret = item.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "");
                            var podurl = "";
                            item.links.forEach(function(el) {
                                if (el.type.includes("audio")) {
                                podurl = el.href;
                                }
                            });
                            var shownotes = "";
                            item.content.forEach(function(el) {
                                if (el.type === "text/html") {
                                    shownotes = el.value;
                                }
                            });
                            $("#podtable tbody").append("<tr><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+item.title.replaceAll("'", "")+"', '"+callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0]+"', '"+callback.feed.image.href+"', '"+feed+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(item.title)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline\" id=\"snbutton\"></i></a></td></tr>");
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
            $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/search", function(data) {
                $("#view__main").html(data);
                $("#text__query").html(findGetParameter("search"));
                $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+findGetParameter("search"), function(data) {
                    data["results"].forEach(function(item) {
                        $("#searchtable tbody").append("<tr><td><a onclick=\"rl()\" href=\"app.html#cast="+item.feedUrl+"\"><img src=\""+item.artworkUrl100+"\" class=\"card__small\"></a></td><td><a onclick=\"rl()\" href=\"app.html#cast="+item.feedUrl+"\" style=\"color:#333;\">"+twemoji.parse(item.collectionName)+"</a></td></tr>");
                    });
                });
            });
        } else {
            $("#view__main").css("padding-top", "90px");
            $("#view__settings").hide();
            $.get(backend+"/api/v1/getview/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/main", function(data) {
                $("#view__main").html(data);
                window.setTimeout(function() {
                    $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                        if (data["podlist"] === "None") {
                            $("#section__list").html("<br /><br /><p style=\"text-align:center;width:60%;margin:0 auto;\" id=\"error__nocasts\">There are no podcasts in your list.</p><br /><br />")
                        } else {
                            $("#section__list").html($("#section__list").html()+"<p>");
                            data["podlist"].split(",").forEach(function(feed) {
                                $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                    $("#section__list").html($("#section__list").html()+"<a onclick=\"rl()\" href=\"app.html#cast="+callback.href+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" /></a>");
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
                                    $("#section__originals").html($("#section__originals").html()+"<a onclick=\"rl()\" href=\"app.html#cast="+callback.href+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__smaller\" /></a>");
                                });
                            });
                            $("#section__originals").html($("#section__originals").html()+"</p>");
                        }
                    });

                    $.get(backend+"/api/v1/getfeatured", function(data) {
                        data.forEach(function(item) {
                            $("#section__featured").html($("#section__featured").html()+"<div><a onclick=\"rl()\" href=\"app.html#cast="+item[1]+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" /></a></div>");
                            $(".card__big").primaryColor({
                                callback: function(color) {
                                    $(this).css('box-shadow', '0px 0px 13px 2px rgba('+color+',0.75)');
                                }
                            });
                        });
                    });

                    $.get(backend+"/api/v1/getname/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid"), function(data) {
                        $(".placeholder__username").html(data["ksname"]);
                        var ksemojis = data["ksemojis"];
                        if (debug) {
                            console.log(data["ksemojis"]);
                        }
                        ksemojis.forEach(function(emoji) {
                            $(".placeholder__username").html($(".placeholder__username").html().replaceAll(":" + emoji["shortcode"] + ":", "<img src=\"" + emoji["url"] + "\" height=\"16\">"));
                        });
                        $(".placeholder__username").html(twemoji.parse($(".placeholder__username").html()));
                    }).error(function() {
                        $("#text__username").hide();
                    });
                }, 50);
            });
        }
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
            $("#view__main").css("margin-top", "90px");
            $("#shownotes").css("margin-top", "90px");
        } else {
            $("#wrapper__search").hide();
            searchtoggle = false;
            $("#view__main").css("margin-top", "0px");
            $("#shownotes").css("margin-top", "0px");
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
                                    location.href = "app.html#cast="+el["feedUrl"];
                                    window.setTimeout(function() {
                                        location.reload();
                                    }, 50)
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
          location.href = "app.html#search="+$("#qq").val();
          loadview();
          return false;
        }
    });

    $("#logo__nav").click(function() {
        if ($("#view__settings").is(":visible")) {
            $("#view__settings").hide();
            $("#view__main").show();
            $(".fa__nav").show();
            $(".fa__nav2").show();
        } else {
            location.href = "app.html#nosplash=ok";
            loadview();
        }
    });

    $("#link__cast").click(function() {
        window.setTimeout(function() {
            loadview();
            window.setTimeout(function() {
                if (playing) {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-pause");
                } else {
                    $("#cast-"+localStorage.getItem("secret")).attr("class", "playbutton ion-md-play");
                }
            }, 1700);
        }, 500);
    });

    $("#logout").click(function() {
        localStorage.clear()
        window.setTimeout(function() {
            location.href = "index.html";
        }, 200);
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

    $("#snclose").click(function() {
        $("#snclose").hide();
        restoreview();
        if ($("#player__controls").is(":visible")) {
            $("#view__main").attr("style", "margin-bottom: 135px !important; padding-top: 60px;");
        }
    });

    $("#logo__intro").hide();
    $("#view__main").show();
    $("#nav").show();
});

$(document).on('click', 'a[href^="http"]', function (e) {
    var url = $(this).attr('href');
    window.open(url, '_system', true);
    e.preventDefault();
});