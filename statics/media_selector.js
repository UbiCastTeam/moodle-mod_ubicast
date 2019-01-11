/*******************************************
* Media selector script                    *
* Author: Stephane Diemer                  *
*******************************************/
/* globals OverlayDisplayManager */
"use strict";

function MediaSelector(options) {
    if (!options)
        options = {};
    if (!options.moodleURL)
        throw "moodleURL argument is mandatory.";
    if (!options.mediaserverURL)
        throw "mediaserverURL argument is mandatory.";
    this.moodleURL = options.moodleURL;
    // moodleURL must be something like /mod/easycastms/lti.php?id=1
    this.mediaserverURL = options.mediaserverURL;
    if (this.mediaserverURL[this.mediaserverURL.length - 1] == "/")
        this.mediaserverURL = this.mediaserverURL.slice(0, -1);
    this.title = options.title ? options.title : "Select media";
    this.overlay = null;

    var obj = this;
    $(document).ready(function () {
        var initialOID = $("#id_mediaid").val();
        if (initialOID)
            obj.onPick(initialOID, true);
    });
}

MediaSelector.prototype.open = function () {
    if (!this.overlay) {
        this.overlay = new OverlayDisplayManager();
        $(window).on("message", { obj: this }, function (event) {
            var oriEvent = event && event.originalEvent ? event.originalEvent : {};
            if (oriEvent.origin !== event.data.obj.mediaserverURL)
                return;
            var data = oriEvent.data ? oriEvent.data : null;
            console.log("Received message from MediaServer frame:", data);
            if (!data.element || !data.element.oid)
                throw "No oid in message from MediaServer page.";
            event.data.obj.onPick(data.element.oid, data.initial_pick);
        });
    }
    var initialOID = $("#id_mediaid").val();
    var url = this.moodleURL + "&next=" + window.encodeURIComponent("/latest/?iframe&mine&pick=vl" + (initialOID ? "&initial=" + initialOID : ""));
    this.overlay.show({
        mode: "iframe",
        title: this.title,
        iframe: url
    });
};

MediaSelector.prototype.onPick = function (oid, initial_pick) {
    $("#id_mediaid").val(oid);
    var url = this.moodleURL + "&next=" + window.encodeURIComponent("/card/" + oid + "/");
    $("#mod_ms_browser_preview iframe").attr("src", url);
    if (!initial_pick)
        this.overlay.hide();
};
