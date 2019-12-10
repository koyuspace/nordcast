/*
Filesystem access
Sources:    https://www.tutorialspoint.com/cordova/cordova_file_system.htm
            https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
            https://stackoverflow.com/questions/12874021/phonegap-download-mp3-file
            https://stackoverflow.com/questions/34692092/cordova-check-if-file-in-url-exists
*/

function download(file, secret) {
    var fileTransfer = new FileTransfer();
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
    if (localStorage.getItem("offline") === "true") {
        shoulddownload = false;
    }
    var tick = 0;
    if (shoulddownload) {
        window.setInterval(function() {
            if (tick < 10) {
                $("#dlbtn-"+secret+" i").attr("class", "dlbutton");
                $("#dlbtn-"+secret+" i").html("<img src=\"sync.svg\" height=\"16\" class=\"ion-spin\">");
            }
            tick = tick+1;
        }, 1);
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
                    $("#dlbtn-"+secret+" i").html("");
                    $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-done dlbutton");
                    localStorage.setItem("download-"+secret, entry.toURL());
                    localStorage.setItem("downloaded", localStorage.getItem("downloaded")+","+secret);
                },
                function(error) {
                    if (debug) {
                        console.log("download error source " + error.source);
                        console.log("download error target " + error.target);
                        console.log("download error code " + error.code);
                    }
                    $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-download dlbutton");
                    try {
                        if (localStorage.getItem("downloaded").includes(secret)) {
                            $("#player").attr("src", localStorage.getItem("download-"+secret));
                            $("#dlbtn-"+secret+" i").html("");
                            $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-done dlbutton");
                            player.play();
                        } else {
                            plclose();
                        }
                    } catch (e) {
                        $("#player").attr("src", file);
                        player.play();
                        $("#dlbtn-"+secret+" i").html("");
                        $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-download dlbutton");
                    }
                },
                false
            );
        },0);
    } else {
        localStorage.removeItem("download-"+secret);
        localStorage.setItem("downloaded", localStorage.getItem("downloaded").replace(","+secret, ""));
        var tick = 0;
        window.setInterval(function() {
            if (tick < 10) {
                $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-download dlbutton");
            }
            tick = tick+1;
        }, 1);
    }
    if ($("#player").attr("src") !== file) {
        if (localStorage.getItem("download-"+secret) !== undefined) {
            $("#player").attr("src", localStorage.getItem("download-"+secret));
            $("#dlbtn-"+secret+" i").html("");
            $("#dlbtn-"+secret+" i").attr("class", "ion-md-cloud-done dlbutton");
        } else {
            $("#player").attr("src", file);
        }
    }
}