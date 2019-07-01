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

function ffw() {
    var player = document.getElementById("player");
    player.currentTime = player.currentTime + 10;
}

function rev() {
    var player = document.getElementById("player");
    player.currentTime = player.currentTime - 10;
}