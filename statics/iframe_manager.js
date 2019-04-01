/* Tiny script to manage iframe height */

$(document).ready(function () {
    var on_resize = function () {
        var height = $(window).height() * 0.75;
        if (height < 250)
            height = 250;
        $(".mediaserver-iframe").css("height", height+"px");
    };
    $(window).resize(on_resize);
    on_resize();
});
