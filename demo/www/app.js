$(document).ready(function() {
    $("#view__main").hide();
    $("#nav").hide();
    window.setTimeout(function() {
        $("#logo__intro").hide();
        $("#view__main").show();
        $("#nav").show();
    }, 2000);
    $('.card__big').primaryColor({
        callback: function(color) {
            console.log('0px 0px 13px -1px rgba('+color+',0.75)');
            $(this).css('box-shadow', '0px 0px 13px 2px rgba('+color+',0.75)');
        }
    });
});