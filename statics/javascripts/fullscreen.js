/*******************************************
* Fullscreen manager                       *
* UbiCast 2009 - 2013, all rights reserved *
* Author: Stephane Diemer                  *
*******************************************/

function FullscreenManager(target, placeholder) {
    // params
    this.$target = $(target);
    this.$placeholder = null;
    if (placeholder)
        this.$placeholder = $(placeholder);
    this.allow_browser_fullscreen = true;
    this.iframe_mode = true;
    this.force_size_after_quit = true;
    
    // vars
    this.fullscreen_active = false;
    this.fullscreen_changing = false;
    this.listeners = {
        fullscreen: [] // event data: active
    };
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
}

FullscreenManager.prototype.add_listener = function (evtname, fct) {
    this.listeners[evtname].push(fct);
};
FullscreenManager.prototype.call_listeners = function (evtname, data) {
    for (var i = 0; i < this.listeners[evtname].length; i++) {
        var fct = this.listeners[evtname][i];
        try { fct(data); }
        catch (e) { console.log("Error when calling listener for event "+evtname+" of object "+this.constructor.name+". \nError is: "+e+" \nCalling function is: "+fct.toString()); }
    }
};

FullscreenManager.prototype.init = function () {
    var obj = this;
    
    // create placeholder if needed
    if (!this.$placeholder) {
        var id = this.$target.attr("id")+"_placeholder";
        this.$target.wrap("<div id=\""+id+"\" class=\"fm-embed-placeholder\"></div>");
        this.$placeholder = $("#"+id);
    }
    // fullscreen browser events
    if (this.allow_browser_fullscreen) {
        try {
            document.addEventListener("fullscreenchange", function () {
                obj.on_fullscreen_change(document.fullscreen);
            }, false);
            document.addEventListener("mozfullscreenchange", function () {
                obj.on_fullscreen_change(document.mozFullScreen);
            }, false);
            document.addEventListener("webkitfullscreenchange", function () {
                obj.on_fullscreen_change(document.webkitIsFullScreen);
            }, false);
        }
        catch (e) { }
    }
    // resize event
    $(window).resize(function () {
        obj.on_resize();
    });
    $(window).keypress(function (event) {
        if (obj.fullscreen_active && event.keyCode == 27)
            obj.disable_fullscreen();
    });
};

FullscreenManager.prototype.on_resize = function () {
    if (!this.fullscreen_active)
        return;
    var width = $(window).width();
    var height = $(window).height();
    this.$target.css("width", width+"px").css("height", height+"px");
    if (this.iframe_mode) {
        $("iframe", this.$target).attr("width", width).attr("height", height);
        $("iframe", this.$target).css("width", width+"px").css("height", height+"px");
    }
    else
        this.$target.css("line-height", height+"px");
};

/* fullscreen */
FullscreenManager.prototype.on_fullscreen_change = function (fullscreen_active) {
    // only allow quit from this event
    if (!fullscreen_active && this.fullscreen_active)
        this.disable_fullscreen();
};
FullscreenManager.prototype.toggle_fullscreen = function () {
    if (this.fullscreen_active)
        this.disable_fullscreen();
    else
        this.enable_fullscreen();
};
FullscreenManager.prototype.enable_fullscreen = function () {
    if (this.fullscreen_active)
        return;
    this.fullscreen_changing = true;
    this.fullscreen_active = true;
    
    this.original_width = this.$target.width();
    this.original_height = this.$target.height();
    var width = $(window).width();
    var height = $(window).height();
    if (this.$placeholder)
        this.$placeholder.css("width", this.original_width+"px").css("height", this.original_height+"px");
    this.$target.addClass("fullscreen");
    this.$target.css("width", width+"px").css("height", height+"px");
    if (this.iframe_mode) {
        $("iframe", this.$target).attr("width", width).attr("height", height);
        $("iframe", this.$target).css("width", width+"px").css("height", height+"px");
    }
    else
        this.$target.css("line-height", height+"px");
    
    if (this.allow_browser_fullscreen) {
        // open browser fullscreen
        var docElm = document.documentElement;
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        }
        else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        }
        else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        }
    }
    
    this.fullscreen_changing = false;
    
    // call listeners
    this.call_listeners("fullscreen", { active: true });
};
FullscreenManager.prototype.disable_fullscreen = function () {
    if (!this.fullscreen_active)
        return;
    this.fullscreen_changing = true;
    this.fullscreen_active = false;
    
    this.$target.removeClass("fullscreen");
    if (this.iframe_mode) {
        if (this.force_size_after_quit)
            this.$target.css("width", this.original_width+"px").css("height", this.original_height+"px");
        else
            this.$target.css("width", "").css("height", "").css("line-height", "");
        $("iframe", this.$target).attr("width", this.original_width).attr("height", this.original_height);
        $("iframe", this.$target).css("width", this.original_width+"px").css("height", this.original_height+"px");
    }
    else
        this.$target.css("width", "").css("height", "").css("line-height", "");
    if (this.$placeholder)
        this.$placeholder.css("width", "").css("height", "");
    
    if (this.allow_browser_fullscreen) {
        // close browser fullscreen
        try {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
        catch (e) { }
    }
    
    this.fullscreen_changing = false;
    
    // call listeners
    this.call_listeners("fullscreen", { active: false });
};

