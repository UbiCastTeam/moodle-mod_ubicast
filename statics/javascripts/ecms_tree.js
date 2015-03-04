/*******************************************
* EasyCast MediaServer - Tree manager      *
* Copyright: UbiCast, all rights reserved  *
* Author: Stephane Diemer                  *
*******************************************/

function ECMSTreeManager(options) {
    // params
    this.$place = null;
    this.base_url = "";
    this.use_proxy = false;
    this.request_data = null;
    this.display_root = false;
    this.auto_init = true;
    this.current_category_oid = "0";
    this.on_change = null;
    this.on_data_retrieved = null;
    this.channels_base_url = "/channels/#";
    this.channels_url_field = "slug";
    this.api_tree = "";
    this.api_path = "";
    
    // vars
    this.$widget = null;
    this.loaded = false;
    this.loading = false;
    this.content = {};
    
    utils.setup_class(this, options, [
        // allowed options
        "$place",
        "base_url",
        "use_proxy",
        "request_data",
        "display_root",
        "auto_init",
        "current_category_oid",
        "on_change",
        "on_data_retrieved",
        "channels_base_url",
        "channels_url_field",
        "api_tree",
        "api_path"
    ]);
    this.api_manager = new ECMSAPIManager({ base_url: this.base_url, use_proxy: this.use_proxy });
    if (this.auto_init) {
        var obj = this;
        $(document).ready(function () {
            obj.init();
        });
    }
}

ECMSTreeManager.prototype.init = function () {
    if (this.loaded || this.loading)
        return;
    if (!this.$place)
        return console.log("No place defined for tree.");
    if (!this.$place.length)
        return console.log("Place for tree doesn't exist. Requested place: '"+this.$place+"'.");
    this.loading = true;
    // display link for catalog root if display_root
    var html = "<div>";
    if (this.display_root && this.on_change) {
        html += "<span id=\"tree_channel_0_link\" "+(this.current_category_oid == "0" ? "class=\"channel-active\"" : "")+">";
        html += "<span ref=\"0\" class=\"channel-btn\">"+this.translate("Catalog root")+"</span>";
        html += "</span>";
    }
    html += "<ul id=\"tree_channel_0\"></ul></div>";
    this.$widget = $(html);
    if (this.display_root && this.on_change) {
        $(".channel-btn", this.$widget).click({ obj: this }, function (evt) {
            evt.data.obj.on_change($(this).attr("ref"));
        });
    }
    
    // load catalog root
    var obj = this;
    this.load_tree("0", function (result) {
        obj.loading = false;
        obj.loaded = true;
        if (result.success) {
            // expand tree for selected category
            if (obj.current_category_oid)
                obj.expand_tree(obj.current_category_oid);
        }
        obj.$place.html("");
        obj.$place.append(obj.$widget);
    });
};
ECMSTreeManager.prototype.load_tree = function (parent_oid, callback) {
    if (this.content[parent_oid] && (this.content[parent_oid].loaded || this.content[parent_oid].loading)) {
        if (callback)
            callback({ success: true });
        return;
    }
    if (!this.content[parent_oid])
        this.content[parent_oid] = { oid: parent_oid };
    this.content[parent_oid].loading = true;

    var data = { recursive: "no" };
    if (parent_oid != "0")
        data.parent_oid = parent_oid;
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    var obj = this;
    // get place to display category tree
    var $target = $("#tree_channel_"+parent_oid, this.$widget);
    if (!$target.length) {
        this.content[parent_oid].loading = false;
        if (callback)
            callback({ success: false, error: "Target does not exist." });
        return;
    }
    // display loading if it is too long
    this.content[parent_oid].timeout = setTimeout(function () {
        obj.content[parent_oid].timeout = null;
        $target.html("<li><div class=\"loading\">"+obj.translate("Loading")+"...</div></li>");
    }, 500);
    // load category tree
    var scallback = function (response) {
        obj._ajax_cb(response, parent_oid, $target, callback);
    };
    var ecallback = function (xhr, textStatus, thrownError) {
        if (xhr.status) {
            if (xhr.status == 401)
                return obj._ajax_cb({ success: false, error: obj.translate("Unable to get channels tree because you are not logged in.") }, parent_oid, $target, callback);
            if (xhr.status == 403)
                return obj._ajax_cb({ success: false, error: obj.translate("Unable to get channels tree because you cannot access to this channel.") }, parent_oid, $target, callback);
            if (xhr.status == 404)
                return obj._ajax_cb({ success: false, error: obj.translate("Channel does not exist.") }, parent_oid, $target, callback);
            if (xhr.status == 500)
                return obj._ajax_cb({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") }, parent_oid, $target, callback);
        }
        if (textStatus == "timeout")
            obj._ajax_cb({ success: false, error: obj.translate("Unable to get channels tree. Request timed out.") }, parent_oid, $target, callback);
        else
            obj._ajax_cb({ success: false, error: obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError }, parent_oid, $target, callback);
    };
    if (this.api_tree) {
        var url = this.base_url;
        if (this.use_proxy)
            data.action = this.api_tree;
        else
            url += this.api_tree;
        $.ajax({
            url: url,
            data: data,
            dataType: "json",
            cache: false,
            success: scallback,
            error: ecallback
        });
    } else {
        this.api_manager.ajax_call("get_channels_tree", data, obj._ajax_cb, scallback, ecallback);
    }
};
ECMSTreeManager.prototype._ajax_cb = function (result, parent_oid, $target, callback) {
    if (this.content[parent_oid].timeout) {
        clearTimeout(this.content[parent_oid].timeout);
        delete this.content[parent_oid].timeout;
    }
    if (result.success) {
        if (result.channels) {
            // get html
            var html = "";
            for (var i=0; i < result.channels.length; i++) {
                var channel = result.channels[i];
                if (parent_oid != "0") {
                    channel.parent_oid = parent_oid;
                    channel.parent_title = this.content[parent_oid] ? this.content[parent_oid].title : "load error";
                }
                else {
                    channel.parent_oid = "0";
                    channel.parent_title = this.translate("Catalog root");
                }
                if (!this.content[channel.oid])
                    this.content[channel.oid] = channel;
                else {
                    for (var field in channel) {
                        this.content[channel.oid][field] = channel[field];
                    }
                }
                if (this.on_data_retrieved)
                    this.on_data_retrieved(channel);
                var button = "<span class=\"list-none\"></span>";
                if (channel.channels)
                    button = "<span ref=\""+channel.oid+"\" class=\"channel-toggle list-entry\"></span>";
                html += "<li><div id=\"tree_channel_"+channel.oid+"_link\" "+(this.current_category_oid == channel.oid ? "class=\"channel-active\"" : "")+">"+button;
                if (this.on_change)
                    html += "<span ref=\""+channel.oid+"\" class=\"channel-btn\">"+utils.escape_html(channel.title)+"</span>";
                else
                    html += "<a href=\""+this.channels_base_url+channel[this.channels_url_field]+"\" class=\"channel-btn\">"+utils.escape_html(channel.title)+"</a>";
                html += "</div><ul id=\"tree_channel_"+channel.oid+"\"></ul></li>";
            }
            var $html = $(html);
            $target.html("");
            $target.append($html);
            // bind click events
            if (this.on_change) {
                $(".channel-btn", $html).click({ obj: this }, function (evt) {
                    evt.data.obj.on_change($(this).attr("ref"));
                });
            }
            $(".channel-toggle", $html).click({ obj: this }, function (evt) {
                evt.data.obj.toggle_channel($(this).attr("ref"));
            });
        }
        this.content[parent_oid].loaded = true;
    }
    else if (result.error) {
        $target.html("<li><div class=\"error\">"+result.error+"</div></li>");
    }
    else {
        $target.html("<li><div class=\"error\">"+this.translate("No information about error.")+"</div></li>");
    }
    this.content[parent_oid].loading = false;
    
    if (callback)
        callback(result);
};
ECMSTreeManager.prototype.expand_tree = function (oid) {
    if (oid == "0" || !this.loaded || this.loading)
        return;
    // get path of category and open all levels
    var obj = this;
    var callback = function (path) {
        if (path.length > 0) {
            var cat_oid = path.shift().oid;
            obj.load_tree(cat_oid, function (result) {
                if (result.success)
                    callback(path);
            });
        }
        else {
            var cat = obj.content[oid];
            while (cat) {
                $("#tree_channel_"+cat.oid, obj.$widget).css("display", "block");
                $("#tree_channel_"+cat.oid+"_link .channel-toggle", obj.$widget).addClass("opened");
                cat = obj.content[cat.parent_oid];
            }
        }
    };
    // check that the path is known
    if (!this.content[oid] || this.content[oid].parent_oid === undefined) {
        this.load_path(oid, function (result) {
            var path = result.path;
            if (!path)
                path = [];
            if (!obj.content[oid])
                obj.content[oid] = { oid: oid };
            path.push(obj.content[oid]);
            callback(path);
        });
    }
    else {
        var path = [];
        var cat = obj.content[oid];
        while (cat) {
            path.push(cat);
            cat = obj.content[cat.parent_oid];
        }
        path.reverse();
        callback(path);
    }
};
ECMSTreeManager.prototype.open_tree = function (oid) {
    $("#tree_channel_"+oid, this.$widget).css("display", "block");
    $("#tree_channel_"+oid+"_link .channel-toggle", this.$widget).addClass("opened");
    this.load_tree(oid);
};
ECMSTreeManager.prototype.close_tree = function (oid) {
    $("#tree_channel_"+oid, this.$widget).css("display", "none");
    $("#tree_channel_"+oid+"_link .channel-toggle", this.$widget).removeClass("opened");
};
ECMSTreeManager.prototype.toggle_channel = function (oid) {
    var $btn = $("#tree_channel_"+oid+"_link .channel-toggle", this.$widget);
    if ($btn.hasClass("opened"))
        this.close_tree(oid);
    else
        this.open_tree(oid);
};

ECMSTreeManager.prototype.set_active = function (oid) {
    if (this.current_category_oid == oid)
        return;
    $("#tree_channel_"+this.current_category_oid+"_link", this.$widget).removeClass("channel-active");
    this.current_category_oid = oid;
    $("#tree_channel_"+this.current_category_oid+"_link", this.$widget).addClass("channel-active");
    this.open_tree(oid);
};


ECMSTreeManager.prototype.load_path = function (oid, callback) {
    var data = { oid: oid };

    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    var scallback = function (response) {
        if (!response.success)
        console.log("Error getting path for oid "+oid+". Error: "+response.error);
        callback(response);
    };
    var ecallback = function (xhr, textStatus, thrownError) {
        console.log("Error getting path for oid "+oid+". Error: "+textStatus+" | "+thrownError);
        callback({ success: false, error: textStatus+" | "+thrownError });
    };
    if (this.api_path) {
        var url = this.base_url;
        if (this.use_proxy)
            data.action = this.api_path;
        else
            url += this.api_path;
        $.ajax({
            url: url,
            data: data,
            dataType: "json",
            cache: false,
            success: scallback,
            error: ecallback
        });
    } else {
        this.api_manager.ajax_call("get_channels_path", data, callback, scallback, ecallback);
    }
};

