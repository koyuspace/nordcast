var playing = false;
function playcast(file, secret) {
    localStorage.setItem("secret", secret);
    var player = document.getElementById("player");
    if (!playing) {
        $(".playbutton").attr("name", "play");
        $("#cast-"+secret).attr("name", "pause");
        if ($("#player").attr("src") !== file) {
            $("#player").attr("src", file);
        }
        playing = true;
    } else {
        $(".playbutton").attr("name", "play");
        $("#cast-"+secret).attr("name", "play");
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
        $(".playbutton").attr("name", "play");
        $("#cast-"+secret).attr("name", "pause");
        $.get(backend+"/api/v1/getpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+secret, function(data) {
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
        });
        window.setInterval(function() {
            $.get(backend+"/api/v1/setpos/"+localStorage.getItem("username")+"/"+localStorage.getItem("uuid")+"/"+localStorage.getItem("secret")+"/"+player.currentTime, function(data) { });
        }, 1000);
    } else {
        $(".playbutton").attr("name", "play");
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

window.setInterval(function() {
    var player = document.getElementById("player");
    $("#timer").html(String(player.currentTime).toHHMMSS());
}, 1);

window.setInterval(function() {
    var player = document.getElementById("player");
    $("#timeleft").html("-"+String(player.duration - player.currentTime).toHHMMSS());
}, 1);

function ffw() {
    var player = document.getElementById("player");
    player.currentTime = player.currentTime + 10;
}

function restart() {
    var player = document.getElementById("player");
    player.currentTime = 0;
}

function rev() {c
    var player = document.getElementById("player");
    player.currentTime = player.currentTime - 10;
}