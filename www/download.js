downloading = false;
function download(file, secret) {
    if (!downloading) {
        if (debug) {
            console.log("Download: " + secret + "\n" + file);
        }
        downloading = true;
        $("#dlbtn-"+secret).html("<span class=\"msg-download\">Downloading</span>...");
        $("#player2").attr("src", file);
        $.get(file, function(data) {
            localStorage.setItem("file-"+secret, data);
            $("#dlbtn-"+secret).html("<i class=\"ion-md-checkmark-circle downloaded\"></ion-icon>");
            window.setTimeout(function() {
                if (!localStorage.getItem("downloaded")) {
                    localStorage.setItem("downloaded", secret);
                } else {
                    localStorage.setItem("downloaded", localStorage.getItem("downloaded") + "," + secret);
                }
                downloading = false;
                $("#player2").attr("src", "");
            }, 800);
        })
    }
}