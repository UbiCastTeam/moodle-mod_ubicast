/*******************************************
* Catalog browser                          *
* Copyright: UbiCast, all rights reserved  *
* Author: Stephane Diemer                  *
*******************************************/

function CatalogBrowser(options) {
    // params
    this.title = "";
    this.base_url = "";
    this.use_proxy = false;
    this.course_id = "";
    this.selectable_content = "vlp"; // v for videos, l for lives, p for photos group and c for channels
    this.displayable_content = "cvlp";
    this.filter_validated = null;
    this.parent_link_icon = "";
    this.input = "";
    this.preview = "";
    this.on_pick = null;
    this.language = "en";
    
    // vars
    this.tree_loaded = false;
    this.translations = {};
    this.api_tree_path = "/api/v2/channels/tree/";
    this.api_content_path = "/api/v2/channels/content/";
    this.api_get_category = "/api/v2/channels/get/";
    this.api_get_media = "/api/v2/medias/get/";
    this.api_search = "/api/v2/search/";
    this.messages_displayed = { tree: true, list: true, search: true };
    this.catalog = {};
    this.current_category = null;
    this.last_pick = null;
    this.displayed = "list";
    this.$widgets = {};
    
    // set options
    this.allowed_options = [
        "title",
        "base_url",
        "use_proxy",
        "course_id",
        "selectable_content",
        "displayable_content",
        "filter_validated",
        "parent_link_icon",
        "input",
        "preview",
        "on_pick",
        "language"
    ];
    if (options)
        this.set_options(options);
    this.set_language(this.language);
    
    this.overlay = new OverlayDisplayer({ language: this.language });
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
}

CatalogBrowser.prototype.set_options = function(options) {
    for (var i = 0; i < this.allowed_options.length; i++) {
        if (this.allowed_options[i] in options)
            this[this.allowed_options[i]] = options[this.allowed_options[i]];
    }
};

CatalogBrowser.prototype.translate = function (text) {
    if (text in this.translations)
        return this.translations[text];
    return text;
};

CatalogBrowser.prototype.init = function () {
    var obj = this;
    // build widget structure
    var html = "<div class=\"catalogbrowser cb-display-list\">";
    html += "<div class=\"cb-left\">";
    html +=     "<div class=\"cb-column\">";
    html +=         "<div class=\"cb-title\">";
    html +=             "<div class=\"cb-tab cb-tab-list\">"+this.translate("Channels list")+"</div>";
    html +=             "<div class=\"cb-tab cb-tab-search\">"+this.translate("Search")+"</div>";
    html +=         "</div>";
    html +=         "<div class=\"cb-container cb-left-list\">";
    html +=             "<div class=\"cb-message\">";
    html +=                 "<div class=\"loading\">"+this.translate("Loading")+"...</div>";
    html +=             "</div>";
    html +=             "<div class=\"cb-tree\"></div>";
    html +=         "</div>";
    html +=         "<div class=\"cb-container cb-left-search\">";
    html +=             "<form class=\"cb-search-block\" method=\"get\" action=\".\" onsubmit=\"javascript: return false;\">";
    html +=                 "<label class=\"cb-search-title\" for=\"catalog_browser_search\">"+this.translate("Search:")+"</label>";
    html +=                 " <div class=\"cb-search-input\"><input id=\"catalog_browser_search\" type=\"text\" value=\"\">";
    html +=                 " <input id=\"catalog_browser_search_start\" type=\"submit\" value=\""+this.translate("Go")+"\"></div>";
    html +=             "</form>";
    html +=             "<div class=\"cb-search-block\">";
    html +=                 "<div class=\"cb-search-title\">"+this.translate("Search in:")+"</div>";
    html +=                 " <div><input id=\"catalog_browser_search_in_titles\" type=\"checkbox\" checked=\"checked\">";
    html +=                 " <label for=\"catalog_browser_search_in_titles\">"+this.translate("titles")+"</label></div>";
    html +=                 " <div><input id=\"catalog_browser_search_in_descriptions\" type=\"checkbox\" checked=\"checked\">";
    html +=                 " <label for=\"catalog_browser_search_in_descriptions\">"+this.translate("descriptions")+"</label></div>";
    html +=                 " <div><input id=\"catalog_browser_search_in_keywords\" type=\"checkbox\" checked=\"checked\">";
    html +=                 " <label for=\"catalog_browser_search_in_keywords\">"+this.translate("keywords")+"</label></div>";
    if (this.displayable_content.length > 1 || this.displayable_content.indexOf("c") == -1) {
        html +=             " <div><input id=\"catalog_browser_search_in_licenses\" type=\"checkbox\">";
        html +=             " <label for=\"catalog_browser_search_in_licenses\">"+this.translate("licenses")+"</label></div>";
        html +=             " <div><input id=\"catalog_browser_search_in_companies\" type=\"checkbox\">";
        html +=             " <label for=\"catalog_browser_search_in_companies\">"+this.translate("companies")+"</label></div>";
    }
    if (this.displayable_content.indexOf("v") != -1) {
        html +=             " <div><input id=\"catalog_browser_search_in_chapters\" type=\"checkbox\" checked=\"checked\">";
        html +=             " <label for=\"catalog_browser_search_in_chapters\">"+this.translate("chapters")+"</label></div>";
    }
    if (this.displayable_content.indexOf("v") != -1 || this.displayable_content.indexOf("p") != -1) {
        html +=             " <div><input id=\"catalog_browser_search_in_photos\" type=\"checkbox\" checked=\"checked\">";
        html +=             " <label for=\"catalog_browser_search_in_photos\">"+this.translate("photos")+"</label></div>";
    }
    html +=             "</div>";
    if (this.displayable_content.length > 1) {
        html +=         "<div class=\"cb-search-block\">";
        html +=             "<div class=\"cb-search-title\">"+this.translate("Search for:")+"</div>";
        if (this.displayable_content.indexOf("c") != -1) {
            html +=         " <div><input id=\"catalog_browser_search_for_categories\" type=\"checkbox\" checked=\"checked\">";
            html +=         " <label for=\"catalog_browser_search_for_categories\">"+this.translate("categories")+"</label></div>";
        }
        if (this.displayable_content.indexOf("v") != -1) {
            html +=         " <div><input id=\"catalog_browser_search_for_videos\" type=\"checkbox\" checked=\"checked\">";
            html +=         " <label for=\"catalog_browser_search_for_videos\">"+this.translate("videos")+"</label></div>";
        }
        if (this.displayable_content.indexOf("l") != -1) {
            html +=         " <div><input id=\"catalog_browser_search_for_lives\" type=\"checkbox\" checked=\"checked\">";
            html +=         " <label for=\"catalog_browser_search_for_lives\">"+this.translate("live streams")+"</label></div>";
        }
        if (this.displayable_content.indexOf("p") != -1) {
            html +=         " <div><input id=\"catalog_browser_search_for_photos\" type=\"checkbox\" checked=\"checked\">";
            html +=         " <label for=\"catalog_browser_search_for_photos\">"+this.translate("photos groups")+"</label></div>";
        }
        html +=         "</div>";
    }
    html +=         "</div>";
    html +=     "</div>";
    html += "</div>";
    html += "<div class=\"cb-right\">";
    html +=     "<div class=\"cb-column cb-column-list\">";
    html +=         "<div class=\"cb-title\">"+this.translate("Channel's content")+"</div>";
    html +=         "<div class=\"cb-container\">";
    html +=             "<div class=\"cb-message\">";
    html +=                 "<div class=\"info\">"+this.translate("Select a channel to display its content.")+"</div>";
    html +=             "</div>";
    html +=             "<div class=\"cb-content\"></div>";
    html +=         "</div>";
    html +=     "</div>";
    html +=     "<div class=\"cb-column cb-column-search\">";
    html +=         "<div class=\"cb-title\">"+this.translate("Search results")+" <span></span></div>";
    html +=         "<div class=\"cb-container\">";
    html +=             "<div class=\"cb-message\">";
    html +=                 "<div class=\"info\">"+this.translate("Use the input in the left column to search for something.")+"</div>";
    html +=             "</div>";
    html +=             "<div class=\"cb-content\"></div>";
    html +=         "</div>";
    html +=     "</div>";
    html += "</div>";
    html += "</div>";
    this.$widgets.main = $(html);
    
    // get elements
    this.$widgets.tree = $(".cb-left .cb-tree", this.$widgets.main);
    this.$widgets.column_list = $(".cb-column-list", this.$widgets.main);
    this.$widgets.column_search = $(".cb-column-search", this.$widgets.main);
    this.$widgets.content_list = $(".cb-content", this.$widgets.column_list);
    this.$widgets.content_search = $(".cb-content", this.$widgets.column_search);
    this.$widgets.message_tree = $(".cb-left .cb-message", this.$widgets.main);
    this.$widgets.message_list = $(".cb-message", this.$widgets.column_list);
    this.$widgets.message_search = $(".cb-message", this.$widgets.column_search);
    this.$widgets.search_form = $(".cb-left-search", this.$widgets.main);
    this.$widgets.search_results = $(".cb-title span", this.$widgets.column_search);
    if (this.input)
        this.$widgets.input = $(this.input);
    if (this.preview) {
        this.$widgets.preview = $(this.preview);
        this.$widgets.preview_img = $("img", this.$widgets.preview);
        this.$widgets.preview_title = $("div", this.$widgets.preview);
    }
    
    // get current media info
    if (this.input) {
        var identifier = this.$widgets.input.val();
        if (identifier) {
            var callback = function (result) {
                if (result.success) {
                    obj.catalog[identifier] = result.info;
                    obj.pick(identifier);
                }
                else
                    obj.$widgets.preview_title.html(result.error);
            };
            this.get_info(identifier, false, callback);
        }
    }
    
    // events
    $(".cb-tab-list", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("list"); });
    $(".cb-tab-search", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("search"); });
    $("form", this.$widgets.main).submit({ obj: this }, function (evt) { evt.data.obj.on_search_submit(); });
    $(window).resize(function () {
        obj.resize();
    });
    this.resize();
};

CatalogBrowser.prototype.change_tab = function (tab_id) {
    if (this.$widgets.main.hasClass("cb-display-"+tab_id))
        return;
    this.$widgets.main.removeClass("cb-display-"+this.displayed).addClass("cb-display-"+tab_id);
    this.displayed = tab_id;
};

CatalogBrowser.prototype.open = function () {
    if (!this.tree_loaded) {
        this.tree_loaded = true;
        // init tree
        this.get_tree();
        // load catalog root
        if (this.current_category === null && this.displayable_content.indexOf("c") != -1)
            this.display_channel("0");
    }
    var obj = this;
    this.overlay.show({
        mode: "html",
        title: this.title,
        html: this.$widgets.main,
        on_hide: function () { obj.$widgets.main.detach(); }
    });
};


CatalogBrowser.prototype.get_info = function (identifier, full, callback) {
    if (!identifier || !callback)
        return;
    var url = this.base_url;
    var data = {};
    if (full)
        data.full = "yes";
    if (this.use_proxy)
        data.course_id = this.course_id;
    if (identifier[0] == "v" || identifier[0] == "l" || identifier[0] == "p") {
        // media
        data.media_id = identifier;
        if (this.use_proxy)
            data.action = this.api_get_media;
        else
            url += this.api_get_media;
    }
    else {
        // category
        data.id = identifier;
        if (this.use_proxy)
            data.action = this.api_get_category;
        else
            url += this.api_get_category;
    }
    var obj = this;
    $.ajax({
        url: url,
        data: data,
        dataType: "json",
        cache: false,
        success: function (response) {
            callback(response);
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get media's information. Request timed out.") });
        },
        statusCode: {
            401: function () {
                callback({ success: false, error: obj.translate("Unable to get media's information because you are not logged in.") });
            },
            403: function () {
                callback({ success: false, error: obj.translate("Unable to get media's information because you cannot access to this media.") });
            },
            404: function () {
                callback({ success: false, error: obj.translate("Media does not exist.") });
            },
            500: function () {
                callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
        }
    });
};


CatalogBrowser.prototype.get_tree = function () {
    var url = this.base_url;
    var data = {};
    if (this.use_proxy) {
        data.course_id = this.course_id;
        data.action = this.api_tree_path;
    }
    else
        url += this.api_tree_path;
    var obj = this;
    $.ajax({
        url: url,
        data: data,
        dataType: "json",
        cache: false,
        success: function (response) {
            if (response.success) {
                obj.hide_message("tree");
                obj.display_tree(response);
            }
            else
                obj.display_message("tree", response.error ? response.error : obj.translate("No information about error."));
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout")
                obj.display_message("tree", obj.translate("Unable to get channels. Request timed out."));
            else
                obj.display_message("tree", obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError);
        }
    });
};
CatalogBrowser.prototype.display_tree = function (data) {
    if (!data.channels)
        return;
    var html = this._display_tree(data);
    this.$widgets.tree.html(html);
    $(".channel-btn", this.$widgets.tree).click({ obj: this }, function (evt) {
        evt.data.obj.display_channel($(this).attr("ref"));
    });
    $(".channel-toggle", this.$widgets.tree).click({ obj: this }, function (evt) {
        evt.data.obj.toggle_channel($(this).attr("ref"));
    });
};
CatalogBrowser.prototype._display_tree = function (data) {
    if (!data.channels)
        return "";
    var id = data.id ? data.id : 0;
    var html = "";
    // display link for catalog root if "c" in this.displayable_content
    if (id == 0 && this.displayable_content.indexOf("c") != -1) {
        html += "<span id=\"tree_channel_0_link\" "+(this.current_category == "0" ? "class=\"channel-active\"" : "")+">";
        html += "<span ref=\"0\" class=\"channel-btn\" title=\""+this.translate("Click to display all channels in catalog root")+"\">"+this.translate("Catalog root")+"</span>";
        html += "</span>";
    }
    html += "<ul id=\"tree_channel_"+id+"\">";
    for (var i=0; i < data.channels.length; i++) {
        var channel = data.channels[i];
        this.catalog[channel.id] = channel;
        var button = "<span class=\"list-none\"></span>";
        var sub_channels = "";
        if (channel.channels && channel.channels.length > 0) {
            sub_channels = this._display_tree(channel);
            button = "<span ref=\""+channel.id+"\" class=\"channel-toggle list-entry\"></span>";
        }
        html += "<li><span id=\"tree_channel_"+channel.id+"_link\" "+(this.current_category == channel.id ? "class=\"channel-active\"" : "")+">"+button;
        html +=     "<span ref=\""+channel.id+"\" class=\"channel-btn\" title=\""+this.translate("Click to display the content of this channel")+"\">"+channel.name+"</span></span>";
        html += sub_channels;
        html += "</li>";
    }
    html += "</ul>";
    return html;
};

CatalogBrowser.prototype.toggle_channel = function (id) {
    if ($("#tree_channel_"+id, this.$widgets.tree).is(":visible")) {
        $("#tree_channel_"+id, this.$widgets.tree).css("display", "none");
        $("#tree_channel_"+id+"_link .channel-toggle", this.$widgets.tree).removeClass("opened");
    }
    else {
        $("#tree_channel_"+id, this.$widgets.tree).css("display", "block");
        $("#tree_channel_"+id+"_link .channel-toggle", this.$widgets.tree).addClass("opened");
    }
};




CatalogBrowser.prototype.display_channel = function (cat_id) {
    if (this.current_category !== null)
        $("#tree_channel_"+this.current_category+"_link", this.$widgets.tree).removeClass("channel-active");
    this.change_tab("list");
    this.current_category = cat_id;
    $("#tree_channel_"+this.current_category+"_link", this.$widgets.tree).addClass("channel-active");
    $("#tree_channel_"+cat_id, this.$widgets.tree).css("display", "block");
    $("#tree_channel_"+cat_id+"_link .channel-toggle", this.$widgets.tree).addClass("opened");
    var url = this.base_url;
    var data = {};
    if (cat_id && cat_id != "0")
        data.parent_id = cat_id;
    if (this.displayable_content)
        data.content = this.displayable_content;
    if (this.filter_validated !== null) {
        if (this.filter_validated)
            data.validated = "yes";
        else
            data.validated = "no";
    }
    if (this.use_proxy) {
        data.course_id = this.course_id;
        data.action = this.api_content_path;
    }
    else
        url += this.api_content_path;
    var obj = this;
    this.list_loading_timeout = setTimeout(function () {
        obj.display_message("list", obj.translate("Loading")+"...", "loading");
        obj.list_loading_timeout = null;
    }, 500);
    var callback = function (response) {
        if (response.success) {
            obj.hide_message("list");
            obj.display_content("list", response, cat_id);
        }
        else {
            obj.$widgets.content_list.html("");
            obj.display_message("list", response.error);
        }
        if (obj.list_loading_timeout)
            clearTimeout(obj.list_loading_timeout);
    };
    $.ajax({
        url: url,
        data: data,
        dataType: "json",
        cache: false,
        success: function (response) {
            if (!response.success)
                response.error = response.error ? response.error : obj.translate("No information about error.");
            callback(response);
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get channel's content. Request timed out.") });
        },
        statusCode: {
            401: function () {
                callback({ success: false, error: obj.translate("You are not logged in. Please login in Moodle and retry.") });
            },
            403: function () {
                callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
            },
            404: function () {
                callback({ success: false, error: obj.translate("Requested channel does not exist.") });
            },
            500: function () {
                callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
        }
    });
};
CatalogBrowser.prototype.display_content = function (target, data, cat_id) {
    var $container = this.$widgets["content_"+target];
    var selectable;
    var nb_channels = data.channels ? data.channels.length : 0;
    var nb_videos = data.videos ? data.videos.length : 0;
    var nb_live_streams = data.live_streams ? data.live_streams.length : 0;
    var nb_photos_groups = data.photos_groups ? data.photos_groups.length : 0;
    var sections = ((nb_channels > 0) ? 1 : 0) + ((nb_videos > 0) ? 1 : 0) + ((nb_live_streams > 0) ? 1 : 0) + ((nb_photos_groups > 0) ? 1 : 0);
    $container.html("");
    if (cat_id === undefined) {
        if (sections > 0) {
            // search result
            var results = [];
            if (nb_channels > 0)
                results.push(nb_channels+" "+this.translate("channel(s)"));
            if (nb_videos > 0)
                results.push(nb_videos+" "+this.translate("video(s)"));
            if (nb_live_streams > 0)
                results.push(nb_live_streams+" "+this.translate("live stream(s)"));
            if (nb_photos_groups > 0)
                results.push(nb_photos_groups+" "+this.translate("photos group(s)"));
            this.$widgets.search_results.html(results.join(", "));
        }
        else {
            this.display_message(target, this.translate("No results."), "info");
            this.$widgets.search_results.html("");
            return;
        }
    }
    else {
        // category display
        if (cat_id != "0" && this.displayable_content.indexOf("c") != -1) {
            // parent link
            selectable = this.selectable_content.indexOf("c") != -1;
            $container.append(this.get_content_entry("channel", {
                id: (this.catalog[cat_id] && this.catalog[cat_id].parent_id) ? this.catalog[cat_id].parent_id : 0,
                name: this.translate("Parent channel"),
                thumb: this.parent_link_icon
            }, selectable, true));
        }
        if (sections == 0) {
            if (this.displayable_content.indexOf("c")) {
                if (this.displayable_content.length > 1)
                    this.display_message(target, this.translate("This channel contains no sub channels and no medias."), "info");
                else
                    this.display_message(target, this.translate("This channel contains no sub channels."), "info");
            }
            else
                this.display_message(target, this.translate("This channel contains no medias."), "info");
            return;
        }
    }
    if (data.channels && data.channels.length > 0) {
        // sub categories
        selectable = this.selectable_content.indexOf("c") != -1;
        if (sections > 1) {
            if (cat_id === undefined)
                $container.append("<div class=\"cb-section\">"+this.translate("Channels")+"</div>");
            else
                $container.append("<div class=\"cb-section\">"+this.translate("Sub channels")+"</div>");
        }
        for (var i=0; i < data.channels.length; i++) {
            if (!data.channels[i].parent_id !== undefined && cat_id !== undefined)
                data.channels[i].parent_id = cat_id;
            $container.append(this.get_content_entry("channel", data.channels[i], selectable));
        }
    }
    if (data.live_streams && data.live_streams.length > 0) {
        // live streams
        selectable = this.selectable_content.indexOf("l") != -1;
        if (sections > 1)
            $container.append("<div class=\"cb-section\">"+this.translate("Lives streams")+"</div>");
        for (var i=0; i < data.live_streams.length; i++) {
            $container.append(this.get_content_entry("live", data.live_streams[i], selectable));
        }
    }
    if (data.videos && data.videos.length > 0) {
        // videos
        selectable = this.selectable_content.indexOf("v") != -1;
        if (sections > 1)
            $container.append("<div class=\"cb-section\">"+this.translate("Videos")+"</div>");
        for (var i=0; i < data.videos.length; i++) {
            $container.append(this.get_content_entry("video", data.videos[i], selectable));
        }
    }
    if (data.photos_groups && data.photos_groups.length > 0) {
        // photos groups
        selectable = this.selectable_content.indexOf("p") != -1;
        if (sections > 1)
            $container.append("<div class=\"cb-section\">"+this.translate("Photos groups")+"</div>");
        for (var i=0; i < data.photos_groups.length; i++) {
            $container.append(this.get_content_entry("photos", data.photos_groups[i], selectable));
        }
    }
};
CatalogBrowser.prototype.get_content_entry = function (item_type, item, selectable, no_save) {
    var identifier = item.media_id ? item.media_id : item.id;
    if (!no_save)
        this.catalog[identifier] = item;
    
    var $entry = $("<div class=\"item-entry type-"+item_type+"\" id=\""+item_type+"_"+identifier+"\"></div>");
    
    var html = "<div class=\"item-entry-link "+(selectable || item_type == "channel" ? "clickable" : "")+"\">";
    html +=     "<span class=\"item-entry-preview\"><img src=\""+item.thumb+"\"/></span>";
    html +=     "<span class=\"item-entry-content\">";
    html +=         "<span class=\"item-entry-top-bar\">";
    if (item_type == "channel")
        html +=         "<span class=\"item-entry-title\">"+item.name+"</span>";
    else
        html +=         "<span class=\"item-entry-title\">"+item.title+"</span>";
    if (item.can_edit) {
        if (item.accessibility !== undefined) {
            var atext;
            switch (item.accessibility) {
                case "all": atext = "Accessible for all users"; break;
                case "auth": atext = "Accessible only for authenticated users"; break;
                case "perm": atext = "Accessible only for authenticated users with access right"; break;
                case "": atext = "Inaccessible for all users"; break;
            }
            if (atext)
                html +=     "<span class=\"item-entry-accessibility "+item.accessibility+"\" title=\""+this.translate(atext)+"\"></span>";
        }
        if (item.visibility !== undefined) {
            var vtext;
            switch (item.visibility) {
                case "all": vtext = "Visible for all users"; break;
                case "auth": vtext = "Visible only for authenticated users"; break;
                case "perm": vtext = "Visible only for authenticated users with access right"; break;
                case "": vtext = "Invisible for all users"; break;
            }
            if (atext)
                html +=     "<span class=\"item-entry-visibility "+item.visibility+"\" title=\""+this.translate(vtext)+"\"></span>";
        }
        if (item_type != "channel") {
            if (item.validated)
                html +=     "<span class=\"item-entry-publication published\" title=\""+this.translate("This media is published")+"\"></span>";
            else
                html +=     "<span class=\"item-entry-publication\" title=\""+this.translate("This media is not published")+"\"></span>";
        }
        if (item_type == "video" && !item.ready)
            html +=         "<span class=\"item-entry-state\" title=\""+this.translate("This video is not ready")+"\"></span>";
    }
    if (item.duration)
        html +=         "<span class=\"item-entry-duration\">"+item.duration+"</span>";
    html +=         "</span>";
    if (item.creation) {
        html +=     "<span class=\"item-entry-bottom-bar\">";
        html +=         "<span class=\"item-entry-creation\">"+this.get_date_display(item.creation)+"</span>";
        html +=     "</span>";
    }
    html +=     "</span>";
    html += "</div>";
    var $entry_block = $(html);
    if (item_type == "channel")
        $entry_block.click({ obj: this, identifier: identifier }, function (evt) { evt.data.obj.display_channel(evt.data.identifier) });
    else if (selectable)
        $entry_block.click({ obj: this, identifier: identifier }, function (evt) { evt.data.obj.pick(evt.data.identifier) });
    $entry.append($entry_block);
    
    html = "<div class=\"item-entry-links\">";
    if (item_type == "channel") {
        html +=     "<span class=\"std-btn item-entry-display\">"+this.translate("Display channel")+"</span>";
        if (selectable)
            html +  "<span class=\"std-btn item-entry-pick\">"+this.translate("Select this channel")+"</span>";
    }
    else if (selectable)
        html +=     "<span class=\"std-btn item-entry-pick\">"+this.translate("Select this media")+"</span>";
    html += "</div>";
    var $entry_links = $(html);
    if (item_type == "channel")
        $(".item-entry-display", $entry_links).click({ obj: this, identifier: identifier }, function (evt) { evt.data.obj.display_channel(evt.data.identifier) });
    if (selectable)
        $(".item-entry-pick", $entry_links).click({ obj: this, identifier: identifier }, function (evt) { evt.data.obj.pick(evt.data.identifier) });
    $entry.append($entry_links);
    
    return $entry;
};

CatalogBrowser.prototype.pick = function (identifier) {
    this.last_pick = this.catalog[identifier];
    if (this.$widgets.input)
        this.$widgets.input.val(identifier);
    if (this.$widgets.preview) {
        this.$widgets.preview_img.attr("src", this.catalog[identifier].thumb);
        this.$widgets.preview_title.html(this.catalog[identifier].title);
    }
    if (this.on_pick)
        this.on_pick(this.catalog[identifier]);
    this.overlay.hide();
};
CatalogBrowser.prototype.get_last_pick = function () {
    return this.last_pick;
};



CatalogBrowser.prototype.on_search_submit = function (place, text, type) {
    // get fields to search in
    var fields = "";
    if ($("#catalog_browser_search_in_titles", this.$widgets.search_form).is(":checked"))
        fields += "_title";
    if ($("#catalog_browser_search_in_descriptions", this.$widgets.search_form).is(":checked"))
        fields += "_description";
    if ($("#catalog_browser_search_in_keywords", this.$widgets.search_form).is(":checked"))
        fields += "_keywords";
    if (this.displayable_content.length > 1 || this.displayable_content.indexOf("c") == -1) {
        if ($("#catalog_browser_search_in_licenses", this.$widgets.search_form).is(":checked"))
            fields += "_license";
        if ($("#catalog_browser_search_in_companies", this.$widgets.search_form).is(":checked"))
            fields += "_company";
    }
    if (this.displayable_content.indexOf("v") != -1 && $("#catalog_browser_search_in_chapters", this.$widgets.search_form).is(":checked"))
        fields += "_chapter";
    if ((this.displayable_content.indexOf("v") != -1 || this.displayable_content.indexOf("p") != -1) && $("#catalog_browser_search_in_photos", this.$widgets.search_form).is(":checked"))
        fields += "_photo";
    if (fields)
        fields = fields.substring(1);
    else
        fields = "metadata";
    // get content to search
    var content = "";
    if (this.displayable_content.length > 1) {
        if (this.displayable_content.indexOf("c") != -1 && $("#catalog_browser_search_for_categories", this.$widgets.search_form).is(":checked"))
            content += "c";
        if (this.displayable_content.indexOf("v") != -1 && $("#catalog_browser_search_for_videos", this.$widgets.search_form).is(":checked"))
            content += "v";
        if (this.displayable_content.indexOf("l") != -1 && $("#catalog_browser_search_for_lives", this.$widgets.search_form).is(":checked"))
            content += "l";
        if (this.displayable_content.indexOf("p") != -1 && $("#catalog_browser_search_for_photos", this.$widgets.search_form).is(":checked"))
            content += "p";
    }
    if (!content)
        content = this.displayable_content;
    // prepare search request
    var url = this.base_url;
    var data = {
        search: $("#catalog_browser_search", this.$widgets.search_form).val(),
        content: content,
        fields: fields
    };
    if (this.filter_validated !== null) {
        if (this.filter_validated)
            data.validated = "yes";
        else
            data.validated = "no";
    }
    if (this.use_proxy) {
        data.course_id = this.course_id;
        data.action = this.api_search;
    }
    else
        url += this.api_search;
    // execute search request
    var obj = this;
    this.search_loading_timeout = setTimeout(function () {
        obj.display_message("search", obj.translate("Search in progress")+"...", "loading");
        obj.search_loading_timeout = null;
    }, 500);
    var callback = function (response) {
        if (response.success) {
            obj.hide_message("search");
            obj.display_content("search", response);
        }
        else {
            obj.$widgets.content_search.html("");
            obj.display_message("search", response.error);
        }
        if (obj.search_loading_timeout)
            clearTimeout(obj.search_loading_timeout);
    };
    $.ajax({
        url: url,
        data: data,
        dataType: "json",
        cache: false,
        success: function (response) {
            if (!response.success)
                response.error = response.error ? response.error : obj.translate("No information about error.");
            callback(response);
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get channel's content. Request timed out.") });
        },
        statusCode: {
            401: function () {
                callback({ success: false, error: obj.translate("You are not logged in. Please login in Moodle and retry.") });
            },
            403: function () {
                callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
            },
            404: function () {
                callback({ success: false, error: obj.translate("Requested channel does not exist.") });
            },
            500: function () {
                callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
        }
    });
};


CatalogBrowser.prototype.display_message = function (place, text, type) {
    var t = type ? type : "error";
    this.$widgets["message_"+place].html("<div class=\""+t+"\">"+text+"</div>");
    if (!this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "block");
        this.messages_displayed[place] = true;
    }
};
CatalogBrowser.prototype.hide_message = function (place) {
    if (this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "none");
        this.messages_displayed[place] = false;
    }
};

CatalogBrowser.prototype.resize = function () {
    var width = $(window).width() - 100;
    if (width < 900)
        width = 900;
    else if (width > 1200)
        width = 1200;
    this.$widgets.main.width(width);
    var height = $(window).height() - 100;
    this.$widgets.main.height(height);
};



CatalogBrowser.prototype.set_language = function (lang) {
    if (lang == "fr") {
        this.language = "fr";
        this.translations = {
            "Loading": "Chargement",
            "Channels list": "Liste des chaînes",
            "Search": "Rechercher",
            "Search results": "Résultats de la recherche",
            "Search:": "Rechercher&nbsp;:",
            "Search in:": "Rechercher dans&nbsp;:",
            "Search for:": "Contenu à rechercher&nbsp;:",
            "Search in progress": "Recherche en cours",
            "Use the input in the left column to search for something.": "Utilisez le champ de texte à gauche pour rechercher du contenu.",
            "titles": "titres",
            "descriptions": "descriptions",
            "keywords": "mots clés",
            "speakers": "intervenants",
            "companies": "sociétés",
            "chapters": "chapitres",
            "photos": "photos",
            "categories": "catégories",
            "videos": "vidéos",
            "live streams": "diffusions en direct",
            "photos groups": "groupes de photos",
            "Channel's content": "Contenu de la chaîne",
            "Catalog root": "Racine du catalogue",
            "Channels": "Chaînes",
            "Sub channels": "Sous chaînes",
            "Videos": "Vidéos",
            "Live streams": "Diffusions en direct",
            "Photos groups": "Groupes de photos",
            "channel(s)": "chaîne(s)",
            "video(s)": "vidéo(s)",
            "live stream(s)": "diffusion(s) en direct",
            "photos group(s)": "groupe(s) de photos",
            "No information about media.": "Pas d'information sur le média",
            "Unable to get media's information. Request timed out.": "Impossible d'obtenir les informations sur le média. Délai d'attente de la requête écoulé.",
            "Unable to get media's information because you cannot access to this media.": "Impossible d'obtenir les informations sur le média car vous ne pouvez pas accéder à ce média.",
            "Media does not exist.": "Aucun média ne correspond à l'identifiant entré.",
            "An error occured in medias server. Please try again later.": "Une erreur est suvenue dans le serveur de médias. Veuillez réessayer plus tard.",
            "No information about error.": "Aucune information sur l'erreur.",
            "Unable to get channels. Request timed out.": "Impossible d'obtenir la liste des chaînes. Délai d'attente de la requête écoulé.",
            "An error occured during request:": "Une erreur est survenue pendant la requête&nbsp;:",
            "Click to display the content of this channel": "Cliquez pour afficher le le contenu de cette chaîne",
            "Unable to get channel's content. Request timed out.": "Impossible d'obtenir la liste du contenu de la chaîne. Délai d'attente de la requête écoulé.",
            "You are not logged in. Please login in Moodle and retry.": "Vous devez vous authentifier pour voir les médias. Veuillez vous authentifier dans Moodle puis réessayez.",
            "Unable to get channel's content because you cannot access to this channel.": "Impossible d'obtenir la liste du contenu de la chaîne car vous ne possédez pas la permission d'y accéder",
            "Requested channel does not exist.": "La chaîne demandée n'existe pas.",
            "This channel contains no sub channels and no medias.": "Cette chaîne ne contient pas de sous chaîne ni de média.",
            "This channel contains no sub channels.": "Cette chaîne ne contient pas de sous chaîne.",
            "This channel contains no medias.": "Cette chaîne ne contient pas de média.",
            "Accessible for all users": "Accessible pour tous les utilisateurs",
            "Accessible only for authenticated users": "Accessible uniquement pour les utilisateurs authentifiés",
            "Accessible only for authenticated users with access right": "Accessible uniquement pour les utilisateurs authentifiés qui possèdent le droit d'accès",
            "Inaccessible for all users": "Inaccessible pour tous les utilisateurs",
            "Visible for all users": "Visible pour tous les utilisateurs",
            "Visible only for authenticated users": "Visible uniquement pour les utilisateurs authentifiés",
            "Visible only for authenticated users with access right": "Visible uniquement pour les utilisateurs authentifiés qui possèdent le droit d'accès",
            "Invisible for all users": "Invisible pour tous les utilisateurs",
            "This media is published": "Ce média est publié",
            "This media is not published": "Ce média n'est pas publié",
            "This video is not ready": "Cette vidéo n'est pas prête",
            "Select a channel to display its content.": "Sélectionnez une chaîne pour afficher son contenu.",
            "Select a channel": "Sélectionner une chaîne",
            "Select a media": "Sélectionner un média",
            "Select this channel": "Sélectionner cette chaîne",
            "Select this media": "Sélectionner ce média",
            "Display channel": "Afficher cette chaîne",
            "Parent channel": "Chaîne parente",
            "January": "janvier",
            "February": "février",
            "March": "mars",
            "April": "avril",
            "May": "mai",
            "June": "juin",
            "July": "juillet",
            "August": "août",
            "September": "septembre",
            "October": "octobre",
            "November": "novembre",
            "December": "décembre",
            "at": "à"
        };
    }
    else {
        this.language = "en";
        this.translations = {};
    }
};

CatalogBrowser.prototype.get_date_display = function (d) {
    // date format %Y-%m-%d %H:%M:%S
    var date_split = d.split(" ");
    if (date_split.length < 2)
        return "";
    var ymd_split = date_split[0].split("-");
    var hms_split = date_split[1].split(":");
    if (ymd_split.length < 3 || hms_split.length < 3)
        return "";
    
    // year
    var year = ymd_split[0];
    // month
    var month = ymd_split[1];
    switch (ymd_split[1]) {
        case "01": month = this.translate("January");   break;
        case "02": month = this.translate("February");  break;
        case "03": month = this.translate("March");     break;
        case "04": month = this.translate("April");     break;
        case "05": month = this.translate("May");       break;
        case "06": month = this.translate("June");      break;
        case "07": month = this.translate("July");      break;
        case "08": month = this.translate("August");    break;
        case "09": month = this.translate("September"); break;
        case "10": month = this.translate("October");   break;
        case "11": month = this.translate("November");  break;
        case "12": month = this.translate("December");  break;
    }
    // day
    var day = ymd_split[2];
    try { day = parseInt(ymd_split[2], 10); } catch (e) { }
    
    // hour
    var hour = parseInt(hms_split[0], 10);
    // minute
    var minute = parseInt(hms_split[1], 10);
    if (minute < 10)
        minute = "0"+minute;
    
    var time;
    if (this.language == "fr") {
        // 24 hours time format
        if (hour < 10)
            hour = "0"+hour;
        time = hour+"h"+minute;
    }
    else {
        // 12 hours time format
        var moment = "PM";
        if (hour < 13) {
            moment = "AM";
            if (hour == 0)
                hour = 12;
        }
        else
            hour -= 12;
        time = hour+":"+minute+" "+moment;
    }
    return day+" "+month+" "+year+" "+this.translate("at")+" "+time;
};


