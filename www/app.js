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
var loading = false;

// Thanks to https://stackoverflow.com/questions/9979415/dynamically-load-and-unload-stylesheets
function loadjscssfile(filename, filetype){
    if (filetype === "js") {
        var fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
    } else if (filetype === "css") {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
    }
    if (typeof fileref!="undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function removejscssfile(filename, filetype){
    var targetelement = (filetype=="js")? "script" : (filetype=="css")? "link" : "none";
    var targetattr = (filetype=="js")? "src" : (filetype=="css")? "href" : "none";
    var allsuspects = document.getElementsByTagName(targetelement);
    for (var i=allsuspects.length; i>=0; i--) {
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1) {
            allsuspects[i].parentNode.removeChild(allsuspects[i]);
        }
    }
}

$(document).ready(function() {
    if (localStorage.getItem("darkmode") === "true") {
        loadjscssfile("dark.css", "css");
        $("#logo__nav").attr("src", "logo_dark.png");
    }
    var timeout = 1200;
    $("#logo__intro").attr("src", "loading2.svg");
    $("#view__cast").hide();
    $("#view__search").hide();
    $("#view_settings").hide();
    $("#view__main").hide();
    window.setInterval(function() {
        if (!$("#view__"+findGetParameter("view")).is(":visible")) {
            $("#logo__intro").show();
            loading = true;
        } else {
            $("#logo__intro").hide();
            loading = false;
        }
    }, 200)
    $("#player__controls").hide();
    $.get(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
        if (localStorage.getItem("uuid") !== "dummy") {
            if (data["login"] !== "ok" && data["uuid"] !== localStorage.getItem("uuid")) {
                localStorage.clear();
                localStorage.setItem("uuid", "dummy");
                location.reload();
            }
        }
    })
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
        $("#view__addfeed").hide();
        $("#snclose").hide();
        if (findGetParameter("view") === "settings") {
            $("#view__main").hide();
            $("#view__cast").hide();
            $("#view__search").hide();
            $(".fa__nav").hide();
            $(".fa__nav2").hide();
            $(".addfeed").hide();
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
                }).error(function() {
                    $("#button__follow").hide();
                    $("#button__unfollow").hide();
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
                            $.get(backend+"/api/v1/getprimarycolor?url="+callback.feed.image.href, function(color) {
                                if (localStorage.getItem("darkmode") === "true") {
                                    $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#191919);");
                                } else {
                                    $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                                }
                            });
                            $("#view__cast").show();
                        },200);
                        try {
                            var feedtitle = callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                        } catch(e) {
                            var feedtitle = callback.feed.title;
                        }
                        try {
                            feedtitle = feedtitle.split(" (")[0];
                        } catch (e) {}
                        try {
                            $("#text__cast").html(twemoji.parse(feedtitle));
                        } catch (e) {
                            $("#text__cast").html(feedtitle);
                        }
                        if (callback.feed.subtitle === undefined || callback.feed.subtitle === "" || callback.feed.subtitle.includes("…")) {
                            $("#text__subtitle").hide();
                        } else {
                            var callbackarr = callback.feed.subtitle.split(" · ");
                            $("#text__subtitle").html("<br><br>"+callbackarr[callbackarr.length - 1]+"<br><br><br>");
                            $("#text__subtitle").show();
                        }
                        try {
                            var author = callback.feed.author.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                        } catch(e) {
                            var author = callback.feed.author;
                        }
                        if (callback.feed.author === undefined || author.includes("Tobias Ain")) {
                            author = "koyu.space";
                        }
                        $("#text__author").html(author);
                        try {
                            $("#text__description").html(callback.feed.summary_detail.value.replaceAll("\n", "<br />"));
                        } catch (e) {}
                        callback.entries.forEach(function(item) {
                            var secret = "";
                            try {
                                secret = item.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "").replace("@", "");
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
                                    podurl = el.href;
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
                            var itemtitle = item.title;
                            var hide = false;
                            if (itemtitle.includes("New status by ")) {
                                itemtitle = item.summary.replaceAll("<p>", "").replaceAll("</p>", "");
                                shownotes = item.summary_detail;
                                try {
                                    if (!item.links[1].type.includes("audio/")) {
                                        hide = true;
                                    }
                                } catch (e) {
                                    hide = true;
                                }
                            }
                            try {
                                if (localStorage.getItem("offline") === "true" && !localStorage.getItem("downloaded").includes(secret)) {
                                    hide = true;
                                }
                            } catch (e) {
                                if (localStorage.getItem("offline") === "true") {
                                    hide = true;
                                }
                            }
                            if (itemtitle === "") {
                                itemtitle = item.title;
                            }
                            if (!hide) {
                                if (findGetParameter("episode") !== null && findGetParameter("episode") === secret) {
                                    window.setTimeout(function() {
                                        playcast(podurl, secret, Base64.encode(itemtitle), Base64.encode(author), callback.feed.image.href, feed, Base64.encode(feedtitle));
                                        window.setTimeout(function() {
                                            if (playing && findGetParameter("time") !== null) {
                                                var player = document.getElementById("player");
                                                player.currentTime = Number(findGetParameter("time"));
                                            }
                                        }, 1500);
                                    }, 1500);
                                }
                                try {
                                    if (!localStorage.getItem("downloaded").includes(secret)) {
                                        $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+callback.feed.image.href+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline\" id=\"snbutton\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-download dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                    } else {
                                        $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+callback.feed.image.href+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline\" id=\"snbutton\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-done dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                    }
                                } catch (e) {
                                    $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+callback.feed.image.href+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline\" id=\"snbutton\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-download dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                }
                            }
                        });
                        if ($("#podtable tbody").html() === "") {
                            $("#podtable tbody").html("<div id=\"error__noepisodes\">No episodes available. Maybe the podcaster hasn't uploaded any or you haven't downloaded some to listen offline.</div>");
                        }
                        $("#button__follow").click(function() {
                            var feed = Base64.decode(findGetParameter("cast")).split("\n")[0];
                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                                var podlist = data["podlist"];
                                data["podlist"].split(",").forEach(function(element) {
                                    if (element !== feed) {
                                        $.post(backend+"/api/v1/setlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), {podlist: podlist+","+feed},function(data) {
                                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                                                localStorage.setItem("podlist", data["podlist"]);
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
                                                    localStorage.setItem("podlist", data["podlist"]);
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
            window.setInterval(function() {
                $("img").on("load", function() {
                    $("#view__"+findGetParameter("view")).show();
                });
            },1);
            $.get("views/searchview.html", function(data) {
                $("#view__search").html(data);
                $("#text__query").html(findGetParameter("q"));
                $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+findGetParameter("q"), function(data) {
                    data["results"].forEach(function(item) {
                        $("#searchtable tbody").append("<tr><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\"><img src=\""+item.artworkUrl100+"\" class=\"card__small\"></a></td><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\" style=\"color:#333;\">"+twemoji.parse(item.collectionName)+"</a></td></tr>");
                    });
                    if (data["resultCount"] === 0) {
                        $("#searchtable").html("<p id=\"object__noresults\"><b id=\"error__noresults\">No results found.</b></p>");
                        $("#view__"+findGetParameter("view")).show();
                    }
                });
            });
        } 
        if (findGetParameter("view") === "addfeed") {
            $("#addfeed__rss").val("");
            $("#view__addfeed").show();
            $("#addfeed__rss").keypress(function(e) {
                if (e.which === 13) {
                    location.href = "app.html#view=cast&cast="+Base64.encode($("#addfeed__rss").val());
                    window.setTimeout(function() {
                        loadview();
                    }, 200);
                    return false;
                }
            });
            $("#addfeed__submit").click(function() {
                location.href = "app.html#view=cast&cast="+Base64.encode($("#addfeed__rss").val());
                window.setTimeout(function() {
                    loadview();
                }, 200);
            });
        }
        if (findGetParameter("view") === "main") {
            $.get("views/mainview.html", function(data) {
                localStorage.setItem("offline", "false");
                $("#view__main").html(data);
                if (localStorage.getItem("offline") !== "true") {
                    $("#offline__message").hide();
                } else {
                    $("#offline__message").show();
                }
                window.setTimeout(function() {
                    $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                        if (data["login"] === "error") {
                            $("#section__list").hide();
                            $("#text__list").hide();
                            $("#view__main").show();
                        } else {
                            if (data["podlist"] === "None" ) {
                                $("#section__list").html("<br /><br /><p style=\"text-align:center;width:60%;margin:0 auto;\" id=\"error__nocasts\">There are no podcasts in your list.</p><br /><br />")
                                window.setTimeout(function() {
                                    $("#view__main").show();
                                    $(".fa__nav").show();
                                    $(".fa__nav2").show();
                                    $(".addfeed").show();
                                }, 622*3);
                                localStorage.setItem("podlist", data["podlist"]);
                            } else {
                                if (debug) {
                                    console.log(timeout);
                                }
                                var podlist = "";
                                if (localStorage.getItem("podlist") !== "None" && localStorage.getItem("podlist") !== null && localStorage.getItem("offline") === "false") {
                                    podlist = localStorage.getItem("podlist");
                                } else {
                                    podlist = data["podlist"];
                                    localStorage.setItem("podlist", data["podlist"]);
                                }
                                window.setTimeout(function() {
                                    $("#view__main").show();
                                    $(".fa__nav").show();
                                    $(".fa__nav2").show();
                                    $(".addfeed").show();
                                }, timeout);
                                $("#section__list").html($("#section__list").html()+"<p>");
                                podlist.split(",").forEach(function(feed) {
                                    $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                        try {
                                            var secret = "";
                                            try {
                                                secret = callback.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "").replace("@", "");
                                            } catch (e) {}
                                            if (secret === "") {
                                                secret = Base64.encode(feed).replaceAll("==", "");
                                            }
                                            var summary = "";
                                            if (callback.feed.summary !== undefined) {
                                                summary = callback.feed.summary;
                                            }
                                            $("#section__list").html($("#section__list").html()+"<div class=\"item\" id=\"itemcard-"+secret+"\"><div class=\"item-head\"><a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" id=\"item-card-"+secret+"\" /></a><br><b>"+callback.feed.title+"</b></div><br><p>"+summary+"</p></div>");
                                            $.get(backend+"/api/v1/getprimarycolor?url="+callback.feed.image.href, function(color) {
                                                if (Number(color.split(",")[0]) > 128) {
                                                    $("#itemcard-"+secret).attr("style", "color:#333; background:rgb("+color+");");
                                                } else {
                                                    $("#itemcard-"+secret).css('background-color', 'rgb('+color+')');
                                                }
                                            });
                                        } catch (e) {}
                                    });
                                });
                                $("#section__list").html($("#section__list").html()+"</p>");
                            }
                        }
                    }).error(function() {
                        $("#offline__message").show();
                        localStorage.setItem("offline", "true")
                        $("#view__main").show();
                        if (localStorage.getItem("podlist")) {
                            podlist = localStorage.getItem("podlist");
                        } else {
                            podlist = data["podlist"];
                        }
                        $("#section__list").html($("#section__list").html()+"<p>");
                        podlist.split(",").forEach(function(feed) {
                            $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                try {
                                    $("#section__list").html($("#section__list").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" /></a>");
                                } catch (e) {}
                            });
                        });
                        $("#section__list").html($("#section__list").html()+"</p>");
                    });
                    window.setTimeout(function() {
                        $.get(backend+"/api/v1/getoriginals/"+localStorage.getItem("lang"), function(data) {
                            if (data["podlist"] !== "") {
                                $("#section__originals").html($("#section__originals").html()+"<p>");
                                data["podlist"].split(",").forEach(function(feed) {
                                    $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                        $("#section__originals").html($("#section__originals").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__smaller\" /></a>");
                                    });
                                });
                                $("#section__originals").html($("#section__originals").html()+"</p>");
                            } else {
                                $("#section__originals").hide();
                                $("#text__originals").hide();
                            }
                        }).error(function() {
                            $("#section__originals").hide();
                            $("#text__originals").hide();
                        });
    
                        $.get(backend+"/api/v1/getfeatured/"+localStorage.getItem("lang"), function(data) {
                            data.forEach(function(item) {
                                $("#section__featured").html($("#section__featured").html()+"<div><a class=\"cardlink\" data-cast=\""+Base64.encode(item[1])+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" id=\"featured-"+Base64.encode(item[1]).replaceAll("=", "")+"\"/></a></div>");
                                $.get(backend+"/api/v1/getprimarycolor?url="+backend+"/api/v1/getbanner/"+item[0], function(color) {
                                    $("#featured-"+Base64.encode(item[1]).replaceAll("=", "")).attr("box-shadow: 0px 0px 13px 2px rgba('+color+',0.75);");
                                });
                            });
                            if (data === "") {
                                $("#section__originals").hide();
                                $("#text__originals").hide();
                            }
                        }).error(function() {
                            $("#section__featured").hide();
                            $("#text__featured").hide();
                        });
                    }, 500);

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
            $(".addfeed").show();
            location.href = "app.html#view=main";
            loadview();
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
            StatusBar.backgroundColorByHexString("#fff");
            StatusBar.styleDefault();
            try {
                removejscssfile("dark.css", "css");
            } catch (e) {}
        } else {
            localStorage.setItem("darkmode", "true");
            $("#cdark__mode").attr("checked", "");
            $("#starwars").attr("src", "clonetrooper.png");
            StatusBar.backgroundColorByHexString("#191919");
            StatusBar.styleLightContent();
            loadjscssfile("dark.css", "css");
        }
        if (localStorage.getItem("darkmode") === "true") {
            $("#logo__nav").attr("src", "logo_dark.png?v="+new Date().getMilliseconds());
            $("#cdark__mode").attr("checked", "");
            StatusBar.backgroundColorByHexString("#191919");
            StatusBar.styleLightContent();
        }
        if (localStorage.getItem("darkmode") === "false") {
            $("#logo__nav").attr("src", "logo.png?v="+new Date().getMilliseconds());
            $("#cdark__mode").removeAttr("checked");
            StatusBar.backgroundColorByHexString("#fff");
            StatusBar.styleDefault();
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

    $(".addfeed").click(function() {
        if (!loading) {
            location.href = "app.html#view=addfeed";
            loadview();
        }
    });

    window.setInterval(function() {
        if (kicker === true) {
            kicker = false;
            loadview();
        }
    }, 20);

    $("#nav").show();

    window.setInterval(function() {
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
                $("#text__loading").html("Lädt...");
                $("#text__addfeed").html("RSS-Feed hinzufügen");
                $("#feed__summary").html("Von hier kannst du RSS-Feeds manuell in die App reinladen.");
                $("#addfeed__rss").attr("placeholder", "RSS-Feed");
                $("#addfeed__submit").html("RSS-Feed hinzufügen");
                $(".msg-download").html("Herunterladen");
                $("#text__originals").html("In Eigenproduktion");
                $("#offline__message").html("Du bist offline. Unten findest du eine Liste von Podcasts denen du aktuell folgst. Möglicherweise hast du ein paar von denen bereits heruntergeladen.")
                window.setTimeout(function() {
                    $("#text__results").html("Suchergebnisse für");
                    $("#error__nocasts").html("Es befinden sich keine Podcasts in deiner Liste.");
                    $("#error__nocast").html("Dieser Podcast ist nicht verfügbar");
                    $("#error__noresults").html("Keine Suchergebnisse.");
                    $("#error__noepisodes").html("Keine Episoden gefunden. Vielleicht hat der Podcaster keine Episoden bis jetzt hochgeladen oder du bist offline und hast keine heruntergeladen.");
                }, 600);
            } else {
                localStorage.setItem("lang", "ca");
            }
        });
    }, 500);
});

$(document).on('click', 'a[href^="http"]', function (e) {
    var url = $(this).attr('href');
    window.open(url, '_system', true);
    e.preventDefault();
});

function onDeviceReady() {
    if (localStorage.getItem("darkmode") === "true") {
        StatusBar.backgroundColorByHexString("#191919");
        StatusBar.styleLightContent();
    }
    document.addEventListener("backbutton", onBackKeyDown, false);
}

function onBackKeyDown() {
    if (!loading) {
        $("#view__cast").hide();
        $("#view__search").hide();
        $("#view_settings").hide();
        $("#view__main").hide();
        $(".fa__nav").show();
        $(".fa__nav2").show();
        $(".addfeed").show();
        location.href = "app.html#view=main";
        kicker = true;
    }
}

document.addEventListener("deviceready", onDeviceReady, false);