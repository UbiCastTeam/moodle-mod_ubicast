/*******************************************
* Media selector script                    *
* Author: Stephane Diemer                  *
*******************************************/
/* global $ */
"use strict";

function MediaSelector(options) {
    if (!options) {
        options = {};
    }
    if (!options.moodleURL) {
        throw "moodleURL argument is mandatory.";
    }
    if (!options.mediaserverURL) {
        throw "mediaserverURL argument is mandatory.";
    }
    if (!options.target) {
        throw "target argument is mandatory.";
    }
    this.moodleURL = options.moodleURL;
    // moodleURL must be something like /mod/ubicast/lti.php?id=1
    this.mediaserverURL = options.mediaserverURL;
    if (this.mediaserverURL[this.mediaserverURL.length - 1] == "/") {
        this.mediaserverURL = this.mediaserverURL.slice(0, -1);
    }
    this.target = options.target;

    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
}

MediaSelector.prototype.init = function () {
    var initialOID = $("#id_mediaid." + this.target).val();
    this.onPick(initialOID, true);

    $(window).on("message", { obj: this }, function (event) {
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
            throw "No oid in message from MediaServer page.";
        }
        event.data.obj.onPick(data.item.oid, data.initial_pick);
    });
};

MediaSelector.prototype.onPick = function (oid) {
    $("#id_mediaid." + this.target).val(oid);
    var nextUrl = "/manager/?popup&return=postMessageAPI:" + this.target + (oid ? "&initial=" + oid : "");
    var url = this.moodleURL + "&next=" + window.encodeURIComponent(nextUrl);
    $("iframe." + this.target).attr("src", url).css("height", (oid ? 400 : 200));
};
