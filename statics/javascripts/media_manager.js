/*******************************************
* Media manager                            *
* UbiCast 2009 - 2012, all rights reserved *
* Author: Stephane Diemer                  *
*******************************************/

function MediaManager(media_id) {
    // params
    this.media_id = media_id;
    
    // vars
    this.min_height = 350;
    this.$iframe = null;
    this.fullscreen_manager = new FullscreenManager("#easycastms_"+this.media_id);
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
}

MediaManager.prototype.init = function () {
    this.$iframe = $("#easycastms_"+this.media_id+" iframe");
    var obj = this;
    $(window).resize(function() {
        obj.on_resize();
    });
    this.on_resize();
};

MediaManager.prototype.on_resize = function () {
    if (!this.fullscreen_manager.fullscreen_active) {
        var height = $(window).height() - 50;
        if (isNaN(height) || height < this.min_height)
            height = this.min_height;
        this.$iframe.css("height", height+"px");
    }
};

MediaManager.prototype.toggle_fullscreen = function () {
    this.fullscreen_manager.toggle_fullscreen();
};

