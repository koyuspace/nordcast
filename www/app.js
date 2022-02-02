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
function detectmob() { 
    if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    } else {
        return false;
    }
}
function stripHtml(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

var kicker = false;
var loading = false;
var firstload = true;
var isfaving = false;
var showallwasclicked = false;
var showall_warning = "Warning: Loading every episode on this podcast may freeze your device. Continue?";
var disableMediaControls = false;
var fload = true;
var enableLoader = true;

window.setTimeout(function() {
    fload = false;
}, 1000);

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

window.setInterval(function() {
    if (localStorage.getItem("offline") === "true") {
        location.href = "index.html#mode=offline";
    }
}, 3000);

function drr2() {
    $(document).ready(function() {
        window.setInterval(function() {
            $(".dlbutton").hide();
            if (localStorage.getItem("uuid") === "dummy") {
                $("#text__newforyou").hide();
                $("#section__newforyou").hide();
                $("#menubuttons > div:nth-child(2)").hide();
            }
            if ($("#section__newforyou").html() === "") {
                $("#text__newforyou").hide();
                $("#section__newforyou").hide(); 
            } else {
                $("#text__newforyou").show();
                $("#section__newforyou").show(); 
            }
            if (localStorage.getItem("offline") === "true") {
                $(".fa__nav2").hide();
                $(".addfeed").hide();
                $(".problemreporting").hide();
                $(".menubutton-notifications").hide();
            }
            if (!detectmob()) {
                $(".share").hide();
            } else {
                $(".share").show();
            }
            if (findGetParameter("view") === "main") {
                $("#view__yourlist").hide();
                $("#section__custom").show();
                $(".backbutton").attr("style", "visibility: hidden;");
                if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "false") {
                    $("#profile__picture").attr("style", "display: block; margin-left: 20px !important;");
                }
            } else {
                $(".bigscreen").hide();
                $("#section__custom").hide();
                if (findGetParameter("offline") === "false") {
                    $(".backbutton").attr("style", "");
                }
                if (findGetParameter("offline") === "true" && findGetParameter("view") !== "yourlist") {
                    $(".backbutton").attr("style", "");
                }
                if (localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "false") {
                    $(".backbutton").attr("style", "");
                    $("#profile__picture").attr("style", "");
                }
            }
            if (findGetParameter("view") !== "settings" && localStorage.getItem("uuid") !== "dummy" && localStorage.getItem("offline") === "false") {
                $(".fa__nav2").show();
                $(".addfeed").show();
                $(".problemreporting").show();
            }
            if (localStorage.getItem("offline") === null) {
                localStorage.setItem("offline", "false");
            }
            if (localStorage.getItem("darkmode") === null) {
                localStorage.setItem("darkmode", "false");
            }
        },0);
        $.get("views/settingsview.html", function(data) {
            $("#view__settings").html(data);
        });
        $(window).on('popstate',function(event) {
            $("#wrapper__search").hide();
            loadview();
            $("#view__report").hide();
            if (plmax) {
                plout();
                didmax = true;
            }
            if (findGetParameter("view") !== "settings") {
                if (localStorage.getItem("offline") === "true") {
                    $(".fa__nav").show();
                }
            }
            if (findGetParameter("view") !== "notifications") {
                $("#text__newforyou").hide();
                $("#section__newforyou").hide();
                $("#view__notifications").hide();
                $("#view__fullscreen").hide();
            }
            window.setTimeout(function() {
                if (localStorage.getItem("played") !== "true") {
                    if (!loading && findGetParameter("view") === "main") {
                        $("#view__main").attr("style", "padding: 40px 20px 0px !important;");
                    }
                }
            }, 1500);
        });
        if (localStorage.getItem("darkmode") === "true") {
            loadjscssfile("dark.css", "css");
            $("#logo__nav").attr("src", "logo_dark.png");
        }
        var reloaded = false;
        window.setInterval(function() {
                $.get(backend+"/getstatus?"+Date.now(), function(data) {
                    localStorage.setItem("offline", "false");
                    if (findGetParameter("view") !== "settings") {
                        if (localStorage.getItem("offline") === "false") {
                            $(".fa__nav").show();
                            $(".fa__nav2").show();
                            $(".addfeed").show();
                        }
                        if (localStorage.getItem("uuid") !== "dummy") {
                            $(".problemreporting").show();
                        }
                    }
                    $("#nav").attr("style", "border-bottom: 3px solid rgb(39, 176, 226);");
                    if (localStorage.getItem("uuid") !== "dummy") {
                        $(".menubutton-notifications").show();
                    }
                    if (reloaded) {
                        loadview();
                    }
                    reloaded = false;
                }).fail(function() {
                        if (localStorage.getItem("uuid") === "dummy") {
                            location.href = "index.html#mode=offline";
                        }
                        localStorage.setItem("offline", "true");
                        $(".fa__nav2").hide();
                        $(".addfeed").hide();
                        $(".problemreporting").hide();
                        $(".fav").hide();
                        $(".tootshare").hide();
                        $(".koyushare").hide();
                        $(".pod__favs").hide();
                        $("#nav").attr("style", "border-bottom: 3px solid red;");
                        if (!reloaded) {
                            loadview();
                            reloaded = true;
                        }
                });
        }, 1500);
        var timeout = 1200;
        $("#logo__intro").attr("src", "loading2.svg");
        $("#view__cast").hide();
        $("#view__search").hide();
        $("#view_settings").hide();
        $("#view__main").hide();
        var counter = 0;
        window.setInterval(function() {
            if (enableLoader) {
                if (!$("#view__"+findGetParameter("view")).is(":visible")) {
                    $("#logo__intro").show();
                    loading = true;
                } else {
                    $("#logo__intro").hide();
                    loading = false;
                }
            }
        }, 200)
        window.setInterval(function() {
            if (findGetParameter("view") !== "cast") {
                $("#view__cast").hide();
            }
            if (findGetParameter("view") !== "main" && findGetParameter("view") !== "yourlist") {
                $("#text__newforyou").hide();
                $("#section__newforyou").hide();
                $("#view__main").hide();
            }
            if (localStorage.getItem("uuid") === "dummy") {
                $(".menubutton-notifications").hide();
                $("#offline__message").hide();
            }
        });
        window.setInterval(function() {
            $.get(backend+"/api/v1/getnotifications/"+localStorage.getItem("lang"), function(data) {
                try {
                    if (localStorage.getItem("notifications") !== data && data.split("\n")[0] !== "") {
                        $(".notification-button").attr("class", "icon notification-button ion-md-mail badge1");
                    } else {
                        $(".notification-button").attr("class", "icon notification-button ion-md-mail");
                    }
                } catch (e) {
                    localStorage.setItem("notifications", data);
                }
            });
        }, 10000);
        $.getJSON(backend+"/api/v1/login2/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
            if (localStorage.getItem("uuid") !== "dummy") {
                if (data["login"] !== "ok") {
                    localStorage.clear();
                    localStorage.setItem("uuid", "dummy");
                    location.reload();
                }
            }
        })
        var searchtoggle = false;
        $("#wrapper__search").hide();
        $("#profile__picture").hide();
        loadview();
        function loadview() {
            $("#view__search").hide();
            $("#view__cast").hide();
            $("#view__settings").hide();
            $("#view__main").hide();
            $("#view__addfeed").hide();
            $("#view__notifications").hide();
            $("#view__fullscreen").hide();
            $("#view__report").hide();
            $("#snclose").hide();
            if (findGetParameter("view") === "settings") {
                $("#view__main").hide();
                $("#view__cast").hide();
                $("#view__search").hide();
                $(".fa__nav").hide();
                $(".fa__nav2").hide();
                $(".addfeed").hide();
                $(".problemreporting").hide();
                $("#wrapper__search").hide();
                searchtoggle = false;
                $.get("views/settingsview.html", function(data) {
                    $("#view__settings").html(data);
                    $("#logout").click(function() {
                        localStorage.clear()
                        window.setTimeout(function() {
                            location.href = "index.html";
                        }, 200);
                    });
                    $("#cdark__mode").click(function() {
                        if (localStorage.getItem("darkmode") === "true") {
                            localStorage.setItem("darkmode", "false");
                            $("#cdark__mode").removeAttr("checked");
                            $("#starwars").attr("src", "darth.png");
                            try {
                                removejscssfile("dark.css", "css");
                            } catch (e) {}
                        } else {
                            localStorage.setItem("darkmode", "true");
                            $("#cdark__mode").attr("checked", "");
                            $("#starwars").attr("src", "clonetrooper.png");
                            loadjscssfile("dark.css", "css");
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
                    if (localStorage.getItem("darkmode") === "true") {
                        $("#cdark__mode").attr("checked", "");
                        $("#starwars").attr("src", "clonetrooper.png");
                    } else {
                        $("#cdark__mode").removeAttr("checked");
                        $("#starwars").attr("src", "darth.png");
                    }
                    $("#view__settings").attr("style", "padding: 90px 20px 60px; display: block;");
                });
                $("#view__settings").show();
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
                    $("#view__report").hide();
                    $("#view__addfeed").attr("style", "padding: 90px 20px 0px;");
                    $("#view__settings").attr("style", "padding: 90px 20px 0px;");
                    $("#view__addfeed").hide();
                    $("#view__settings").hide();
                    $("#view__cast").html(data);
                    if (localStorage.getItem("lang") === "de") {
                        $("#text__koyushare").html("Auf koyu.space teilen");
                        $("#text__tootshare").html("Teilen auf");
                    }
                    if (detectmob() && findGetParameter("shared") === "true") {
                        $("#banner__openapp").attr("style", "");
                        $("#banner__openapp").attr("onclick", "window.open('nordcast://cast/"+findGetParameter("cast")+"', '_system')");
                    }
                    $("#link__report").attr("onclick", "location.href = 'app.html#view=report&cast="+findGetParameter("cast")+"'");
                    $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                        if (data["login"] === "error") {
                            $("#button__follow").hide();
                            $("#button__unfollow").hide();
                            $("#btn-padding").hide();
                            $(".problemreporting").hide();
                        } else {
                            if (data["podlist"].includes(feed)) {
                                $("#button__follow").hide();
                                $("#button__unfollow").show();
                            } else {
                                $("#button__unfollow").hide();
                                $("#button__follow").show();
                            }
                        }
                    }).fail(function() {
                        $("#button__follow").hide();
                        $("#button__unfollow").hide();
                    });
                    window.setTimeout(function() {
                        var feedurl = backend+"/api/v1/getpodcast?q="+feed;
                        if (localStorage.getItem("offline") === "true") {
                            feedurl = localStorage.getItem("feed-"+Base64.encode(feed).slice(0, -3));
                        }
                        $.getJSON(feedurl, function(callback) {
                            if (debug) {
                                console.log(callback);
                            }
                            try {
                                if (localStorage.getItem("offline") === "false") {
                                    $("#img__cast").attr("src", callback.feed.image.href);
                                } else {
                                    $("#img__cast").attr("src", localStorage.getItem("image-"+Base64.encode(feed).slice(0, -3)));
                                }
                            } catch (e) {
                                $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                                $("#view__cast").show();
                            }
                            window.setTimeout(function() {
                                if (localStorage.getItem("offline") === "false") {
                                    $.get(backend+"/api/v1/getprimarycolor?url="+callback.feed.image.href, function(color) {
                                        if (localStorage.getItem("darkmode") === "true") {
                                            $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#191919);");
                                        } else {
                                            $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                                        }
                                        if (Number(color.split(",")[0]) < 8 && localStorage.getItem("darkmode") === "false") {
                                            $("#podcard").attr("style", "background-image: none;");
                                        }
                                        if (Number(color.split(",")[0]) > 248 && localStorage.getItem("darkmode") === "true") {
                                            $("#podcard").attr("style", "background-image: none;");
                                        }
                                        localStorage.setItem("color-"+Base64.encode(feed).slice(0, -3), color);
                                    });
                                } else {
                                    var color = localStorage.getItem("color-"+Base64.encode(feed).slice(0, -3));
                                    if (localStorage.getItem("darkmode") === "true") {
                                        $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#191919);");
                                    } else {
                                        $("#podcard").attr("style", "background-image: linear-gradient(rgb("+color+"),#fff);");
                                    }
                                    if (Number(color.split(",")[0]) < 8 && localStorage.getItem("darkmode") === "false") {
                                        $("#podcard").attr("style", "background-image: none;");
                                    }
                                    if (Number(color.split(",")[0]) > 248 && localStorage.getItem("darkmode") === "true") {
                                        $("#podcard").attr("style", "background-image: none;");
                                    }
                                }
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
                            if (callback.feed.author === undefined) {
                            $("#element__author").hide();
                            } else {
                                if (author.includes("and") && localStorage.getItem("lang") === "de") {
                                    author = author.replaceAll("and", "und");
                                }
                                if (author.includes("backed by") && localStorage.getItem("lang") === "de") {
                                    author = author.replaceAll("backed by", "unterstützt von");
                                }
                                if (author.includes("Tobias Ain"))  {
                                    author = "Nordcast";
                                }
                            }
                            $.get(backend+"/api/v1/gethiddenauthors", function(data) {
                                if (data.includes(findGetParameter("cast"))) {
                                    $("#element__author").hide();
                                }
                            });
                            $.get(backend+"/api/v1/gethiddensubtitles", function(data) {
                                if (data.includes(findGetParameter("cast"))) {
                                    $("#text__subtitle").hide();
                                }
                            });
                            $("#text__author").html(author);
                            try {
                                $("#text__description").html(callback.feed.summary_detail.value.replaceAll("\n", "<br />"));
                            } catch (e) {}
                            if (callback.entries.length >= 100 && !showallwasclicked) {
                                $("#showall").attr("style", "");
                            }
                            $("#showall").click(function() {
                                if (confirm(showall_warning)) {
                                    showallwasclicked = true;
                                    loadview();
                                }
                            });
                            var entries;
                            if (!showallwasclicked) {
                                entries = callback.entries.slice(0,100);
                            } else {
                                entries = callback.entries;
                                showallwasclicked = false;
                            }
                            if (localStorage.getItem("offline") === "true") {
                                showallwasclicked = false;
                                entries = callback.entries;
                                $("#showall").hide();
                            }
                            entries.forEach(function(item) {
                                var secret = "";
                                try {
                                    secret = item.id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "").replace("@", "");
                                } catch (e) {}
                                if (secret === "") {
                                    secret = Base64.encode(item.link).replace("==", "");
                                }
                                var podurl = "";
                                var hide = false;
                                item.links.forEach(function(el) {
                                    try {
                                        if (el.type.includes("audio")) {
                                            podurl = el.href;
                                        }
                                        if (el.type.includes("video")) {
                                            podurl = el.href;
                                        }
                                    } catch (e) {
                                        hide = true;
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
                                        var image = callback.feed.image.href;
                                        if (localStorage.getItem("offline") === "true") {
                                            var image = localStorage.getItem("image-"+Base64.encode(feed).slice(0, -3));
                                            $("#playbtn-copy").hide();
                                        }
                                        if (!localStorage.getItem("downloaded").includes(secret)) {
                                            $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+image+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline snbutton\" id=\"snbutton-"+secret+"\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-download dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                        } else {
                                            $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+image+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline snbutton\" id=\"snbutton-"+secret+"\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-done dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                        }
                                    } catch (e) {
                                        $("#podtable tbody").append("<tr id=\"item-"+secret+"\"><td><i onclick=\"playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+image+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')\" id=\"cast-"+secret+"\" class=\"playbutton ion-md-play\"></i></td><td>"+twemoji.parse(itemtitle)+"</td><td><a onclick=\"shownotes('"+Base64.encode(shownotes)+"')\"><i class=\"ion-md-information-circle-outline snbutton\" id=\"snbutton-"+secret+"\"></i></a></td><td id=\"dlbtn-"+secret+"\"><i class=\"ion-md-cloud-download dlbutton\" onclick=\"download('"+podurl+"', '"+secret+"')\"></td></tr>");
                                    }
                                    if (shownotes === "") {
                                        $("#snbutton-"+secret).hide();
                                    }
                                }
                                window.setTimeout(function() {
                                    if ($("#podtable tbody").html() === "") {
                                        $("#podtable tbody").html("<div id=\"error__noepisodes\">No episodes available. Maybe the podcaster hasn't uploaded any or you haven't downloaded some to listen offline.</div>");
                                    }
                                }, 3000);
                                if (localStorage.getItem("uuid") === "dummy") {
                                    $(".dlbutton").hide();
                                }
                            });
                            window.setTimeout(function() {
                                $.get(backend+"/api/v1/gethiddendownloads?"+Date.now(), function(data) {
                                    data.split("\n").forEach(function(vl) {
                                        if (Base64.decode(findGetParameter("cast")).includes(vl) && vl !== "") {
                                            $(".dlbutton").hide();
                                        }
                                    })
                                });
                            }, 1500);
                            $("#button__follow").click(function() {
                                var feed = Base64.decode(findGetParameter("cast")).split("\n")[0].split("?")[0];
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
                                                            localStorage.setItem("lastplayed-"+Base64.decode(findGetParameter("cast")), Date.now());
                                                            $.get(backend+"/api/v1/lastplayed/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/"+Base64.encode(feed).slice(0, -3)+"/"+Date.now(), function(data) {});
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
                                }).fail(function() {
                                    $("#button__follow").hide();
                                    $("#button__unfollow").hide();
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
                                }).fail(function() {
                                    $("#button__follow").hide();
                                    $("#button__unfollow").hide();
                                });
                            });
                        }).fail(function() {
                            $("#view__cast").html("<br /><br /><h1 style=\"text-align:center;\" id=\"error__nocast\">This podcast is unavailable</h1>");
                            $("#view__cast").show();
                        });
                        if (localStorage.getItem("instance") === "koyu.space") {
                            $(".koyushare").attr("style", "");
                        } else {
                            if (localStorage.getItem("instance") !== null) {
                                $(".tootshare").attr("style", "");
                            }
                        }
                        if (localStorage.getItem("uuid") !== "dummy") {
                            $(".pod__favs").attr("style", "");
                            $(".fav").attr("style", "");
                            $.get(backend+"/api/v1/getfavs/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+Base64.encode(findGetParameter('cast')).slice(0, -3)+"/"+localStorage.getItem("instance"), function(data) {
                                $(".pod__favs").html(data["favs"]);
                            });
                            $.get(backend+"/api/v1/isfav/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+Base64.encode(findGetParameter('cast')).slice(0, -3)+"/"+localStorage.getItem("instance"), function(data) {
                                if (data["isfav"] === true) {
                                    $(".fav").attr("class", "ion-md-heart fav");
                                } else {
                                    $(".fav").attr("class", "ion-md-heart-empty fav");
                                }
                            });
                        }
                    }, 700);
                    window.setTimeout(function() {
                        $.get(backend+"/api/v1/getreversed?"+Date.now(), function(data) {
                            var reverse = false;
                            data.split("\n").forEach(function(vl) {
                                if (vl.includes(feed)) {
                                    reverse = true;
                                }
                            });
                            if (reverse) {
                                $(function(){
                                    $("#podtable tbody").each(function(elem,index){
                                    var arr = $.makeArray($("tr",this).detach());
                                    arr.reverse();
                                        $(this).append(arr);
                                    });
                                });
                                var feedurl = backend+"/api/v1/getpodcast?q="+feed;
                                if (localStorage.getItem("offline") === "true") {
                                    feedurl = localStorage.getItem("feed-"+Base64.encode(feed).slice(0, -3));
                                }
                                $.getJSON(feedurl, function(callback) {
                                    var item = callback.entries[callback.entries.length - 1];
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
                                    var author = "";
                                    if (callback.feed.author !== undefined) {
                                        if (author.includes("and") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("and", "und");
                                        }
                                        if (author.includes("backed by") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("backed by", "unterstützt von");
                                        }
                                        if (author.includes("Tobias Ain"))  {
                                            author = "Nordcast";
                                        }
                                    }
                                    try {
                                        var feedtitle = callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                                    } catch(e) {
                                        var feedtitle = callback.feed.title;
                                    }
                                    try {
                                        feedtitle = feedtitle.split(" (")[0];
                                    } catch (e) {}
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
                                    try {
                                        var image = callback.feed.image.href;
                                    } catch (e) {}
                                    $("#playbtn-copy").attr("onclick", "playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+image+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')");
                                    $("#playbtn-copy").html("<span style=\"display:none;\">"+secret+"</span>");
                                });
                            } else {
                                var feedurl = backend+"/api/v1/getpodcast?q="+feed;
                                if (localStorage.getItem("offline") === "true") {
                                    feedurl = localStorage.getItem("feed-"+Base64.encode(feed).slice(0, -3));
                                }
                                $.getJSON(feedurl, function(callback) {
                                    var item = callback.entries[0];
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
                                    var author = "";
                                    if (callback.feed.author !== undefined) {
                                        if (author.includes("and") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("and", "und");
                                        }
                                        if (author.includes("backed by") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("backed by", "unterstützt von");
                                        }
                                        if (author.includes("Tobias Ain"))  {
                                            author = "Nordcast";
                                        }
                                    }
                                    try {
                                        var feedtitle = callback.feed.title.split(" | ")[0].split(" - ")[0].split(" – ")[0];
                                    } catch(e) {
                                        var feedtitle = callback.feed.title;
                                    }
                                    try {
                                        feedtitle = feedtitle.split(" (")[0];
                                    } catch (e) {}
                                    var author = "";
                                    if (callback.feed.author !== undefined) {
                                        if (author.includes("and") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("and", "und");
                                        }
                                        if (author.includes("backed by") && localStorage.getItem("lang") === "de") {
                                            author = author.replaceAll("backed by", "unterstützt von");
                                        }
                                        if (author.includes("Tobias Ain"))  {
                                            author = "Nordcast";
                                        }
                                    }
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
                                    try {
                                        var image = callback.feed.image.href;
                                    } catch (e) {}
                                    $("#playbtn-copy").attr("onclick", "playcast('"+podurl+"', '"+secret+"', '"+Base64.encode(itemtitle)+"', '"+Base64.encode(author)+"', '"+image+"', '"+feed+"', '"+Base64.encode(feedtitle)+"')");
                                    $("#playbtn-copy").html("<span style=\"display:none;\">"+secret+"</span>");
                                });
                            }
                        });
                        $("#view__main").hide();
                    }, 1000);
                });
            }
            if (findGetParameter("view") === "search") {
                $("#view__main").hide();
                window.setTimeout(function() {
                    $("#view__search").show();
                },1000);
                $.get("views/searchview.html", function(data) {
                    $("#view__search").html(data);
                    $("#text__query").html(stripHtml(findGetParameter("q")));
                    $.getJSON(backend+"/api/v1/search/"+localStorage.getItem("lang")+"/"+findGetParameter("q"), function(data) {
                        data["results"].forEach(function(item) {
                            $("#searchtable tbody").append("<tr><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\"><img src=\""+item.artworkUrl100+"\" class=\"card__small\"></a></td><td><a class=\"cardlink\" data-cast=\""+Base64.encode(item.feedUrl)+"\" style=\"color:#333;\">"+twemoji.parse(item.collectionName)+"</a></td></tr>");
                        });
                        if (data["resultCount"] === 0) {
                            $("#searchtable").html("<p id=\"object__noresults\"><b id=\"error__noresults\">No results found.</b></p>");
                            $("#view__"+findGetParameter("view")).show();
                        }
                    });
                }).fail(function() {
                    window.setTimeout(function() {
                        $("#searchtable").html("<p id=\"object__noresults\"><b id=\"error__noresults\">No results found.</b></p>");
                        $("#view__"+findGetParameter("view")).show();
                    }, 2000);
                });
            }
            if (findGetParameter("view") === "report") {
                window.setTimeout(function() {
                    $("#view__"+findGetParameter("view")).show();
                }, 20);
                $.get("views/reportview.html", function(data) {
                    $("#view__report").html(data);
                    $("#section__issue__reverse").hide();
                    $("#section__issue__missing").hide();
                    $("#section__issue__metadata").hide();
                    if (localStorage.getItem("lang") === "de") {
                        $("#text__report").html("Fehler melden");
                        $("#text__type").html("Welchen Fehler möchtest du melden?");
                        $("#text__issue__downloads").html("Ich kann keine Episoden herunterladen");
                        $("#text__issue__metadata").html("Ein paar Informationen sind fehlerhaft");
                        $("#text__issue__reverse").html("Die Episoden sind in der verkehrten Reihenfolge");
                        $("#text__issue__missing").html("Ich vermisse einen Podcast");
                        $("#text__whatsmissing").html("Welchen Podcast vermisst du?");
                        $("#data__podcasttitle").attr("placeholder", "Bitte Podcastnamen hier eingeben");
                        $("#text__incorrectmetadata").html("Welche Informationen sind fehlerhaft?");
                        $("#text__data__title").html("Titel");
                        $("#text__data__subtitle").html("Beschreibung");
                        $("#text__data__author").html("Autor");
                        $("#text__data__cover").html("Cover-Foto");
                        $("#text__data__shownotes").html("Shownotes");
                        $("#text__data__eptitle").html("Titel der Episode");
                        $("#text__data__eplength").html("Länge der Episode");
                        $("#text__automatic").html("Weil du keinen Podcast ausgewählt oder abgespielt hast haben wir automatisch eine Option für dich gewählt.");
                        $("#text__thankyou").html("Danke!");
                        $("#text__report__success").html("Dein Fehlerbericht wurde erfolgreich an unser Team versandt. Wir werden auf dich über <span id=\"instance\">koyu.space</span> zurückkommen sobald wir uns um den Bericht gekümmert haben.");
                        $("#btn__return").html("Zur App zurückkehren");
                        $(".btn-submit").html("Absenden");
                    }
                    var onlymissing = false;
                    try {
                        if (findGetParameter("cast") === null || findGetParameter("cast") === "null") {
                            onlymissing = true;
                        }
                    } catch (e) {
                        onlymissing = true;
                    }
                    if (!onlymissing) {
                        window.setTimeout(function() {
                            $("#data__issue").change(function() {
                                $("#section__issue__downloads").hide();
                                $("#section__issue__reverse").hide();
                                $("#section__issue__missing").hide();
                                $("#section__issue__metadata").hide();
                                window.setTimeout(function() {
                                    $("#section__issue__"+$("#data__issue").val()).show();
                                    if (findGetParameter("ep") === null) {
                                        $(".only-ep").hide();
                                        $("#btn__reportsubmit__metadata").attr("style", "margin-top: -160px;");
                                    } else {
                                        $("#btn__reportsubmit__metadata").attr("style", "margin-top: -30px;");
                                    }
                                }, 20);
                            });
                        }, 500);
                    } else {
                        $("#data__issue").hide();
                        $("#section__issue__downloads").hide();
                        $("#text__type").hide();
                        $("#text__automatic").attr("style", "");
                        $("#section__issue__missing").attr("style", "margin-top: -40px;")
                        $("#section__issue__missing").show();
                    }
                    $(".btn-submit").click(function() {
                        var report = "@koyuchan@koyu.space"; //Recipient for the report
                        var report_type = $("#data__issue").val();
                        if (onlymissing) {
                            report_type = "missing";
                        }
                        report = report+"\nReport for Nordcast version "+$("#version").html()+"\n\n";
                        report = report+"Report type: "+report_type+"\n";
                        if (report_type === "downloads" || report_type === "reverse") {
                            report = report+"Podcast ID: "+findGetParameter("cast")+"\n";
                        }
                        if (report_type === "missing") {
                            if ($("#data__podcasttitle").val() === "") {
                                alert("Podcast title can't be empty");
                                report = "";
                            } else {
                                report = report+"Podcast name: "+$("#data__podcasttitle").val();
                            }
                        }
                        if (report_type === "metadata") {
                            $("#data__metadatatype:checkbox").each(function () {
                                report = report+(this.checked ? $(this).val()+": yes" : $(this).val()+": no")+"\n";
                        });
                        }
                        if (report !== "") {
                            $.post(backend+"/api/v1/toot/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/direct", {content: report}, function(data) {
                                if (data["login"] === "ok") {
                                    $("#view__report").html($("#content__report__success").html());
                                } else {
                                    alert("Failed to send report. Now returning to main app.");
                                    location.href = "app.html#view=main";
                                }
                            }).fail(function() {
                                alert("Failed to send report. Now returning to main app.");
                                location.href = "app.html#view=main";
                            });
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
                        return false;
                    }
                });
                $("#addfeed__submit").click(function() {
                    location.href = "app.html#view=cast&cast="+Base64.encode($("#addfeed__rss").val());
                });
            }
            if (findGetParameter("view") === "notifications") {
                $.get("views/notificationsview.html", function(data) {
                    $("#view__notifications").html(data);
                    $(".notification-button").attr("class", "icon notification-button ion-md-mail");
                    if (fload) {
                        $("#view__notifications").attr("style", "padding: 0px 20px 40px;");
                    } else {
                        $("#view__notifications").attr("style", "");
                    }
                    $.get(backend+"/api/v1/getnotifications/"+localStorage.getItem("lang"), function(data) {
                        if (data.split("\n")[0] !== "") {
                            $("#area__notifications").html(data);
                        }
                        localStorage.setItem("notifications", data);
                        $("#view__notifications").show();
                    });
                });
            }
            if (findGetParameter("view") === "main" || findGetParameter("view") === "yourlist") {
                window.setInterval(function() {
                    if (findGetParameter("view") === "main") {
                        $("#section__list").hide();
                        $("#text__list").hide();
                    } else {
                        $("#section__featured").hide();
                        $("#section__originals").hide();
                        $("#text__featured").hide();
                        $("#text__originals").hide();
                        $("#text__username").hide();
                    }
                }, 1500);
                window.setTimeout(function() {
                    if (findGetParameter("view") === "main") {
                        $.get(backend+"/api/v1/getcustomsection/"+localStorage.getItem("lang"), function(data) {
                            $("#text__custom").html(data.split("\n")[0]);
                            var custom = data.split("\n");
                            custom.shift();
                            $("#section__custom").html(custom);
                        });
                    }
                }, 1500);
                $.get(backend+"/api/v1/getpic/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                    if (data["login"] === "ok") {
                        $("#profile__picture").attr("src", data.kspic);
                        $("#profile__picture").show();
                    } else {
                        $("#profile__picture").hide();
                    }
                }).fail(function() {
                    $("#profile__picture").hide();
                });
                $.get("views/mainview.html", function(data) {
                    $("#view__main").html(data);
                    $("#view__report").hide();
                    $("#view__addfeed").attr("style", "padding: 90px 20px 0px;");
                    $("#view__settings").attr("style", "padding: 90px 20px 0px;");
                    $("#view__addfeed").hide();
                    $("#view__settings").hide();
                    if (!playing) {
                        $("#link__report").attr("onclick", "location.href = 'app.html#view=report"+"'");
                    }
                    if (localStorage.getItem("offline") !== "true") {
                        $("#offline__message").hide();
                        $("#view__yourlist>h3").attr("style", "margin-top: 0 !important;");
                    } else {
                        $("#offline__message").show();
                        $("#view__yourlist>h3").removeAttr("style");
                    }
                    if (localStorage.getItem("uuid") !== "dummy") {
                        window.setTimeout(function() {
                            $.get(backend+"/api/v1/getlist/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance"), function(data) {
                                if (data["login"] === "error") {
                                    $("#section__list").hide();
                                    $("#text__list").hide();
                                    window.setTimeout(function() {
                                        $("#view__main").show();
                                        $("#view__yourlist").show();
                                    }, 3000)
                                } else {
                                    if (data["podlist"] === "None" ) {
                                        $("#section__list").html("<br /><br /><p style=\"text-align:center;width:60%;margin:0 auto;\" id=\"error__nocasts\">There are no podcasts in your list.</p><br /><br />")
                                        window.setTimeout(function() {
                                            $("#view__main").show();
                                            $("#view__yourlist").show()
                                        }, 3000);
                                        localStorage.setItem("podlist", data["podlist"]);
                                    } else {
                                        if (debug) {
                                            console.log(timeout);
                                        }
                                        var podlist = "";
                                        if (localStorage.getItem("podlist") !== "None" && localStorage.getItem("podlist") !== null && localStorage.getItem("offline") === "false" && localStorage.getItem("podlist") === data["podlist"]) {
                                            podlist = localStorage.getItem("podlist");
                                        } else {
                                            podlist = data["podlist"];
                                            localStorage.setItem("podlist", data["podlist"]);
                                        }
                                        $("#section__list").html($("#section__list").html()+"<p>");
                                        var goaltime = Date.now() + 600000;
                                        if (localStorage.getItem("lastloaded") !== null) {
                                            if (goaltime < Number(localStorage.getItem("lastloaded"))) {
                                                localStorage.setItem("lastloaded", Date.now());
                                                timeout = (podlist.split(",").length * 622) / 2;
                                            } else {
                                                timeout = 3000;
                                            }
                                        } else {
                                            localStorage.setItem("lastloaded", Date.now());
                                            timeout = (podlist.split(",").length * 622) / 2;
                                        }
                                        if (firstload) {
                                            localStorage.setItem("lastloaded", Date.now());
                                            timeout = (podlist.split(",").length * 622) / 2;
                                        }
                                        timeout = 1500;
                                        window.setTimeout(function() {
                                            window.setTimeout(function() {
                                                $("#section__list").html($("#section__list").html()+"</p>");
                                                $("#view__main").show();
                                                $("#view__yourlist").show();
                                            }, timeout);
                                        }, 20);
                                        podlist.split(",").forEach(function(feed) {
                                            $.get(backend+"/api/v1/getpodcast?q="+feed, function(callback) {
                                                try {
                                                    var secret = Base64.encode(feed).slice(0, -3)
                                                    var summary = "";
                                                    if (callback.feed.summary !== undefined) {
                                                        summary = callback.feed.summary.replaceAll("\n", "<br>");
                                                    }
                                                    summary = summary.split("<br>")[0];
                                                    if (summary.length > 50) {
                                                        summary = summary.slice(0,49) + "...";
                                                    }
                                                    if (summary.length > 72 && findGetParameter("view") === "main") {
                                                        summary = summary.slice(0,71) + "...";
                                                    }
                                                    var reverse = false;
                                                    $.get(backend+"/api/v1/getreversed?"+Date.now(), function(data) {
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
                                                    if (findGetParameter("view") === "main" && callback.entries.length > 0) {
                                                        $.get(backend+"/api/v1/getlastplayed/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/"+Base64.encode(feed).slice(0, -3), function(data) {
                                                            if (data["lastplayed"] <= Number(new Date(callback.entries[ep].published).getTime()) && findGetParameter("view") === "main") {
                                                                if (Number(localStorage.getItem("lastplayed-"+feed)) <= Number(new Date(callback.entries[ep].published).getTime())) {
                                                                    var epsecret = "";
                                                                    try {
                                                                        epsecret = callback.entries[ep].id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "").replace("@", "");
                                                                    } catch (e) {}
                                                                    if (epsecret === "") {
                                                                        epsecret = Base64.encode(callback.entries[ep].link).replace("==", "");
                                                                    }
                                                                    $("#section__newforyou").html($("#section__newforyou").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\" data-ep=\""+epsecret+"\"><div class=\"item itemcard-"+secret+"\"><div class=\"item-head\" id=\"item-head-"+secret+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" /><br><b>"+callback.feed.title.split("-")[0].split("–")[0].split("(")[0]+"</b></div><p>"+summary+"</p></div></a>");
                                                                    if (summary === "") {
                                                                        $("#item-head-"+secret).attr("style", "display:flex;align-items:center;");
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                    if (findGetParameter("view") === "yourlist" && callback.entries.length > 0) {
                                                        var reverse = false;
                                                        $.get(backend+"/api/v1/getreversed?"+Date.now(), function(data) {
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
                                                        $.get(backend+"/api/v1/getlastplayed/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("instance")+"/"+Base64.encode(feed).slice(0, -3), function(data) {
                                                            var addons = "";
                                                            if (data["lastplayed"] <= Number(new Date(callback.entries[ep].published).getTime()) && findGetParameter("view") === "yourlist") {
                                                                if (Number(localStorage.getItem("lastplayed-"+feed)) <= Number(new Date(callback.entries[ep].published).getTime())) {
                                                                    addons = "<div class=\"new\">NEW EPISODES</div>";
                                                                } else {
                                                                    addons = "";
                                                                }
                                                            }
                                                            var epsecret = "";
                                                            try {
                                                                epsecret = callback.entries[ep].id.replaceAll("/", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace(".", "-").replace("http:", "").replace("https:", "").replace("--", "").replace("+", "-").replaceAll(":", "-").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"-").replace("?", "").replace("@", "");
                                                            } catch (e) {}
                                                            if (epsecret === "") {
                                                                epsecret = Base64.encode(callback.entries[ep].link).replace("==", "");
                                                            }
                                                            if (addons === "") {
                                                                window.setTimeout(function() {
                                                                    $("#section__list").html($("#section__list").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><div class=\"item\" id=\"itemcard-"+secret+"\">"+addons+"<div class=\"item-head\" id=\"itemhead-"+secret+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" id=\"item-card-"+secret+"\" /><br><b>"+callback.feed.title.split("-")[0].split("–")[0].split("(")[0]+"</b></div><br><p>"+summary+"</p></div></a>");
                                                                }, 3000);
                                                            } else {
                                                                $("#section__list").html($("#section__list").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\" data-ep=\""+epsecret+"\"><div class=\"item\" id=\"itemcard-"+secret+"\">"+addons+"<div class=\"item-head\" id=\"itemhead-"+secret+"\"><img src=\""+callback.feed.image.href+"\" class=\"card__small\" id=\"item-card-"+secret+"\" /><br><b>"+callback.feed.title.split("-")[0].split("–")[0].split("(")[0]+"</b></div><br><p>"+summary+"</p></div></a>");
                                                            }
                                                        });
                                                    }
                                                    var counter = 0;
                                                    window.setInterval(function() {
                                                        counter++
                                                        if (counter < 5) {
                                                            try {
                                                                if (findGetParameter("view") === "main" || findGetParameter("view") === "yourlist") {
                                                                    $.get(backend+"/api/v1/getprimarycolor?url="+callback.feed.image.href, function(color) {
                                                                        localStorage.setItem("color-"+Base64.encode(feed).slice(0, -3), color);
                                                                        var customstyles = "";
                                                                        try {
                                                                            if ($("#itemcard-"+secret).html().includes("class=\"new\"")) {
                                                                                customstyles = "padding-bottom: 30px;";
                                                                            }
                                                                        } catch (e) {}
                                                                        if (Number(color.split(",")[0]) > 140) {
                                                                            if (summary !== "") {
                                                                                $("#itemcard-"+secret).attr("style", customstyles+"color:#333; background:rgb("+color+");");
                                                                            } else {
                                                                                $("#itemcard-"+secret).attr("style", customstyles+"color:#333; background:rgb("+color+");font-size:1.5em;");
                                                                                $("#itemhead-"+secret).attr("style", "display:flex;align-items:center;");
                                                                                try {
                                                                                    $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br>", ""));
                                                                                    $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                                                } catch (e) {}
                                                                            }
                                                                        } else {
                                                                            if (summary !== "") {
                                                                                $("#itemcard-"+secret).attr("style", customstyles+"color:#fff; background:rgb("+color+");");
                                                                            } else {
                                                                                $("#itemcard-"+secret).attr("style", customstyles+"color:#fff; background:rgb("+color+");font-size:1.5em;");
                                                                                $("#itemhead-"+secret).attr("style", "display:flex;align-items:center;");
                                                                                try {
                                                                                    $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br>", ""));
                                                                                    $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                                                } catch (e) {}
                                                                            }
                                                                        }
                                                                        // Same for the newforyou section
                                                                        if (Number(color.split(",")[0]) > 140) {
                                                                            if (summary !== "") {
                                                                                $(".itemcard-"+secret).attr("style", "color:#333; background:rgb("+color+");");
                                                                            } else {
                                                                                $(".itemcard-"+secret).attr("style", "color:#333; background:rgb("+color+");font-size:1.5em;");
                                                                                $(".itemhead-"+secret).attr("style", "display:flex;align-items:center;");
                                                                                try {
                                                                                    $(".itemcard-"+secret).html($(".itemcard-"+secret).html().replaceAll("<br>", ""));
                                                                                    $(".itemcard-"+secret).html($(".itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                                                } catch (e) {}
                                                                            }
                                                                        } else {
                                                                            if (summary !== "") {
                                                                                $(".itemcard-"+secret).attr("style", "color:#fff; background:rgb("+color+");");
                                                                            } else {
                                                                                $(".itemcard-"+secret).attr("style", "color:#fff; background:rgb("+color+");font-size:1.5em;");
                                                                                $(".itemhead-"+secret).attr("style", "display:flex;align-items:center;");
                                                                                try {
                                                                                    $(".itemcard-"+secret).html($(".itemcard-"+secret).html().replaceAll("<br>", ""));
                                                                                    $(".itemcard-"+secret).html($(".itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                                                } catch (e) {}
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            } catch (e) {}
                                                        }
                                                    }, 1500);
                                                } catch (e) {}
                                            });
                                        });
                                    }
                                }
                            }).fail(function() {
                                $.get("views/mainview.html", function(data) {
                                    $("#view__main").html(data);
                                    $("#text__username").hide();
                                    $("#offline__message").show();
                                    $("#view__main").show();
                                    $("#view__yourlist").show();
                                    podlist = localStorage.getItem("podlist");
                                    $("#section__list").html($("#section__list").html()+"<p>");
                                    podlist.split(",").forEach(function(feed) {
                                        try {
                                            if (debug) {
                                                console.log("Read file: "+localStorage.getItem("feed-"+Base64.encode(feed).slice(0, -3)));
                                            }
                                            $.getJSON(localStorage.getItem("feed-"+Base64.encode(feed).slice(0, -3)), function(callback) {
                                                var secret = Base64.encode(feed).slice(0, -3)
                                                var summary = "";
                                                if (callback.feed.summary !== undefined) {
                                                    summary = callback.feed.summary.replaceAll("\n", "<br>");
                                                }
                                                summary = summary.split("<br>")[0];
                                                if (summary.length > 60) {
                                                    summary = summary.slice(0,59) + "...";
                                                }
                                                summary = summary.split("(")[0];
                                                var image = localStorage.getItem("image-"+Base64.encode(feed).slice(0, -3));
                                                $("#section__list").html($("#section__list").html()+"<a class=\"cardlink\" data-cast=\""+Base64.encode(callback.href)+"\"><div class=\"item\" id=\"itemcard-"+secret+"\"><div class=\"item-head\" id=\"itemhead-"+secret+"\"><img src=\""+image+"\" class=\"card__small\" id=\"item-card-"+secret+"\" /><br><b>"+callback.feed.title.split("-")[0].split("–")[0].split("(")[0]+"</b></div><br><p>"+summary+"</p></div></a>");
                                                var color = localStorage.getItem("color-"+Base64.encode(feed).slice(0, -3));
                                                if (Number(color.split(",")[0]) > 140) {
                                                    if (summary !== "") {
                                                        $("#itemcard-"+secret).attr("style", "color:#333; background:rgb("+color+");");
                                                    } else {
                                                        $("#itemcard-"+secret).attr("style", "color:#333; background:rgb("+color+");font-size:1.5em;");
                                                        $("#itemhead-"+secret).attr("style", "display:flex;align-items:center;")
                                                        $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br>", ""));
                                                        $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                    }
                                                } else {
                                                    if (summary !== "") {
                                                        $("#itemcard-"+secret).attr("style", "color:#fff; background:rgb("+color+");");
                                                    } else {
                                                        $("#itemcard-"+secret).attr("style", "color:#fff; background:rgb("+color+");font-size:1.5em;");
                                                        $("#itemhead-"+secret).attr("style", "display:flex;align-items:center;")
                                                        $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br>", ""));
                                                        $("#itemcard-"+secret).html($("#itemcard-"+secret).html().replaceAll("<br><p></p>", ""));
                                                    }
                                                }
                                            });
                                        } catch (e) {}
                                    });
                                    $("#section__list").html($("#section__list").html()+"</p>");
                                });
                                firstload = false;
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
                                }).fail(function() {
                                    $("#section__originals").hide();
                                    $("#text__originals").hide();
                                });
                                if (findGetParameter("view") === "main") {
                                    if (localStorage.getItem("offline") === "false") {
                                        $(".bigscreen").removeAttr("style");
                                    } else {
                                        $("#view__main").css("margin-top", "60px");
                                    }
                                } else {
                                    $(".bigscreen").hide();
                                }
                                $.get(backend+"/api/v1/getfeatured/"+localStorage.getItem("lang"), function(data) {
                                    if (data.slice(0,-1).length === 0) {
                                        $("#text__featured").hide();
                                    }
                                    var counter = 0;
                                    data.forEach(function(item) {
                                        if (counter !== 0) {
                                            $("#section__featured").html($("#section__featured").html()+"<div><a class=\"cardlink\" data-cast=\""+Base64.encode(item[1])+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" id=\"featured-"+Base64.encode(item[1]).replaceAll("=", "")+"\"/></a></div>");
                                            window.setTimeout(function() {
                                                $.get(backend+"/api/v1/getprimarycolor?url="+backend+"/api/v1/getbanner/"+item[0], function(color) {
                                                    $("#featured-"+Base64.encode(item[1]).replaceAll("=", "")).attr("style", "box-shadow: 0px 0px 13px 2px rgba("+color+",0.75);");
                                                });
                                            },200);
                                        }
                                        if (counter === 0 && findGetParameter("view") === "main") {
                                            $(".bigscreen").attr("onclick", "location.href='app.html#view=cast&cast="+Base64.encode(item[1])+"';")
                                            $.get(backend+"/api/v1/getpodcast?q="+item[1], function(callback) {
                                                if (localStorage.getItem("darkmode") === "false" || localStorage.getItem("darkmode")=== null) {
                                                    $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#fff),url("+callback.feed.image.href+") center center;");
                                                    $(".bigscreen").css("background-size", "cover");
                                                } else {
                                                    $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#191919),url("+callback.feed.image.href+") center center;");
                                                    $(".bigscreen").css("background-size", "cover");
                                                }
                                                $("#img__bigscreen").attr("src", callback.feed.image.href);
                                                var title = callback.feed.title.split("-")[0].split("–")[0].split("(")[0];
                                                if (title.includes("!")) {
                                                    title = title.split("!")[0]+"!";
                                                }
                                                if (title.includes(".")) {
                                                    title = title.split("!")[0]+".";
                                                }
                                                if (title.includes(",")) {
                                                    title = title.split(",")[0]+",";
                                                }
                                                if (title.includes("?")) {
                                                    title = title.split("?")[0]+"?";
                                                }
                                                $("#title__bigscreen").html(title);
                                                try {
                                                    var summary = callback.feed.summary.split(".")[0];
                                                    if (summary.length < 72) {
                                                        summary = callback.feed.summary.split(".")[0] + ". " + callback.feed.summary.split(".")[1];
                                                    }
                                                } catch (e) {}
                                                $("#text__bigscreen").html("<small>"+summary+".</small>")
                                            });
                                        }
                                        counter++;
                                    });
                                    if (data === "") {
                                        $("#section__originals").hide();
                                        $("#text__originals").hide();
                                    }
                                }).fail(function() {
                                    $("#section__featured").hide();
                                    $("#text__featured").hide();
                                });
                            }, 1500);
                        }, 500);
                    } else {
                        $.get(backend+"/api/v1/getfeatured/"+localStorage.getItem("lang"), function(data) {
                            if (data.slice(0,-1).length === 0) {
                                $("#text__featured").hide();
                            }
                            var counter = 0;
                            data.forEach(function(item) {
                                if (counter !== 0) {
                                    $("#section__featured").html($("#section__featured").html()+"<div><a class=\"cardlink\" data-cast=\""+Base64.encode(item[1])+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" id=\"featured-"+Base64.encode(item[1]).replaceAll("=", "")+"\"/></a></div>");
                                    window.setTimeout(function() {
                                        $.get(backend+"/api/v1/getprimarycolor?url="+backend+"/api/v1/getbanner/"+item[0], function(color) {
                                            $("#featured-"+Base64.encode(item[1]).replaceAll("=", "")).attr("style", "box-shadow: 0px 0px 13px 2px rgba("+color+",0.75);");
                                        });
                                    },200);
                                }
                                if (counter === 0 && findGetParameter("view") === "main") {
                                    $(".bigscreen").attr("onclick", "location.href='app.html#view=cast&cast="+Base64.encode(item[1])+"';")
                                    $.get(backend+"/api/v1/getpodcast?q="+item[1], function(callback) {
                                        if (localStorage.getItem("darkmode") === "false" || localStorage.getItem("darkmode")=== null) {
                                            $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#fff),url("+callback.feed.image.href+") center center;");
                                            $(".bigscreen").css("background-size", "cover");
                                        } else {
                                            $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#191919),url("+callback.feed.image.href+") center center;");
                                            $(".bigscreen").css("background-size", "cover");
                                        }
                                        $("#img__bigscreen").attr("src", callback.feed.image.href);
                                        var title = callback.feed.title.split("-")[0].split("–")[0].split("(")[0];
                                        if (title.includes("!")) {
                                            title = title.split("!")[0]+"!";
                                        }
                                        if (title.includes(".")) {
                                            title = title.split("!")[0]+".";
                                        }
                                        if (title.includes(",")) {
                                            title = title.split(",")[0]+",";
                                        }
                                        if (title.includes("?")) {
                                            title = title.split("?")[0]+"?";
                                        }
                                        $("#title__bigscreen").html(title);
                                        try {
                                            var summary = callback.feed.summary.split(".")[0];
                                            if (summary.length < 72) {
                                                summary = callback.feed.summary.split(".")[0] + ". " + callback.feed.summary.split(".")[1];
                                            }
                                            $("#text__bigscreen").html("<small>"+summary+".</small>");
                                        } catch (e) {}
                                    });
                                }
                                counter++;
                            });
                            if (data === "") {
                                $("#section__originals").hide();
                                $("#text__originals").hide();
                            }
                        }).fail(function() {
                            $("#section__featured").hide();
                            $("#text__featured").hide();
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
                            }).fail(function() {
                                $("#section__originals").hide();
                                $("#text__originals").hide();
                            });
                            if (findGetParameter("view") === "main") {
                                if (localStorage.getItem("offline") === "false") {
                                    $(".bigscreen").removeAttr("style");
                                } else {
                                    $("#view__main").css("margin-top", "60px");
                                }
                            } else {
                                $(".bigscreen").hide();
                            }
                            $.get(backend+"/api/v1/getfeatured/"+localStorage.getItem("lang"), function(data) {
                                if (data.slice(0,-1).length === 0) {
                                    $("#text__featured").hide();
                                }
                                var counter = 0;
                                data.forEach(function(item) {
                                    if (counter !== 0) {
                                        $("#section__featured").html($("#section__featured").html()+"<div><a class=\"cardlink\" data-cast=\""+Base64.encode(item[1])+"\"><img src=\""+backend+"/api/v1/getbanner/"+item[0]+"\" class=\"card__big\" id=\"featured-"+Base64.encode(item[1]).replaceAll("=", "")+"\"/></a></div>");
                                        window.setTimeout(function() {
                                            $.get(backend+"/api/v1/getprimarycolor?url="+backend+"/api/v1/getbanner/"+item[0], function(color) {
                                                $("#featured-"+Base64.encode(item[1]).replaceAll("=", "")).attr("style", "box-shadow: 0px 0px 13px 2px rgba("+color+",0.75);");
                                            });
                                        },200);
                                    }
                                    if (counter === 0 && findGetParameter("view") === "main") {
                                        $(".bigscreen").attr("onclick", "location.href='app.html#view=cast&cast="+Base64.encode(item[1])+"';")
                                        $.get(backend+"/api/v1/getpodcast?q="+item[1], function(callback) {
                                            if (localStorage.getItem("darkmode") === "false" || localStorage.getItem("darkmode")=== null) {
                                                $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#fff),url("+callback.feed.image.href+") center center;");
                                                $(".bigscreen").css("background-size", "cover");
                                            } else {
                                                $(".bigscreen").attr("style", "background: linear-gradient(180deg,transparent,#191919),url("+callback.feed.image.href+") center center;");
                                                $(".bigscreen").css("background-size", "cover");
                                            }
                                            $("#img__bigscreen").attr("src", callback.feed.image.href);
                                            var title = callback.feed.title.split("-")[0].split("–")[0].split("(")[0];
                                            if (title.includes("!")) {
                                                title = title.split("!")[0]+"!";
                                            }
                                            if (title.includes(".")) {
                                                title = title.split("!")[0]+".";
                                            }
                                            if (title.includes(",")) {
                                                title = title.split(",")[0]+",";
                                            }
                                            if (title.includes("?")) {
                                                title = title.split("?")[0]+"?";
                                            }
                                            $("#title__bigscreen").html(title);
                                            try {
                                                var summary = callback.feed.summary.split(".")[0];
                                                if (summary.length < 72) {
                                                    summary = callback.feed.summary.split(".")[0] + ". " + callback.feed.summary.split(".")[1];
                                                }
                                                $("#text__bigscreen").html("<small>"+summary+".</small>");
                                            } catch (e) {}
                                        });
                                    }
                                    counter++;
                                });
                                if (data === "") {
                                    $("#section__originals").hide();
                                    $("#text__originals").hide();
                                }
                            }).fail(function() {
                                $("#section__featured").hide();
                                $("#text__featured").hide();
                            });
                        }, 1500);
                        window.setTimeout(function() {
                            $("#view__main").show();
                        }, 1500);
                    }
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
        }).fail(function() {
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
        });
        $("#qq").keyup(function() {
            window.setTimeout(function() {
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
                                        }, 200)
                                    }
                                }, 50);
                            });
                        }
                    });
                });
            }, 0);
        });

        $("#qq").keypress(function (e) {
            if (e.which === 13 && !loading) {
                $("#wrapper__search").hide();
                location.href = "app.html#view=search&q="+$("#qq").val();
                $("#qq").val("");
                return false;
            }
        });

        $("#logo__nav").click(function() {
            if (!loading) {
                $("#view__cast").hide();
                $("#view__search").hide();
                $("#view_settings").hide();
                $("#view__main").hide();
                if (localStorage.getItem("offline") === "false") {
                    $(".fa__nav").show();
                    $(".fa__nav2").show();
                    $(".addfeed").show();
                    $(".problemreporting").show();
                }
                location.href = "app.html#view=main";
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

        $("#snclose").click(function() {
            $("#snclose").hide();
            restoreview();
        });

        $(document).on("click", "a", function(e) {
            if ($(this).attr("data-cast") && !loading) {
                var counter = 0;
                window.setInterval(function() {
                    if (counter < 10) {
                        $("#view__main").hide();
                    }
                    counter = counter + 1;
                }, 20);
                location.href = "app.html#view=cast&cast="+$(this).attr("data-cast");
            }
            if ($(this).attr("data-cast") && !loading && $(this).attr("data-ep")) {
                var counter = 0;
                window.setInterval(function() {
                    if (counter < 10) {
                        $("#view__main").hide();
                    }
                    counter = counter + 1;
                }, 20);
                location.href = "app.html#view=cast&cast="+$(this).attr("data-cast")+"&episode="+$(this).attr("data-ep");
            }
            e.preventDefault();
        });

        $(".addfeed").click(function() {
            if (!loading) {
                location.href = "app.html#view=addfeed";
            }
        });

        $(".backbutton").click(function() {
            history.back();
        });

        window.setInterval(function() {
            if (kicker === true) {
                kicker = false;
                loadview();
            }
        }, 20);

        $("#nav").show();

        window.setInterval(function() {
            //German
            if (navigator.language.includes("de")) {
                localStorage.setItem("lang", "de");
                $("#text__featured").html("Angesagt");
                $(".text__notifications").html("Posteingang");
                $("#area__notifications__empty").html("Keine neuen Nachrichten.");
                $("#text__hello").html("Hallo");
                $("#text__by").html("von");
                $("#text__menulist").html("Liste");
                $(".text__list").html("Deine Liste");
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
                $(".msg-download").html("Herunterladen");
                $("#text__originals").html("In Eigenproduktion");
                $("#offline__message").html("Du bist offline. Unten findest du eine Liste von Podcasts denen du aktuell folgst. Möglicherweise hast du ein paar von denen bereits heruntergeladen.")
                $("#text__sourcecode").html("Quelltext");
                $("#showall").html("Alle anzeigen");
                showall_warning = "Warnung: Jede Podcast-Episode zu laden könnte möglicherweise dein Gerät zum Stillstand bringen. Möchtest du wirklich fortfahren?";
                $("#text__openapp").html("In der App öffnen");
                $("#text__shownotes").html("Shownotes");
                $("#text__newforyou").html("Neu für dich");
                $(".new").html("NEUE FOLGEN");
                $(".text__home").html("Startseite");
                $(".text__search").html("Suchen");
                $(".text__settings").html("Einstellungen");
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
            try {
                $("#instance").html(localStorage.getItem("instance"));
            } catch(e) {}
        }, 1500);
    });
}

$(document).on('click', 'a[href^="http"]', function (e) {
    var url = $(this).attr('href');
    window.open(url, '_system', true);
    e.preventDefault();
});

function fav(cast) {
    if (!isfaving) {
        isfaving = true;
        $(".fav").attr("class", "ion-md-heart-half fav");
        $.get(backend+"/api/v1/isfav/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+cast+"/"+localStorage.getItem("instance"), function(data) {
            if (data["isfav"] === true) {
                $.get(backend+"/api/v1/delfav/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+cast+"/"+localStorage.getItem("instance"), function() {
                    isfaving = false;
                    $.get(backend+"/api/v1/getfavs/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+cast+"/"+localStorage.getItem("instance"), function(data) {
                        $(".pod__favs").html(data["favs"]);
                        $(".fav").attr("class", "ion-md-heart-empty fav");
                    });
                });
            } else {
                $.get(backend+"/api/v1/addfav/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+cast+"/"+localStorage.getItem("instance"), function() {
                    isfaving = false;
                    $.get(backend+"/api/v1/getfavs/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+cast+"/"+localStorage.getItem("instance"), function(data) {
                        $(".pod__favs").html(data["favs"]);
                        $(".fav").attr("class", "ion-md-heart fav");
                    });
                });
            }
        });
    }
}

drr2();
