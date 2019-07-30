/**
 * Media selector script
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
/* global $ */

window.MediaSelector = function(options) {
    if (!options) {
        options = {};
    }
    if (!options.moodleURL) {
        throw new Error("moodleURL argument is mandatory.");
    }
    if (!options.mediaserverURL) {
        throw new Error("mediaserverURL argument is mandatory.");
    }
    if (!options.target) {
        throw new Error("target argument is mandatory.");
    }
    this.moodleURL = options.moodleURL;
    // The moodleURL param must be something like "/mod/ubicast/lti.php?id=1".
    this.mediaserverURL = options.mediaserverURL;
    if (this.mediaserverURL[this.mediaserverURL.length - 1] == "/") {
        this.mediaserverURL = this.mediaserverURL.slice(0, -1);
    }
    this.filterBySpeaker = options.filterBySpeaker ? true : false;
    this.target = options.target;

    var obj = this;
    $(document).ready(function() {
        obj.init();
    });
};

window.MediaSelector.prototype.init = function() {
    var initialOID = $("#" + this.target + " #id_mediaid").val();
    this.onPick(initialOID, true);

    $(window).on("message", {obj: this}, function(event) {
        var oriEvent = event && event.originalEvent ? event.originalEvent : {};
        if (oriEvent.origin !== event.data.obj.mediaserverURL) {
            return;
        }
        var data = oriEvent.data ? oriEvent.data : null;
        console.log("Received message from MediaServer frame:", data);
        if (data.state && data.state == "IDLE" || data.target !== event.data.obj.target) {
            return;
        }
        if (!data.item || !data.item.oid) {
            throw new Error("No oid in message from MediaServer page.");
        }
        event.data.obj.onPick(data.item.oid, data.initial_pick);
    });
};

window.MediaSelector.prototype.onPick = function(oid) {
    $("#" + this.target + " #id_mediaid").val(oid);
    var nextUrl = "/manager/?popup" + (this.filterBySpeaker ? "" : "&all") + "&return=postMessageAPI:" + this.target + (oid ? "&initial=" + oid : "");
    var url = this.moodleURL + "&next=" + window.encodeURIComponent(nextUrl);
    $("#" + this.target + " iframe.ubicast-iframe").attr("src", url).css("height", (oid ? 400 : 200));
};
