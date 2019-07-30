function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    window.location.href
        .split("#")[1]
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

var kicker = false;

$(document).ready(function() {
    if (localStorage.getItem("darkmode") === "true") {
        $("head").append("<link rel=\"stylesheet\" href=\"dark.css\">");
        $("#logo__nav").attr("src", "logo_dark.png");
    }
    var loading = false;
    var timeout = 1200;
    $("#logo__intro").attr("src", "loading2.svg");
    window.setInterval(function() {
        if (!$("#view__"+findGetParameter("view")).is(":visible")) {
            $("#logo__intro").show();
            loading = true;
        } else {
            $("#logo__intro").hide();
            loading = false;
        }
    }, 10)
    $("#player__controls").hide();
    $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
        if (localStorage.getItem("uuid") !== "dummy") {
            if (data["login"] !== "ok" && data["uuid"] !== localStorage.getItem("uuid")) {
                localStorage.clear();
                localStorage.setItem("uuid", "dummy");
                location.reload();
            }
        }
    }).error(function() {
        if (localStorage.getItem("uuid") !== "dummy") {
            localStorage.clear();
            window.setTimeout(function() {
                location.href = "index.html";
            }, 200);
        }
    });
    var searchtoggle = false;
    $("#wrapper__search").hide();
    $("#profile__picture").hide();
    $("#player").hide();
    loadview();
    function loadview() {
        $("#view__search").hide();
        $("#view__cast").hide();
        $("#view__settings").hide();
        $("#view__main").hide();
        $("#snclose").hide();
        if (findGetParameter("view") === "settings") {
            $("#view__main").hide();
            $("#view__cast").hide();
            $("#view__search").hide();
            $(".fa__nav").hide();
            $(".fa__nav2").hide();
            $("#wrapper__search").hide();
            searchtoggle = false;
            $("#view__settings").show();
            if (localStorage.getItem("darkmode") === "true") {
                $("#cdark__mode").attr("checked", "");
                $("#starwars").attr("src", "clonetrooper.png");
            } else {
                $("#cdark__mode").removeAttr("checked");
                $("#starwars").attr("src", "darth.png");
            }
        }
        if (findGetParameter("view") === "cast") {
            $("#nav").show();
            try {
                var feed = Base64.decode(findGetParameter("cast")).replace("\n", "");
                if (debug) {
                    console.log(feed);
                }
            } catch (e) {
                $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
            }
            $.get("views/podview.html", function(data) {
                $("#view__cast").html(data);
                $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                    if (data["login"] === "error") {
                        $("#button__follow").hide();
                        $("#button__unfollow").hide();
                    } else {
                        if (data["podlist"].includes(feed)) {
                            $("#button__follow").hide();
                            $("#button__unfollow").show();
                        } else {
                            $("#button__unfollow").hide();
                            $("#button__follow").show();
                        }
                    }
                });
                window.setTimeout(function() {
                    $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                        if (debug) {
                            console.log(callback);
                        }
                        try {
                            $("#img__cast").attr("src", callback.feed.image.href);
                        } catch (e) {
                            $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                            $("#view__cast").show();
                        }
                        window.setTimeout(function() {
                            $("#img__cast").primaryColor({
                                callback: function(color) {
                                    $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                                }
                            });
                            $("#view__cast").show();
                        },200);
                        var feedtitle = callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                        $("#text__cast").html(twemoji.parse(feedtitle));
                        if (callback.feed.subtitle === undefined || callback.feed.subtitle === "" || callback.feed.subtitle.includes("…")) {
                            $("#text__subtitle").hide();
                        } else {
                            $("#text__subtitle").html("<br><br>"+callback.feed.subtitle+"<br><br><br>");
                            $("#text__subtitle").show();
                        }
                        var author = callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                        if (author === "Nordisch Media Tobias Ain") {
                            author = "Nordisch Media";
                        }
                        $("#text__author").html(author);
                        try {
                            $("#text__description").html(callback.feed.summary_detail.value.replaceAll("\n", "<br />"));
                        } catch (e) {}
                        callback.entries.forEach(function(item) {
                            var secret = "";
                            try {
                                secret = item.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "");
                            } catch (e) {}
                            if (secret === "") {
                                secret = Base64.encode(item.link).replace("==", "");
                            }
                            var podurl = "";
                            item.links.forEach(function(el) {
                                if (el.type.includes("audio")) {
                                    podurl = el.href;
                                }
                                if (el.type.includes("video")) {
                                    $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                                }
                            });
                            var shownotes = "";
                            try {
                                item.content.forEach(function(el) {
                                    if (el.type === "text/html") {
                                        shownotes = el.value;
                                    }
                                });
                            } catch (e) {}
                            if (shownotes === "") {
                                shownotes = item.summary;
                            }
                            if (shownotes === "") {
                                shownotes = item.summary;
                            }
                            $("#podtable tbody").append("<tr><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(item.title.replaceAll("'", ""))+"', '"+callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0]+"', '"+callback.feed.image.href+"', '"+feed+"', '"+feedtitle+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(item.title)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline\" id=\"snbutton\"></i></a></td></tr>");
                        });
                        $("#button__follow").click(function() {
                            var feed = Base64.decode(findGetParameter("cast")).split("\n")[0];
                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                                var podlist = data["podlist"];
                                data["podlist"].split(",").forEach(function(element) {
                                    if (element !== feed) {
                                        $.post(backend+"/api/v1/setlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), {podlist: podlist+","+feed},function(data) {
                                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
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
                            var feed = Base64.decode(findGetParameter("cast")).split("\n")[0];
                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                                var podlist = data["podlist"];
                                podlist.split(",").forEach(function(element) {
                                    if (element === feed) {
                                        var pl = podlist.replaceAll(","+feed, "").replaceAll(feed, "");
                                        $.post(backend+"/api/v1/setlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), {podlist: pl}, function(data) {
                                            if (data["action"] === "success") {
                                                $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
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
                        $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                    });
                }, 700);
            });
        }
        if(findGetParameter("view") === "search") {
            $("#view__main").hide();
            $.get("views/searchview.html", function(data) {
                $("#view__search").html(data);
                $("#text__query").html(findGetParameter("q"));
                $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+findGetParameter("q"), function(data) {
                    data["results"].forEach(function(item) {
                        $("#searchtable tbody").append("<tr><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\"><img src=\""+item.artworkUrl100+"\" class=\"card__small\"></a></td><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\" style=\"color:#333;\">"+twemoji.parse(item.collectionName)+"</a></td></tr>");
                    });
                    if (data["resultCount"] === 0) {
                        $("#searchtable").html("<p id=\"object__noresults\"><b id=\"error__noresults\">No results found.</b></p>")
                    }
                    $("#view__search").show();
                });
            });
        } 
        if (findGetParameter("view") === "main") {
            $.get("views/mainview.html", function(data) {
                $("#view__main").html(data.replaceAll("<style>\n#view__main {\n  padding: 40px 20px 0px !important;\n}\n</style>", ""));
                window.setTimeout(function() {
                    $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                        if (data["login"] === "error") {
                            $("#section__list").hide();
                            $("#text__list").hide();
                            $("#view__main").show();
                        } else {
                            if (data["podlist"] === "None") {
                                $("#section__list").html("<br /><br /><p style=\"text-align:center;width:60%;margin:0 auto;\" id=\"error__nocasts\">There are no podcasts in your list.</p><br /><br />")
                                window.setTimeout(function() {
									$("#view__main").show();
								}, 622*3);
                            } else {
                                timeout = data["podlist"].split(",").length * 980;
                                if (debug) {
                                    console.log(timeout);
                                }
                                window.setTimeout(function() {
                                    $("#view__main").show();
                                }, timeout);
                                $("#section__list").html($("#section__list").html()+"<p>");
                                data["podlist"].split(",").forEach(function(feed) {
                                    $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                        try {
                                            $("#section__list").html($("#section__list").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" /></a>");
                                        } catch (e) {}
                                    });
                                });
                                $("#section__list").html($("#section__list").html()+"</p>");
                            }
                        }
                    });
                    $.get(backend+"/api/v1/getoriginals", function(data) {
                        if (data["podlist"] !== "") {
                            $("#section__originals").html($("#section__originals").html()+"<p>");
                            data["podlist"].split(",").forEach(function(feed) {
                                $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                    $("#section__originals").html($("#section__originals").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__smaller\" /></a>");
                                });
                            });
                            $("#section__originals").html($("#section__originals").html()+"</p>");
                        }
                    });

                    $.get(backend+"/api/v1/getfeatured", function(data) {
                        data.forEach(function(item) {
                            $("#section__featured").html($("#section__featured").html()+"<div><a class=\"cardlink\" data-cast=\""+Base64.encode(item[1])+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" /></a></div>");
                        });
                        window.setTimeout(function() {
                            $(".card__big").primaryColor({
                                callback: function(color) {
                                    $(this).css('box-shadow', '0px 0px 13px 2px rgba('+color+',0.75)');
                                }
                            });
                        },200);
                    });

                    $.get(backend+"/api/v1/getname/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                        if (data["login"] === "ok") {
							$(".placeholder__username").html(data["ksname"]);
							var ksemojis = data["ksemojis"];
							if (debug) {
								console.log(data["ksemojis"]);
							}
							ksemojis.forEach(function(emoji) {
								$(".placeholder__username").html($(".placeholder__username").html().replaceAll(":" + emoji["shortcode"] + ":", "<img src=\"" + emoji["url"] + "\" height=\"16\">"));
							});
							$(".placeholder__username").html(twemoji.parse($(".placeholder__username").html()));
						} else {
							$("#text__username").hide();
						}
                    }).error(function() {
                        $("#text__username").hide();
                    });
                }, 50);
            });
        }
    }

    $.get(backend+"/api/v1/getpic/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
        if (data["login"] === "ok") {
			$("#profile__picture").attr("src", data["kspic"]);
			$("#profile__picture").show();
		} else {
			$("#profile__picture").hide();
		}
    }).error(function() {
        $("#profile__picture").hide();
    });

    $(".fa__nav2").click(function() {
        if (searchtoggle === false) {
            $("#wrapper__search").show();
            searchtoggle = true;
            $("#shownotes").css("margin-top", "90px");
        } else {
            $("#wrapper__search").hide();
            searchtoggle = false;
            $("#shownotes").css("margin-top", "0px");
        }
    });
    $(".fa__nav").click(function() {
        location.href = "app.html#view=settings";
        loadview();
    });
    $("#qq").keyup(function() {
        $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+$("#qq").val(), function(data) {
            var results = [];
            data["results"].forEach(function(el) {
                results.push(el["collectionName"]);
            });
            $("#qq").autocomplete({
                source: results,
                select: function() {
                    data["results"].forEach(function(el) {
                        window.setTimeout(function() {
                            if (el["collectionName"] == $("#qq").val()) {
                                if (debug) {
                                    console.log(Base64.encode(el["feedUrl"]));
                                }
                                location.href = "app.html#view=cast&cast="+Base64.encode(el["feedUrl"]);
                                window.setTimeout(function() {
                                    $("#qq").val("");
                                    $("#wrapper__search").hide();
                                    $("#view__"+findGetParameter("view")).hide();
                                    loadview();
                                }, 200)
                            }
                        }, 50);
                    });
                }
            });
        });
    });
    $("#qq").keypress(function (e) {
        if (e.which === 13 && !loading) {
            $("#wrapper__search").hide();
            location.href = "app.html#view=search&q="+$("#qq").val();
            $("#qq").val("");
            loadview();
            return false;
        }
    });

    $("#logo__nav").click(function() {
        if (!loading) {
            $("#view__cast").hide();
            $("#view__search").hide();
            $("#view_settings").hide();
            $("#view__main").hide();
            $(".fa__nav").show();
            $(".fa__nav2").show();
            location.href = "app.html#view=main";
            loadview();
        }
    });

    $("#link__cast").click(function() {
        if (!loading) {
            window.setTimeout(function() {
                $("#view__main").hide();
                loadview();
            }, 500);
        }
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
            $("#view__cast").attr("style", "margin-bottom: 135px !important; padding-top: 60px;");
        }
    });

    $("#cdark__mode").click(function() {
        if (localStorage.getItem("darkmode") === "true") {
            localStorage.setItem("darkmode", "false");
            $("#cdark__mode").removeAttr("checked");
            $("#starwars").attr("src", "darth.png");
            try {
                $("head").html($("head").html().replace("<link rel=\"stylesheet\" href=\"dark.css\">", ""));
            } catch (e) {}
        } else {
            localStorage.setItem("darkmode", "true");
            $("#cdark__mode").attr("checked", "");
            $("#starwars").attr("src", "clonetrooper.png");
            $("head").append("<link rel=\"stylesheet\" href=\"dark.css\">");
        }
        if (localStorage.getItem("darkmode") === "true") {
            $("#logo__nav").attr("src", "logo_dark.png?v="+new Date().getMilliseconds());
            $("#cdark__mode").attr("checked", "");
        }
        if (localStorage.getItem("darkmode") === "false") {
            $("#logo__nav").attr("src", "logo.png?v="+new Date().getMilliseconds());
            $("#cdark__mode").removeAttr("checked");
        }
    });

    $(document).on("click", "a", function(e) {
        if ($(this).attr("data-cast") && !loading) {
            $("#view__main").hide();
            location.href = "app.html#view=cast&cast="+$(this).attr("data-cast");
            window.setTimeout(function() {
                loadview();
            }, 200);
        }
        e.preventDefault();
    });

    window.setInterval(function() {
        if (kicker === true) {
            kicker = false;
            loadview();
        }
    }, 20);

    $("#nav").show();

    window.setInterval(function() {
        if (!$("#view__"+findGetParameter("view")).is(":visible")) {
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
                    $("#text__session").html("Sitzung");
                    $("#text__darkmode").html("Dunklen Modus aktivieren");
                    $("#text__theme").html("Theme");
                    $("#text__about").html("Über");
                    $("#qq").attr("placeholder", "Suchbegriff");
                    $("#button__follow").html("Folgen");
                    $("#button__unfollow").html("Entfolgen");
                    window.setTimeout(function() {
                        $("#text__results").html("Suchergebnisse für");
                        $("#error__nocasts").html("Es befinden sich keine Podcasts in deiner Liste.");
                        $("#error__nocast").html("Dieser Podcast ist nicht verfügbar");
                        $("#error__noresults").html("Keine Suchergebnisse.");
                    }, 600);
                } else {
                    localStorage.setItem("lang", "ca");
                }
            });
        }
    }, 1);
});

$(document).on('click', 'a[href^="http"]', function (e) {
    var url = $(this).attr('href');
    window.open(url, '_system', true);
    e.preventDefault();
});