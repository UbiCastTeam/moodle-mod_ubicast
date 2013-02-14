/*******************************************
* Fullscreen manager                       *
* UbiCast 2009 - 2013, all rights reserved *
* Author: Stephane Diemer                  *
*******************************************/

function FullscreenManager(target) {
    // params
    this.target = target;
    this.allow_browser_fullscreen = true;
    this.iframe_mode = true;
    
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
    var target = $(this.target);
    var width = $(window).width();
    var height = $(window).height();
    if (this.iframe_mode) {
        $("iframe", target).attr("width", width).attr("height", height);
        $("iframe", target).css("width", width+"px").css("height", height+"px");
    }
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
    
    var wrapper = $("<div id=\"fullscreen_wrapper\"></div>");
    var target = $(this.target);
    target.wrap(wrapper);
    
    var original_width = target.width();
    var original_height = target.height();
    $("#fullscreen_wrapper").css("width", original_width+"px").css("height", original_height+"px");
    
    target.detach();
    target.attr("pwidth", original_width).attr("pheight", original_height);
    target.addClass("fullscreen");
    target.removeAttr("width").removeAttr("height");
    var width = $(window).width();
    var height = $(window).height();
    target.css("width", "").css("height", "");
    if (this.iframe_mode) {
        $("iframe", target).attr("width", width).attr("height", height);
        $("iframe", target).css("width", width+"px").css("height", height+"px");
    }
    
    $("body").append(target);
    
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
    
    var wrapper = $("#fullscreen_wrapper");
    var target = $(this.target);
    
    target.detach();
    target.removeClass("fullscreen");
    if (this.iframe_mode) {
        var width = target.attr("pwidth");
        var height = target.attr("pheight");
        target.css("width", width+"px").css("height", height+"px");
        $("iframe", target).attr("width", width).attr("height", height);
        $("iframe", target).css("width", width+"px").css("height", height+"px");
    }
    else
        target.css("width", "").css("height", "");
    
    wrapper.after(target);
    wrapper.remove();
    
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

