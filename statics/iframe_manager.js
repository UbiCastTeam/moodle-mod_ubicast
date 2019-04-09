/**
 * Tiny script to manage iframe height
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
/* global $ */
"use strict";

$(document).ready(function() {
    var onResize = function() {
        var height = $(window).height() * 0.75;
        if (height < 250) {
            height = 250;
        }
        $(".mediaserver-iframe").css("height", height + "px");
    };
    $(window).resize(onResize);
    onResize();
});
