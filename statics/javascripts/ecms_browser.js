/*******************************************
* EasyCast MediaServer - Catalog browser   *
* Copyright: UbiCast, all rights reserved  *
* Author: Stephane Diemer                  *
*******************************************/

function ECMSCatalogBrowser(options) {
    // params
    this.title = "";
    this.base_url = "";
    this.use_proxy = false;
    this.request_data = null;
    this.selectable_content = "vlp"; // v for videos, l for lives, p for photos group and c for channels
    this.displayable_content = "cvlp";
    this.filter_validated = null;
    this.parent_selection_oid = null; // special for category parent selection
    this.initial_oid = null;
    this.on_pick = null;
    this.language = "";
    this.use_jquery_ui = false;
    
    // vars
    this.api_content = "/api/v2/channels/content/";
    this.api_get_category = "/api/v2/channels/get/";
    this.api_get_media = "/api/v2/medias/get/";
    this.api_search = "/api/v2/search/";
    this.api_latest = "/api/v2/latest/";
    this.messages_displayed = { list: true, search: true, latest: true };
    this.loading_timeout = null;
    this.catalog = {};
    this.tree_manager = null;
    this.displayed = "list";
    this.current_category_oid = "0";
    this.current_selection = null;
    this.latest_initialized = false;
    this.$widgets = {};
    
    utils.setup_class(this, options, [
        // allowed options
        "title",
        "base_url",
        "use_proxy",
        "request_data",
        "selectable_content",
        "displayable_content",
        "filter_validated",
        "parent_selection_oid",
        "initial_oid",
        "on_pick",
        "language",
        "use_jquery_ui"
    ]);
    if (this.language)
        utils.use_lang(this.language);
    
    this.overlay = new OverlayDisplayer({ language: this.language });
    
    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
}

ECMSCatalogBrowser.prototype.init = function () {
    var obj = this;
    // build widget structure
    var html = "<div class=\"catalogbrowser cb-display-list\">";
    html += "<div class=\"cb-left\">";
    html +=     "<div class=\"cb-column\">";
    html +=         "<div class=\"cb-title\">";
    html +=             "<div class=\"cb-btn cb-btn-list cb-active\">"+this.translate("Channels list")+"</div>";
    html +=             "<div class=\"cb-btn cb-btn-search\">"+this.translate("Search")+"</div>";
    html +=             "<div class=\"cb-btn cb-btn-latest\">"+this.translate("Latest content")+"</div>";
    html +=         "</div>";
    html +=         "<div class=\"cb-container cb-left-list\">";
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
            html +=         " <label for=\"catalog_browser_search_for_categories\">"+this.translate("channels")+"</label></div>";
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
    html +=         "<div class=\"cb-container cb-left-latest\">";
    html +=             "<div class=\"info\">"+this.translate("This list presents all media and channels ordered by add date in the catalog.")+"</div>";
    if (this.displayable_content.length > 1 && this.displayable_content.indexOf("c") != -1) {
        html +=         "<p>";
        html +=             "<input id=\"latest_display_channels\" type=\"checkbox\">";
        html +=             " <label for=\"latest_display_channels\">"+this.translate("display channels")+"</label>";
        html +=         "</p>";
        html +=         "<p><button type=\"button\" class=\"cb-latest-refresh\">"+this.translate("Apply")+"</button></p>";
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
    html +=         "<div class=\"cb-title\">"+this.translate("Search results")+" <span class=\"cb-search-results-count\"></span></div>";
    html +=         "<div class=\"cb-container\">";
    html +=             "<div class=\"cb-message\">";
    html +=                 "<div class=\"info\">"+this.translate("Use the input in the left column to search for something.")+"</div>";
    html +=             "</div>";
    html +=             "<div class=\"cb-content\"></div>";
    html +=         "</div>";
    html +=     "</div>";
    html +=     "<div class=\"cb-column cb-column-latest\">";
    html +=         "<div class=\"cb-title\">"+this.translate("Latest content added in the catalog")+"</div>";
    html +=         "<div class=\"cb-container\">";
    html +=             "<div class=\"cb-message\"></div>";
    html +=             "<div class=\"cb-content\">";
    html +=                 "<div class=\"cb-latest-place\"></div>";
    html +=                 "<div class=\"cb-latest-btn\">";
    html +=                     "<button type=\"button\" class=\"std-btn cb-latest-more-5\">"+this.translate("Display 5 more items")+"</button>";
    html +=                     "<button type=\"button\" class=\"std-btn cb-latest-more-20\">"+this.translate("Display 20 more items")+"</button>";
    html +=                 "</div>";
    html +=             "</div>";
    html +=         "</div>";
    html +=     "</div>";
    html +=     "<div class=\"cb-loading\"><div>"+this.translate("Loading...")+"</div></div>";
    html += "</div>";
    /* TODO: filters implementation
    html += "<div class=\"cb-filters-btn-place\"><div class=\"cb-btn cb-btn-filters\">"+this.translate("Filters")+"</div></div>";
    html += "<div class=\"cb-filters-menu\">";
    if (this.displayable_content.indexOf("c") != -1) {
        html += "<div><b>"+this.translate("Channels:")+"</b><br/>";
        html += "<label for=\"filter_categories_editable\">"+this.translate("Editable")+"</label>";
        html += " <select id=\"filter_categories_editable\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("v") != -1) {
        html += "<div><p>"+this.translate("Videos:")+"</p>";
        html += "<label for=\"filter_videos_editable\">"+this.translate("Editable")+"</label>";
        html += " <select id=\"filter_videos_editable\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select><br/>";
        html += "<label for=\"filter_videos_published\">"+this.translate("Published")+"</label>";
        html += " <select id=\"filter_videos_published\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("l") != -1) {
        html += "<div><p>"+this.translate("Lives:")+"</p>";
        html += "<label for=\"filter_lives_editable\">"+this.translate("Editable")+"</label>";
        html += " <select id=\"filter_lives_editable\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select>";
        html += "<label for=\"filter_lives_published\">"+this.translate("Published")+"</label>";
        html += " <select id=\"filter_lives_published\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("p") != -1) {
        html += "<div><p>"+this.translate("Photos groups:")+"</p>";
        html += "<label for=\"filter_photos_editable\">"+this.translate("Editable")+"</label>";
        html += "<select id=\"filter_photos_editable\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select><br/>";
        html += "<label for=\"filter_photos_published\">"+this.translate("Published")+"</label>";
        html += " <select id=\"filter_photos_published\">";
        html += " <option value=\"all\">"+this.translate("all")+"</option>";
        html += " <option value=\"yes\">"+this.translate("yes")+"</option>";
        html += " <option value=\"no\">"+this.translate("no")+"</option>";
        html += " </select></div>";
    }
    html += "</div>";
    */
    html += "</div>";
    this.$widgets.main = $(html);
    
    // get elements
    this.$widgets.tree = $(".cb-left .cb-tree", this.$widgets.main);
    this.$widgets.loading = $(".cb-right .cb-loading", this.$widgets.main);
    this.$widgets.content_list = $(".cb-column-list .cb-content", this.$widgets.main);
    this.$widgets.content_search = $(".cb-column-search .cb-content", this.$widgets.main);
    this.$widgets.content_latest = $(".cb-column-search .cb-content", this.$widgets.main);
    this.$widgets.message_list = $(".cb-column-list .cb-message", this.$widgets.main);
    this.$widgets.message_search = $(".cb-column-search .cb-message", this.$widgets.main);
    this.$widgets.message_latest = $(".cb-column-latest .cb-message", this.$widgets.main);
    this.$widgets.search_form = $(".cb-left-search", this.$widgets.main);
    this.$widgets.search_results = $(".cb-column-search .cb-search-results-count", this.$widgets.main);
    this.$widgets.letest_btn = $(".cb-column-latest .cb-latest-btn", this.$widgets.main);
    this.$widgets.filters_btn = $(".cb-btn-filters", this.$widgets.main);
    this.$widgets.filters_menu = $(".cb-filters-menu", this.$widgets.main);
    this.$widgets.latest_place = $(".cb-column-latest .cb-latest-place", this.$widgets.main);
    
    // get initial media or channel info
    if (this.initial_oid)
        this.pick(this.initial_oid);
    
    // events
    $(".cb-btn-list", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("list"); });
    $(".cb-btn-search", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("search"); });
    $(".cb-btn-latest", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("latest"); });
    $(".cb-btn-filters", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.toggle_filters_menu(); });
    $(".cb-latest-more-5", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_more_click(5); });
    $(".cb-latest-more-20", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_more_click(20); });
    $(".cb-latest-refresh", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_refresh(); });
    $("form", this.$widgets.main).submit({ obj: this }, function (evt) { evt.data.obj.on_search_submit(); });
    $(window).resize(function () {
        obj.resize();
    });
    this.resize();
};

ECMSCatalogBrowser.prototype.toggle_filters_menu = function () {
    if (this.$widgets.filters_btn.hasClass("cb-active")) {
        this.$widgets.filters_btn.removeClass("cb-active");
        this.$widgets.filters_menu.removeClass("cb-active");
    }
    else {
        this.$widgets.filters_btn.addClass("cb-active");
        this.$widgets.filters_menu.addClass("cb-active");
    }
};

ECMSCatalogBrowser.prototype.change_tab = function (tab_id) {
    if (this.$widgets.main.hasClass("cb-display-"+tab_id))
        return;
    if (tab_id == "latest")
        this.latest_init();
    $(".cb-btn-"+this.displayed, this.$widgets.main).removeClass("cb-active");
    $(".cb-btn-"+tab_id, this.$widgets.main).addClass("cb-active");
    this.$widgets.main.removeClass("cb-display-"+this.displayed).addClass("cb-display-"+tab_id);
    this.displayed = tab_id;
};

ECMSCatalogBrowser.prototype.open = function () {
    var obj = this;
    if (!this.tree_manager) {
        this.tree_manager = new ECMSTreeManager({
            $place: this.$widgets.tree,
            base_url: this.base_url,
            use_proxy: this.use_proxy,
            request_data: this.request_data,
            display_root: this.displayable_content.indexOf("c") != -1,
            current_category_oid: this.current_category_oid,
            on_change: function (oid) { obj.display_channel(oid); },
            on_data_retrieved: function (data) { obj.update_catalog(data); }
        });
        if (this.displayable_content.indexOf("c") != -1)
            this.display_channel(this.current_category_oid);
    }
    this.overlay.show({
        mode: "html",
        title: this.title,
        html: this.$widgets.main,
        on_hide: function () { obj.$widgets.main.detach(); }
    });
};

ECMSCatalogBrowser.prototype.update_catalog = function (item) {
    if (!item.oid)
        return;
    if (!this.catalog[item.oid])
        this.catalog[item.oid] = item;
    else {
        for (var field in item) {
            this.catalog[item.oid][field] = item[field];
        }
    }
};


ECMSCatalogBrowser.prototype.get_info = function (oid, full, callback) {
    if (!oid || !callback)
        return;
    var url = this.base_url;
    var data = { oid: oid };
    if (full)
        data.full = "yes";
    if (oid[0] == "v" || oid[0] == "l" || oid[0] == "p") {
        // media
        if (this.use_proxy)
            data.action = this.api_get_media;
        else
            url += this.api_get_media;
    }
    else {
        // category
        if (this.use_proxy)
            data.action = this.api_get_category;
        else
            url += this.api_get_category;
    }
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
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
            if (xhr.status) {
                if (xhr.status == 401)
                    return callback({ success: false, error: obj.translate("Unable to get media's information because you are not logged in.") });
                if (xhr.status == 403)
                    return callback({ success: false, error: obj.translate("Unable to get media's information because you cannot access to this media.") });
                if (xhr.status == 404)
                    return callback({ success: false, error: obj.translate("Media does not exist.") });
                if (xhr.status == 500)
                    return callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get media's information. Request timed out.") });
            else
                callback({ success: false, error: obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError });
        }
    });
};


ECMSCatalogBrowser.prototype.display_channel = function (cat_oid) {
    this.change_tab("list");
    this.current_category_oid = cat_oid;
    this.tree_manager.set_active(cat_oid);
    var url = this.base_url;
    var data = {};
    if (cat_oid && cat_oid != "0")
        data.parent_oid = cat_oid;
    if (this.parent_selection_oid)
        data.parent_selection_oid = this.parent_selection_oid;
    if (this.displayable_content)
        data.content = this.displayable_content;
    if (this.filter_validated !== null) {
        if (this.filter_validated)
            data.validated = "yes";
        else
            data.validated = "no";
    }
    if (this.use_proxy)
        data.action = this.api_content;
    else
        url += this.api_content;
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    var obj = this;
    this.display_loading();
    var callback = function (response) {
        obj.hide_loading();
        if (response.success) {
            obj.hide_message("list");
            obj.display_content("list", response, cat_oid);
        }
        else {
            obj.$widgets.content_list.html("");
            obj.display_message("list", response.error);
        }
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
            if (xhr.status) {
                if (xhr.status == 401)
                    return callback({ success: false, error: obj.translate("You are not logged in. Please login in Moodle and retry.") });
                if (xhr.status == 403)
                    return callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
                if (xhr.status == 404)
                    return callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
                if (xhr.status == 500)
                    return callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get channel's content. Request timed out.") });
            else
                callback({ success: false, error: obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError });
        }
    });
};
ECMSCatalogBrowser.prototype.display_content = function (target, data, cat_oid) {
    var $container = this.$widgets["content_"+target];
    var selectable;
    var nb_channels = data.channels ? data.channels.length : 0;
    var nb_videos = data.videos ? data.videos.length : 0;
    var nb_live_streams = data.live_streams ? data.live_streams.length : 0;
    var nb_photos_groups = data.photos_groups ? data.photos_groups.length : 0;
    var sections = ((nb_channels > 0) ? 1 : 0) + ((nb_videos > 0) ? 1 : 0) + ((nb_live_streams > 0) ? 1 : 0) + ((nb_photos_groups > 0) ? 1 : 0);
    $container.html("");
    if (cat_oid === undefined) {
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
        selectable = this.selectable_content.indexOf("c") != -1;
        if (cat_oid != "0") {
            // parent link
            var parent_oid = (this.catalog[cat_oid] && this.catalog[cat_oid].parent_oid) ? this.catalog[cat_oid].parent_oid : 0;
            var parent_title = (parent_oid && this.catalog[parent_oid]) ? this.translate("Parent channel:")+" "+this.catalog[parent_oid].title : this.translate("Parent channel");
            $container.append(this.get_content_entry("parent", {
                oid: parent_oid,
                title: parent_title,
                extra_class: "item-entry-small",
                selectable: (!this.parent_selection_oid || data.parent_selectable),
                no_save: true
            }, parent_oid != 0 && selectable));
            // current category selection button
            var cat_title = this.catalog[cat_oid] ? this.translate("Channel:")+" "+this.catalog[cat_oid].title : "Current channel";
            $container.append(this.get_content_entry("current", {
                oid: cat_oid,
                title: cat_title,
                extra_class: "item-entry-small",
                selectable: (!this.parent_selection_oid || data.selectable),
                no_save: true
            }, selectable));
        }
        if (sections == 0) {
            if (selectable) {
                if (this.displayable_content.length > 1)
                    $container.append("<div class=\"info\">"+this.translate("This channel contains no sub channels and no medias.")+"</div>");
                else
                    $container.append("<div class=\"info\">"+this.translate("This channel contains no sub channels.")+"</div>");
            }
            else
                $container.append("<div class=\"info\">"+this.translate("This channel contains no medias.")+"</div>");
            return;
        }
    }
    if (data.channels && data.channels.length > 0) {
        // sub categories
        selectable = this.selectable_content.indexOf("c") != -1;
        if (!cat_oid)
            $container.append("<div class=\"cb-section\">"+this.translate("Channels")+"</div>");
        else
            $container.append("<div class=\"cb-section\">"+this.translate("Sub channels")+"</div>");
        for (var i=0; i < data.channels.length; i++) {
            if (data.channels[i].parent_oid === undefined && cat_oid)
                data.channels[i].parent_oid = cat_oid;
            $container.append(this.get_content_entry("channel", data.channels[i], selectable));
        }
    }
    if (data.live_streams && data.live_streams.length > 0) {
        // live streams
        selectable = this.selectable_content.indexOf("l") != -1;
        $container.append("<div class=\"cb-section\">"+this.translate("Lives streams")+"</div>");
        for (var i=0; i < data.live_streams.length; i++) {
            $container.append(this.get_content_entry("live", data.live_streams[i], selectable));
        }
    }
    if (data.videos && data.videos.length > 0) {
        // videos
        selectable = this.selectable_content.indexOf("v") != -1;
        $container.append("<div class=\"cb-section\">"+this.translate("Videos")+"</div>");
        for (var i=0; i < data.videos.length; i++) {
            $container.append(this.get_content_entry("video", data.videos[i], selectable));
        }
    }
    if (data.photos_groups && data.photos_groups.length > 0) {
        // photos groups
        selectable = this.selectable_content.indexOf("p") != -1;
        $container.append("<div class=\"cb-section\">"+this.translate("Photos groups")+"</div>");
        for (var i=0; i < data.photos_groups.length; i++) {
            $container.append(this.get_content_entry("photos", data.photos_groups[i], selectable));
        }
    }
};
ECMSCatalogBrowser.prototype.get_content_entry = function (item_type, item, gselectable) {
    var oid = item.oid;
    if (!item.no_save)
        this.update_catalog(item);
    var selectable = gselectable && (!this.parent_selection_oid || item.selectable);
    
    var $entry = $("<div class=\"item-entry item-type-"+item_type+"\" id=\"item_entry_"+oid+"\"></div>");
    if (this.current_selection && this.current_selection.oid == oid)
        $entry.addClass("selected");
    if (selectable)
        $entry.addClass("selectable");
    if (item.extra_class)
        $entry.addClass(item.extra_class);
    
    var html = "<div class=\"item-entry-link "+(selectable || item_type == "channel" || item_type == "parent" ? "clickable" : "")+"\">";
    if (item.thumb)
        html += "<span class=\"item-entry-preview\"><img src=\""+item.thumb+"\"/></span>";
    else
        html += "<span class=\"item-entry-preview\"><span class=\"item-"+item_type+"-icon\"></span></span>";
    html +=     "<span class=\"item-entry-content\">";
    html +=         "<span class=\"item-entry-top-bar\">";
    html +=             "<span class=\"item-entry-title\">"+utils.escape_html(item.title)+"</span>";
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
    html +=         "<span class=\"item-entry-bottom-bar\">";
    if (item.show_type)
        html +=         "<span class=\"item-entry-type\">"+this.translate("Type:")+" "+this.translate(item_type)+"</span>";
    if (item.creation)
        html +=         "<span class=\"item-entry-date\">"+this.translate("Created on")+" "+utils.get_date_display(item.creation)+"</span>";
    if (item.show_add_date && item.add_date)
        html +=         "<span class=\"item-entry-date\">"+this.translate("Added on")+" "+utils.get_date_display(item.add_date)+"</span>";
    if (item.show_parent_title && item.parent_title)
        html +=         "<span class=\"item-entry-parent\">"+this.translate("Parent channel:")+" "+item.parent_title+"</span>";
    html +=         "</span>";
    html +=     "</span>";
    html += "</div>";
    var $entry_block = $(html);
    if (item_type == "channel" || item_type == "parent")
        $entry_block.click({ obj: this, oid: oid }, function (evt) {
            evt.data.obj.display_channel(evt.data.oid);
            evt.data.obj.tree_manager.expand_tree(evt.data.oid);
        });
    else if (selectable)
        $entry_block.click({ obj: this, oid: oid }, function (evt) {
            evt.data.obj.pick(evt.data.oid);
        });
    $entry.append($entry_block);
    
    var btn_class = this.use_jquery_ui ? "ui-widget ui-state-default ui-corner-all" : "std-btn";
    html = "<div class=\"item-entry-links\">";
    if (item_type == "channel" || item_type == "parent")
        html += "<span class=\""+btn_class+" item-entry-display\">"+this.translate("Display channel")+"</span>";
    if (selectable) {
        if (item_type == "channel" || item_type == "parent" || item_type == "current")
            html += "<span class=\""+btn_class+" main item-entry-pick\">"+this.translate("Select this channel")+"</span>";
        else
            html += "<span class=\""+btn_class+" main item-entry-pick\">"+this.translate("Select this media")+"</span>";
    }
    html += "</div>";
    var $entry_links = $(html);
    if (item_type == "channel" || item_type == "parent")
        $(".item-entry-display", $entry_links).click({ obj: this, oid: oid }, function (evt) {
            evt.data.obj.display_channel(evt.data.oid);
        });
    if (selectable)
        $(".item-entry-pick", $entry_links).click({ obj: this, oid: oid }, function (evt) {
            evt.data.obj.pick(evt.data.oid);
        });
    $entry.append($entry_links);
    
    return $entry;
};

ECMSCatalogBrowser.prototype.pick = function (oid) {
    if (oid === null || oid === undefined) {
        // deselect
        if (this.current_selection && this.current_selection.oid)
            $("#item_entry_"+this.current_selection.oid).removeClass("selected");
        return;
    }
    if (this.catalog[oid]) {
        this._pick(oid, { success: true, info: this.catalog[oid] }, true);
        return;
    }
    // load info if no info are available
    var obj = this;
    this.get_info(oid, false, function (result) {
        obj._pick(oid, result);
    });
};
ECMSCatalogBrowser.prototype._pick = function (oid, result, no_update) {
    if (result.success) {
        this.overlay.hide();
        // update info in local catalog
        if (!no_update)
            this.update_catalog(result.info);
        // change current selection
        if (this.current_selection && this.current_selection.oid)
            $("#item_entry_"+this.current_selection.oid).removeClass("selected");
        this.current_selection = this.catalog[oid];
        $("#item_entry_"+oid).addClass("selected");
        if (this.on_pick)
            this.on_pick(this.catalog[oid]);
        // select and open category
        if (oid.indexOf("c") == 0 || !isNaN(parseInt(oid, 10)))
            this.current_category_oid = oid;
        else
            this.current_category_oid = result.info.parent_oid;
        if (this.tree_manager && this.current_category_oid) {
            this.tree_manager.set_active(oid);
            this.tree_manager.expand_tree(this.current_category_oid);
        }
    }
    else {
        // this should never happen
        console.log("Unable to get info about initial selection:"+result.error);
    }
};
ECMSCatalogBrowser.prototype.get_last_pick = function () {
    return this.current_selection;
};



ECMSCatalogBrowser.prototype.on_search_submit = function (place, text, type) {
    if (!$("#catalog_browser_search", this.$widgets.search_form).val())
        return;
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
    if (this.use_proxy)
        data.action = this.api_search;
    else
        url += this.api_search;
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    // execute search request
    var obj = this;
    this.display_loading();
    var callback = function (response) {
        obj.hide_loading();
        if (response.success) {
            obj.hide_message("search");
            obj.display_content("search", response);
        }
        else {
            obj.$widgets.content_search.html("");
            obj.display_message("search", response.error);
        }
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
            if (xhr.status) {
                if (xhr.status == 401)
                    return callback({ success: false, error: obj.translate("You are not logged in. Please login in Moodle and retry.") });
                if (xhr.status == 403)
                    return callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
                if (xhr.status == 404)
                    return callback({ success: false, error: obj.translate("Requested channel does not exist.") });
                if (xhr.status == 500)
                    return callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get channel's content. Request timed out.") });
            else
                callback({ success: false, error: obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError });
        }
    });
};


/* Latest display */
ECMSCatalogBrowser.prototype.latest_init = function () {
    if (this.latest_initialized)
        return;
    this.latest_initialized = true;
    // load videos
    // TODO restore values from cookies
    this.load_latest();
};
ECMSCatalogBrowser.prototype.load_latest = function (count, end) {
    if (this.latest_loading)
        return;
    this.latest_loading = true;
    
    var url = this.base_url;
    var data = {};
    if (this.displayable_content)
        data.content = this.displayable_content;
    if (this.displayable_content.length > 1 && this.displayable_content.indexOf("c") != -1 && !$("#latest_display_channels").is(":checked")) {
        data.content = "";
        for (var i=0; i < this.displayable_content.length; i++) {
            if (this.displayable_content[i] != "c")
                data.content += this.displayable_content[i];
        }
    }
    if (this.filter_validated !== null) {
        if (this.filter_validated)
            data.validated = "yes";
        else
            data.validated = "no";
    }
    if (this.use_proxy)
        data.action = this.api_latest;
    else
        url += this.api_latest;
    
    var start_value = 0;
    if (this.latest_start) {
        data.start = this.latest_start;
        start_value = parseInt(this.latest_start.replace(new RegExp("[-_]", "g"), ""), 10);
        if (isNaN(start_value))
            start_value = 0;
    }
    if (end) {
        var end_value = parseInt(end.replace(new RegExp("[-_]", "g"), ""), 10);
        if (start_value > 0 && !isNaN(end_value) && end_value >= start_value) {
            this.latest_loading = false;
            console.log("cancelled");
            return;
        }
        data.end = end;
    }
    if (count)
        data.count = count;
    
    var obj = this;
    this.display_loading();
    var callback = function (response) {
        obj.hide_loading();
        if (response.success) {
            obj.hide_message("latest");
            obj.display_latest(response);
        }
        else {
            obj.display_message("latest", response.error);
        }
        obj.latest_loading = false;
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
            if (xhr.status) {
                if (xhr.status == 401)
                    return callback({ success: false, error: obj.translate("You are not logged in. Please login in Moodle and retry.") });
                if (xhr.status == 403)
                    return callback({ success: false, error: obj.translate("Unable to get channel's content because you cannot access to this channel.") });
                if (xhr.status == 404)
                    return callback({ success: false, error: obj.translate("Requested channel does not exist.") });
                if (xhr.status == 500)
                    return callback({ success: false, error: obj.translate("An error occured in medias server. Please try again later.") });
            }
            if (textStatus == "timeout")
                callback({ success: false, error: obj.translate("Unable to get channel's content. Request timed out.") });
            else
                callback({ success: false, error: obj.translate("An error occured during request:")+"<br/>&nbsp;&nbsp;&nbsp;&nbsp;"+textStatus+" "+thrownError });
        }
    });
};
ECMSCatalogBrowser.prototype.display_latest = function (result) {
    this.latest_start = result.max_date;
    this.latest_more = result.more === true;
    for (var i=0; i < result.items.length; i++) {
        var item = result.items[i];
        item.show_type = true;
        item.show_add_date = true;
        item.show_parent_title = true;
        if (item.date_label != this.latest_date_label) {
            this.latest_date_label = item.date_label;
            this.$widgets.latest_place.append("<h3>"+item.date_label+"</h3>");
        }
        var type = "channel";
        if (item.type == "v")
            type = "video";
        if (item.type == "l")
            type = "live";
        if (item.type == "p")
            type = "photos";
        this.$widgets.latest_place.append(this.get_content_entry(type, item, this.selectable_content.indexOf(item.type) != -1));
    }
    if (this.latest_more)
        this.$widgets.letest_btn.css("display", "block");
    else
        this.$widgets.letest_btn.css("display", "none");
};
ECMSCatalogBrowser.prototype.latest_more_click = function (count) {
    if (!this.latest_more)
        return;
    this.load_latest(count);
};
ECMSCatalogBrowser.prototype.latest_refresh = function (count) {
    this.latest_more = false;
    this.latest_start = "";
    this.latest_date_label = "";
    this.$widgets.latest_place.html("");
    this.load_latest();
};


/* Messages */
ECMSCatalogBrowser.prototype.display_message = function (place, text, type) {
    var t = type ? type : "error";
    this.$widgets["message_"+place].html("<div class=\""+t+"\">"+text+"</div>");
    if (!this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "block");
        this.messages_displayed[place] = true;
    }
};
ECMSCatalogBrowser.prototype.hide_message = function (place) {
    if (this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "none");
        this.messages_displayed[place] = false;
    }
};
ECMSCatalogBrowser.prototype.display_loading = function () {
    var obj = this;
    this.loading_timeout = setTimeout(function () {
        obj.$widgets.loading.css("display", "block");
        obj.loading_timeout = null;
    }, 500);
};
ECMSCatalogBrowser.prototype.hide_loading = function () {
    if (this.loading_timeout) {
        clearTimeout(this.loading_timeout);
        this.loading_timeout = null;
    }
    this.$widgets.loading.css("display", "");
};

/* Resize */
ECMSCatalogBrowser.prototype.resize = function () {
    var width = $(window).width() - 100;
    if (width < 900)
        width = 900;
    else if (width > 1200)
        width = 1200;
    this.$widgets.main.width(width);
    var height = $(window).height() - 100;
    this.$widgets.main.height(height);
};


