/*******************************************
* EasyCast MediaServer - Catalog browser   *
* Copyright: UbiCast, all rights reserved  *
* Author: Stephane Diemer                  *
*******************************************/
/*jshint multistr:true */
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
    this.use_overlay = true;
    this.browse_search = false;
    this.url_icone_rss = '';
    this.url_icone_itunes = '';
    this.display_itunes_rss = false;
    this.url_search = '/search/';
    // vars

    this.messages_displayed = { list: true, search: true, latest: true };
    this.loading_timeout = null;
    this.catalog = {};
    this.tree_manager = null;
    this.displayed = "list";
    this.current_category_oid = "0";
    this.current_selection = null;
    this.latest_initialized = false;
    this.$widgets = {};
    this.last_search_response = null;
    this.last_cat_content = null;
    this.last_latest = null;
    this.display_mode = utils.get_cookie("catalog-display_mode");
    this.btn_class = 'cb-btn';
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
        "use_jquery_ui",
        "use_overlay",
        "browse_search",
        "url_icone_rss",
        "url_icone_itunes",
        "display_itunes_rss",
        "url_search",
    ]);
    if (this.language)
        utils.use_lang(this.language);
    
    this.overlay = new OverlayDisplayManager({ language: this.language });
    this.api_manager = new ECMSAPIManager({ base_url: this.base_url, use_proxy: this.use_proxy, language: this.language });

    var obj = this;
    $(document).ready(function () {
        obj.init();
    });
    if (this.browse_search) {
        this.btn_class = 'tab-button';
        var obj = this;
        $(window).bind("hashchange", function () {
            if (window.location.hash.substring(1)) {
                var slug = window.location.hash.substring(1);
                var oid = null;
                if (obj.catalog) {
                    for (var coid in obj.catalog) {
                        if(obj.catalog[coid].slug === slug && obj.catalog[coid].oid.substring(1) === 'c') {
                            oid = coid;
                        }
                    }
                    
                }
                
                if (!oid) {
                    obj.api_manager.ajax_call('get_channels', {slug: slug}, function(data) {
                        if (data.info) {
                            obj.current_category_oid = data.info.oid;
                            obj.display_channel(data.info.oid);
                            obj.tree_manager.expand_tree(data.info.oid);
                            obj.tree_manager.set_active(data.info.oid);
                        } else {
                            console.log(data);
                        }
                    });
                } else {
                    obj.current_category_oid = oid;
                    obj.display_channel(oid);
                    obj.tree_manager.expand_tree(oid);
                    obj.tree_manager.set_active(oid);
                }
            } else {
                obj.current_category_oid = 0;
                obj.display_channel(0);
                obj.tree_manager.expand_tree(0);
                obj.tree_manager.set_active(0);
            }
        });
    }
}

ECMSCatalogBrowser.prototype.init = function() {
    var obj = this;
    // build widget structure
    var html = "<div class=\"catalogbrowser cb-display-list\">";
    html += "<div class=\"cb-left\">";
    html +=     "<div class=\"cb-column\">";
    html += this.get_tab_menu_html();
    html += this.get_tree_hmtl();
    html += this.get_search_hmtl();
    html += this.get_latest_hmtl();
    html +=     "</div>";
    html += "</div>";
    html += "<div class=\"cb-right\">";
    //html += this.get_filters_hmtl();
    html += this.get_display_hmtl();
    if (!this.use_overlay)
        html += "<div class=\"main-block-content\">";
    html += this.get_column_list_hmtl();
    html += this.get_column_search_hmtl();
    html += this.get_column_latest_hmtl();
    html +=     "<div class=\"cb-loading\"><div>" + this.translate("Loading...") + "</div></div>";
    html += "</div>";
    if (!this.use_overlay)
        html += "</div>";
    html += "</div>";
    this.$widgets.main = $(html);
    
    // get elements
    this.$widgets.tree = $(".cb-left .cb-tree", this.$widgets.main);
    this.$widgets.loading = $(".cb-right .cb-loading", this.$widgets.main);
    this.$widgets.content_list = $(".cb-column-list .cb-content", this.$widgets.main);
    this.$widgets.content_search = $(".cb-column-search .cb-content", this.$widgets.main);
    this.$widgets.content_latest = $(".cb-column-latest .cb-content", this.$widgets.main);
    this.$widgets.message_list = $(".cb-column-list .cb-message", this.$widgets.main);
    this.$widgets.message_search = $(".cb-column-search .cb-message", this.$widgets.main);
    this.$widgets.message_latest = $(".cb-column-latest .cb-message", this.$widgets.main);
    this.$widgets.search_form = $(".cb-left-search", this.$widgets.main);
    this.$widgets.search_results = $(".cb-column-search .cb-search-results-count", this.$widgets.main);
    this.$widgets.latest_btn = $(".cb-column-latest .cb-latest-btn", this.$widgets.main);
    this.$widgets.filters_btn = $(".cb-btn-filters", this.$widgets.main);
    this.$widgets.filters_menu = $(".cb-filters-menu", this.$widgets.main);
    this.$widgets.display_btn = $(".cb-btn-display", this.$widgets.main);
    this.$widgets.display_menu = $(".cb-display-menu", this.$widgets.main);
    this.$widgets.latest_place = $(".cb-column-latest .cb-latest-place", this.$widgets.main);
    // get initial media or channel info
    if (this.initial_oid)
        this.pick(this.initial_oid);
    
    // events
    $(".cb-btn-list", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("list"); });
    $(".cb-btn-search", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("search"); });
    $(".cb-btn-latest", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.change_tab("latest"); });
    $(".cb-btn-display", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.toggle_menu("display"); });
    //$(".cb-btn-filters", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.toggle_menu("filters"); });
    //$(".cb-filters-menu  div select", this.$widgets.main).change({ obj: this }, function (evt) { evt.data.obj.toggle_filter_control(evt, this); });
    $(".cb-latest-more-5", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_more_click(5); });
    $(".cb-latest-more-20", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_more_click(20); });
    $(".cb-latest-refresh", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.latest_refresh(); });
    $("form", this.$widgets.main).submit({ obj: this }, function (evt) { evt.data.obj.on_search_submit(); });
    $("#display_as_list", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.display_as_list(); });
    $("#display_as_thumbnails", this.$widgets.main).click({ obj: this }, function (evt) { evt.data.obj.display_as_thumbnails(); });
    if (this.display_mode == 'list') {
        this.display_as_list();
    } else {
        this.display_as_thumbnails();
    }
    if (this.use_overlay) {
        $(window).resize(function () {
            obj.resize();
        });
        this.resize();
    }
};

ECMSCatalogBrowser.prototype.get_tab_menu_html = function() {
    var html = '';
    html += "<div class=\"cb-title\">";
    html +=     "<div class=\""+ this.btn_class + " cb-btn-list cb-active\">" + this.translate("Channels list") + "</div>";
    html +=     "<div class=\""+ this.btn_class + " cb-btn-search\">" + this.translate("Search") + "</div>";
    html +=     "<div class=\""+ this.btn_class + " cb-btn-latest\">" + this.translate("Latest content") + "</div>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_display_hmtl = function() {
    var html = "<div class=\"cb-display-btn-place\"><div class=\""+ this.btn_class + " cb-btn-display\">" + this.translate("Display") + "</div></div>";
    html += "<div class=\"cb-display-menu\">";
    html += "<p class=\"cb-display-title\">" + this.translate("Display mode:") + "</p>";
    html += "<button class=\"cb-btn " + ( this.display_mode === "list" ? "cb-active" : "") + "\" id=\"display_as_list\">" + this.translate("list") + "</button>";
    html += "<button class=\"cb-btn " + ( this.display_mode === "thumbnail" ? "cb-active" : "") + "\" id=\"display_as_thumbnails\">" + this.translate("thumbnails") + "</button>";
   // html += "<p>" + this.translate("Number of elements per page:") + "</p>";
   // html += "    <input type=\"text\" class=\"center\" id=\"elements_per_page\" value=\"30\"/>"; TODO pagination
   // html += "<button type=\"submit\" onclick=\"javascript: cm.set_elements_per_page();\">" + this.translate("Ok") + "</button>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_filters_hmtl = function() {
    var html = "<div class=\"cb-filters-btn-place\"><div class=\""+ this.btn_class + " cb-btn-filters\">" + this.translate("Filters") + "</div></div>";
    html += "<div class=\"cb-filters-menu\">";
    if (this.displayable_content.indexOf("c") != -1) {
        html += "<div><b>" + this.translate("Channels:") + "</b><br/>";
        html += "<label for=\"filter_categories_editable\">" + this.translate("Editable") + "</label>";
        html += " <select id=\"filter_categories_editable\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("v") != -1) {
        html += "<div><p>" + this.translate("Videos:") + "</p>";
        html += "<label for=\"filter_videos_editable\">" + this.translate("Editable") + "</label>";
        html += " <select id=\"filter_videos_editable\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select><br/>";
        html += "<label for=\"filter_videos_published\">" + this.translate("Published") + "</label>";
        html += " <select id=\"filter_videos_published\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("l") != -1) {
        html += "<div><p>" + this.translate("Lives:") + "</p>";
        html += "<label for=\"filter_lives_editable\">" + this.translate("Editable") + "</label>";
        html += " <select id=\"filter_lives_editable\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select>";
        html += "<label for=\"filter_lives_published\">" + this.translate("Published") + "</label>";
        html += " <select id=\"filter_lives_published\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select></div>";
    }
    if (this.displayable_content.indexOf("p") != -1) {
        html += "<div><p>" + this.translate("Photos groups:") + "</p>";
        html += "<label for=\"filter_photos_editable\">" + this.translate("Editable") + "</label>";
        html += "<select id=\"filter_photos_editable\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select><br/>";
        html += "<label for=\"filter_photos_published\">" + this.translate("Published") + "</label>";
        html += " <select id=\"filter_photos_published\">";
        html += " <option value=\"all\">" + this.translate("all") + "</option>";
        html += " <option value=\"yes\">" + this.translate("yes") + "</option>";
        html += " <option value=\"no\">" + this.translate("no") + "</option>";
        html += " </select></div>";
    }
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_tree_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-container cb-left-list\">";
    html +=     "<div class=\"cb-tree catalog-channels\"></div>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_search_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-container cb-left-search\">";
    html +=     "<form class=\"cb-search-block\" method=\"get\" action=\".\" onsubmit=\"javascript: return false;\">";
    html +=         "<label class=\"cb-search-title\" for=\"catalog_browser_search\">" + this.translate("Search:") + "</label>";
    html +=         " <div class=\"cb-search-input\"><input id=\"catalog_browser_search\" type=\"text\" value=\"\">";
    html +=         " <input id=\"catalog_browser_search_start\" type=\"submit\" value=\"" + this.translate("Go") + "\"></div>";
    html +=     "</form>";
    html +=     "<div class=\"cb-search-block\">";
    html +=         "<div class=\"cb-search-title\">" + this.translate("Search in:") + "</div>";
    html +=         " <div><input id=\"catalog_browser_search_in_titles\" type=\"checkbox\" checked=\"checked\">";
    html +=         " <label for=\"catalog_browser_search_in_titles\">" + this.translate("titles") + "</label></div>";
    html +=         " <div><input id=\"catalog_browser_search_in_descriptions\" type=\"checkbox\" checked=\"checked\">";
    html +=         " <label for=\"catalog_browser_search_in_descriptions\">" + this.translate("descriptions") + "</label></div>";
    html +=         " <div><input id=\"catalog_browser_search_in_keywords\" type=\"checkbox\" checked=\"checked\">";
    html +=         " <label for=\"catalog_browser_search_in_keywords\">" + this.translate("keywords") + "</label></div>";
    if (this.displayable_content.length > 1 || this.displayable_content.indexOf("c") == -1) {
        html +=     " <div><input id=\"catalog_browser_search_in_licenses\" type=\"checkbox\">";
        html +=     " <label for=\"catalog_browser_search_in_licenses\">" + this.translate("licenses") + "</label></div>";
        html +=     " <div><input id=\"catalog_browser_search_in_companies\" type=\"checkbox\">";
        html +=     " <label for=\"catalog_browser_search_in_companies\">" + this.translate("companies") + "</label></div>";
    }
    if (this.displayable_content.indexOf("v") != -1) {
        html +=     " <div><input id=\"catalog_browser_search_in_chapters\" type=\"checkbox\" checked=\"checked\">";
        html +=     " <label for=\"catalog_browser_search_in_chapters\">" + this.translate("chapters") + "</label></div>";
    }
    if (this.displayable_content.indexOf("v") != -1 || this.displayable_content.indexOf("p") != -1) {
        html +=     " <div><input id=\"catalog_browser_search_in_photos\" type=\"checkbox\" checked=\"checked\">";
        html +=     " <label for=\"catalog_browser_search_in_photos\">" + this.translate("photos") + "</label></div>";
    }
    html +=     "</div>";
    if (this.displayable_content.length > 1) {
        html += "<div class=\"cb-search-block\">";
        html +=     "<div class=\"cb-search-title\">" + this.translate("Search for:") + "</div>";
        if (this.displayable_content.indexOf("c") != -1) {
            html +=   " <div><input id=\"catalog_browser_search_for_categories\" type=\"checkbox\" checked=\"checked\">";
            html +=   " <label for=\"catalog_browser_search_for_categories\">" + this.translate("channels") + "</label></div>";
        }
        if (this.displayable_content.indexOf("v") != -1) {
            html +=   " <div><input id=\"catalog_browser_search_for_videos\" type=\"checkbox\" checked=\"checked\">";
            html +=   " <label for=\"catalog_browser_search_for_videos\">" + this.translate("videos") + "</label></div>";
        }
        if (this.displayable_content.indexOf("l") != -1) {
            html +=   " <div><input id=\"catalog_browser_search_for_lives\" type=\"checkbox\" checked=\"checked\">";
            html +=   " <label for=\"catalog_browser_search_for_lives\">" + this.translate("live streams") + "</label></div>";
        }
        if (this.displayable_content.indexOf("p") != -1) {
            html +=   " <div><input id=\"catalog_browser_search_for_photos\" type=\"checkbox\" checked=\"checked\">";
            html +=   " <label for=\"catalog_browser_search_for_photos\">" + this.translate("photos groups") + "</label></div>";
        }
        html += "</div>";
    }
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_latest_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-container cb-left-latest\">";
    html +=     "<div class=\"info\">" + this.translate("This list presents all media and channels ordered by add date in the catalog.") + "</div>";
    if (this.displayable_content.length > 1 && this.displayable_content.indexOf("c") != -1) {
        html += "<p>";
        html +=     "<input id=\"latest_display_channels\" type=\"checkbox\">";
        html +=     " <label for=\"latest_display_channels\">" + this.translate("display channels") + "</label>";
        html += "</p>";
        html += "<p><button type=\"button\" class=\"cb-latest-refresh\">" + this.translate("Apply") + "</button></p>";
    }
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_column_list_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-column cb-column-list\">";
    html +=     "<div class=\"cb-title\">" + this.translate("Channel's content")+"</div>";
    html +=     "<div class=\"cb-container\">";
    html +=         "<div class=\"cb-message\">";
    html +=             "<div class=\"info\">" + this.translate("Select a channel to display its content.") + "</div>";
    html +=         "</div>";
    html +=         "<div class=\"cb-content\"></div>";
    html +=     "</div>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_column_search_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-column cb-column-search\">";
    html +=     "<div class=\"cb-title\">" + this.translate("Search results") + " <span class=\"cb-search-results-count\"></span></div>";
    html +=     "<div class=\"cb-container\">";
    html +=         "<div class=\"cb-message\">";
    html +=             "<div class=\"info\">" + this.translate("Use the input in the left column to search for something.") + "</div>";
    html +=         "</div>";
    html +=         "<div class=\"cb-content\"></div>";
    html +=     "</div>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.get_column_latest_hmtl = function() {
    var html = '';
    html += "<div class=\"cb-column cb-column-latest\">";
    html +=     "<div class=\"cb-title\">" + this.translate("Latest content added in the catalog") + "</div>";
    html +=     "<div class=\"cb-container\">";
    html +=         "<div class=\"cb-message\"></div>";
    html +=         "<div class=\"cb-content\">";
    html +=             "<div class=\"cb-latest-place\"></div>";
    html +=             "<div class=\"cb-latest-btn\">";
    html +=                 "<button type=\"button\" class=\"std-btn cb-latest-more-5\">" + this.translate("Display 5 more items") + "</button>";
    html +=                 "<button type=\"button\" class=\"std-btn cb-latest-more-20\">" + this.translate("Display 20 more items") + "</button>";
    html +=             "</div>";
    html +=         "</div>";
    html +=     "</div>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype.toggle_menu = function(menu) {
    if (menu == 'filters') {
        if (this.$widgets.filters_btn.hasClass("cb-active")) {
            this.$widgets.filters_btn.removeClass("cb-active");
            this.$widgets.filters_menu.removeClass("cb-active");
        } else {
            this.$widgets.filters_btn.addClass("cb-active");
            this.$widgets.filters_menu.addClass("cb-active");
        }
    } else if (menu == 'display') {
        if (this.$widgets.display_btn.hasClass("cb-active")) {
            this.$widgets.display_btn.removeClass("cb-active");
            this.$widgets.display_menu.removeClass("cb-active");
        } else {
            this.$widgets.display_btn.addClass("cb-active");
            this.$widgets.display_menu.addClass("cb-active");
        }
    }
};
ECMSCatalogBrowser.prototype.toggle_filter_control = function(event, js_obj) {
    var id = js_obj.id;
    if (id === 'filter_categories_editable'){return;}
    if (id === 'filter_videos_editable'){return;}
    if (id === 'filter_videos_published'){return;}
    if (id === 'filter_lives_editable'){return;}
    if (id === 'filter_lives_published'){return;}
    if (id === 'filter_photos_editable'){return;}
    if (id === 'filter_photos_published'){return;}
    return;
};
ECMSCatalogBrowser.prototype.display_as_list = function() {
    if ($('#display_as_list').hasClass('cb-active')) {
        return;
    }
    this.display_mode = 'list';
    $('#display_as_thumbnails').removeClass('cb-active');
    $('#display_as_list').addClass('cb-active');
    $('#container').css('width', '1000px');
    $('.catalogbrowser .cb-content .item-entry.list').css('float', 'none');
    utils.set_cookie("catalog-display_mode", this.display_mode);
    if (this.last_search_response)
        this.display_content("search", this.last_search_response, undefined);
    if (this.last_cat_content)
        this.display_content("list", this.last_cat_content, this.current_category_oid);
    if (this.last_latest)
        this.display_latest(this.last_latest);
};
ECMSCatalogBrowser.prototype.display_as_thumbnails = function() {
    if ($('#display_as_thumbnails').hasClass('cb-active')) {
        return;
    }
    this.display_mode = 'thumbnail';
    $('#display_as_list').removeClass('cb-active');
    $('#display_as_thumbnails').addClass('cb-active');
    $('#container').css('width', '100%');
    $('.catalogbrowser .cb-content .item-entry.thumbnail').css('float', 'left');
    utils.set_cookie("catalog-display_mode", this.display_mode);
    if (this.last_search_response)
        this.display_content("search", this.last_search_response, undefined);
    if (this.last_cat_content)
        this.display_content("list", this.last_cat_content, this.current_category_oid);
    if (this.last_latest)
        this.display_latest(this.last_latest);
};
ECMSCatalogBrowser.prototype.change_tab = function(tab_id) {
    if (this.$widgets.main.hasClass("cb-display-" + tab_id))
        return;
    if (tab_id == "latest")
        this.latest_init();
    $(".cb-btn-" + this.displayed, this.$widgets.main).removeClass("cb-active");
    $(".cb-btn-" + tab_id, this.$widgets.main).addClass("cb-active");
    this.$widgets.main.removeClass("cb-display-" + this.displayed).addClass("cb-display-"+tab_id);
    this.displayed = tab_id;
};
ECMSCatalogBrowser.prototype.open = function() {
    var obj = this;
    if (!this.tree_manager) {
        var callback_tree = function (oid) {
            if (obj.use_overlay)
                obj.display_channel(oid);
            else {
                var callback_get_info = function(data) {
                    var item = data.info;
                    window.location = obj._get_btn_link(item, 'view');
                };
                obj.get_info(oid, true, callback_get_info);
            }
        };
        this.tree_manager = new ECMSTreeManager({
            $place: this.$widgets.tree,
            base_url: this.base_url,
            use_proxy: this.use_proxy,
            request_data: this.request_data,
            display_root: this.displayable_content.indexOf("c") != -1,
            current_category_oid: this.current_category_oid,
            on_change: callback_tree,
            on_data_retrieved: function (data) { obj.update_catalog(data); }
        });
        if (this.displayable_content.indexOf("c") != -1) {
            this.display_channel(this.current_category_oid);
        }
    }
    if (this.use_overlay) {
        this.overlay.show({
            mode: "html",
            title: this.title,
            html: this.$widgets.main,
            on_hide: function () { obj.$widgets.main.detach(); }
        });
    }
};
ECMSCatalogBrowser.prototype.update_catalog = function(item, full) {
    if (!item || !item.oid)
        return;
    if (!this.catalog[item.oid]) {
        if (full)
            item.is_full = true;
        this.catalog[item.oid] = item;
    } else {
        for (var field in item) {
            this.catalog[item.oid][field] = item[field];
        }
        if (full)
            this.catalog[item.oid].is_full = true;
    }
};
ECMSCatalogBrowser.prototype.get_info = function(oid, full, callback, async) {
    if (!oid || !callback)
        return;
    var item = null;
    async = typeof async !== 'undefined' ? async : true;
    for (var s_oid in this.catalog) {
        if (s_oid == oid) {
            if (full && this.catalog[oid].is_full)
                item = this.catalog[oid];
            if (!full)
                item = this.catalog[oid];
            break;
        }
    }
    if (item) {
        var data = { info: item, success: true };
        callback(data);
        return;
    }
    var method = '';
    var data = { oid: oid };
    if (full)
        data.full = "yes";
    if (oid[0] == "v" || oid[0] == "l" || oid[0] == "p") {
        method = 'get_medias';
    }
    else if (oid[0] == "c") {
        method = 'get_channels';
    }
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    var obj = this;
    var callback_update = function(data) {
        if (data.success) {
            obj.update_catalog(data.info, full);
            callback(data);
        }
        else {
            obj.display_message("list", data.error);
        }
    };
    if (method)
        this.api_manager.ajax_call(method, data, callback_update, null, null, async);
};
ECMSCatalogBrowser.prototype.display_channel = function(cat_oid) {
    this.change_tab("list");
    this.current_category_oid = cat_oid;
    this.tree_manager.set_active(cat_oid);
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
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    var obj = this;
    this.display_loading();
    var callback = function (response) {
        obj.hide_loading();
        if (response.success) {
            obj.last_cat_content = response;
            obj.hide_message("list");
            obj.display_content("list", response, cat_oid);
        }
        else {
            obj.$widgets.content_list.html("");
            obj.display_message("list", response.error);
        }
    };
    this.api_manager.ajax_call('get_channels_content', data, callback);
};
ECMSCatalogBrowser.prototype.display_content = function(target, data, cat_oid, type) {
    var $container = this.$widgets["content_" + target];
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
                results.push(nb_channels + " " + this.translate("channel(s)"));
            if (nb_videos > 0)
                results.push(nb_videos + " " + this.translate("video(s)"));
            if (nb_live_streams > 0)
                results.push(nb_live_streams + " " + this.translate("live stream(s)"));
            if (nb_photos_groups > 0)
                results.push(nb_photos_groups + " " + this.translate("photos group(s)"));
            this.$widgets.search_results.html(results.join(", "));
        } else {
            this.display_message(target, this.translate("No results."), "info");
            this.$widgets.search_results.html("");
            return;
        }
    } else {
        // category display
        selectable = this.selectable_content.indexOf("c") != -1;
        if (cat_oid != "0") {
            // parent link
            var parent_oid = (this.catalog[cat_oid] && this.catalog[cat_oid].parent_oid) ? this.catalog[cat_oid].parent_oid : 0;
            var parent_title = (parent_oid && this.catalog[parent_oid]) ? this.translate("Parent channel:") + " " + this.catalog[parent_oid].title : this.translate("Parent channel");
            $container.append(this.get_content_entry("parent", {
                oid: parent_oid,
                title: parent_title,
                extra_class: "item-entry-small",
                selectable: (!this.parent_selection_oid || data.parent_selectable),
                no_save: true,
                slug: (this.catalog[parent_oid] ? this.catalog[parent_oid].slug : ''),
            }, parent_oid != 0 && selectable));
            // current category selection button
            var obj = this;
            var callback = function(data) {
                $container.append(obj.get_content_entry("current", {
                    oid: cat_oid,
                    title: data.info.title,
                    description: data.info.description,
                    extra_class: "item-entry-small",
                    selectable: (!obj.parent_selection_oid || obj.selectable),
                    no_save: true,
                    can_edit: data.info.can_edit,
                    dbid: data.info.dbid,
                    slug: data.info.slug,
                }, selectable));
            };
            this.get_info(cat_oid, true, callback, false);
        }
        if (sections == 0) {
            if (selectable) {
                if (this.displayable_content.length > 1)
                    $container.append("<div class=\"info\">" + this.translate("This channel contains no sub channels and no medias.") + "</div>");
                else
                    $container.append("<div class=\"info\">" + this.translate("This channel contains no sub channels.") + "</div>");
            }
            else
                $container.append("<div class=\"info\">" + this.translate("This channel contains no medias.") + "</div>");
            return;
        }
    }
    if (data.channels && data.channels.length > 0) {
        // sub categories
        selectable = this.selectable_content.indexOf("c") != -1;
        if (!cat_oid)
            $container.append("<div class=\"cb-section\">" + this.translate("Channels") + "</div>");
        else
            $container.append("<div class=\"cb-section\">" + this.translate("Sub channels") + "</div>");
        for (var i=0; i < data.channels.length; i++) {
            if (data.channels[i].parent_oid === undefined && cat_oid)
                data.channels[i].parent_oid = cat_oid;
            $container.append(this.get_content_entry("channel", data.channels[i], selectable, type));
        }
    }
    if (data.live_streams && data.live_streams.length > 0) {
        // live streams
        selectable = this.selectable_content.indexOf("l") != -1;
        $container.append("<div class=\"cb-section\">" + this.translate("Lives streams") + "</div>");
        for (var i=0; i < data.live_streams.length; i++) {
            $container.append(this.get_content_entry("live", data.live_streams[i], selectable, type));
        }
    }
    if (data.videos && data.videos.length > 0) {
        // videos
        selectable = this.selectable_content.indexOf("v") != -1;
        $container.append("<div class=\"cb-section\">" + this.translate("Videos") + "</div>");
        for (var i=0; i < data.videos.length; i++) {
            $container.append(this.get_content_entry("video", data.videos[i], selectable, type));
        }
    }
    if (data.photos_groups && data.photos_groups.length > 0) {
        // photos groups
        selectable = this.selectable_content.indexOf("p") != -1;
        $container.append("<div class=\"cb-section\">" + this.translate("Photos groups") + "</div>");
        for (var i=0; i < data.photos_groups.length; i++) {
            $container.append(this.get_content_entry("photos", data.photos_groups[i], selectable, type));
        }
    }
};
ECMSCatalogBrowser.prototype.get_content_entry = function(item_type, item, gselectable) {
    var oid = item.oid;
    if (!item.no_save)
        this.update_catalog(item);
    var selectable = gselectable && (!this.parent_selection_oid || item.selectable);
    var $entry = null;
    if (this.use_overlay && item_type == 'parent' && item.oid == '0')
        return $entry;
    if (item_type == 'parent' || item_type == 'current')
        $entry = $("<div class=\"item-entry item-type-" + item_type + " " + "\" id=\"item_entry_" + oid + "\"></div>");
    else
        $entry = $("<div class=\"item-entry item-type-" + item_type + " " + this.display_mode + "\" id=\"item_entry_" + oid + "\"></div>");
    if (this.current_selection && this.current_selection.oid == oid)
        $entry.addClass("selected");
    if (selectable)
        $entry.addClass("selectable");
    if (item.extra_class)
        $entry.addClass(item.extra_class);
    var btn_class = this.use_jquery_ui ? "ui-widget ui-state-default ui-corner-all" : "std-btn";
    
    var html = "";
    if (this.display_mode == 'thumbnail')
        if (this.browse_search && !(item_type == "parent" || item_type == 'current')) {
            html += "<div id=\"item_entry_" + oid + "\"><a class\"obj-block-link\"></a>";
            html +=   "<div class=\"obj-block-info-btn info-thumb\"\
                        title=\"" + this.translate("Open information panel") + "\"></div>";
            if (item.can_edit) {
                var url_edit = this._get_btn_link(item, 'edit');
                html +=   "<div class=\"obj-block-edit\"\
                                title=\"" + this.translate("Edit it") + "\">";
                html +=         "<a href=\"" + (url_edit ? url_edit : '') + "\"></a>";
                html +=    "</div>";
            }
            html += "</div>";

            html += "<div class=\"overlay-info\" id=\"item_entry_" + oid + "_info\" style=\"display: none;\"></div>";
        }
    html += this._get_entry_block_html(item, btn_class, item_type, selectable);
    var $entry_block = $(html);
    if (this.display_mode == 'thumbnail')
        this._set_thumbnail_info_box_html(item_type, btn_class, selectable, oid, $entry_block, item);
    this._set_on_click_entry_block($entry_block, oid, item_type, selectable);
    $entry.append($entry_block);
    
    html = this._get_entry_links_html(item, btn_class, item_type, selectable);
    var $entry_links = $(html);
    this._set_on_click_entry_links($entry_links, item, oid, item_type, selectable);
    $entry.append($entry_links);
    
    return $entry;
};
ECMSCatalogBrowser.prototype._get_entry_block_html = function(item, btn_class, item_type, selectable) {
    var html = "<div class=\"item-entry-link " + (selectable || item_type == "channel" || item_type == "parent" ? "clickable" : "") + "\">";
    if (item.thumb)
        if (this.display_mode == 'thumbnail' && !(item_type == 'parent' || item_type == 'current'))
            html += "<span class=\"item-entry-preview obj-block-link\" style=\"background-image: url(" + item.thumb + ");\"></span>";
        else
            html += "<span class=\"item-entry-preview\"><img src=\"" + item.thumb + "\"/></span>";
    else
        html += "<span class=\"item-entry-preview\"><span class=\"item-" + item_type + "-icon\"></span></span>";
    if (this.display_mode == 'thumbnail' && !(item_type == 'parent' || item_type == 'current')) {
        html += "<div>";
        html +=   "<span class=\"item-entry-title\">" + utils.escape_html(item.title) + "</span>";
        if (item.duration)
            html +=   "<span class=\"item-entry-duration\">" + item.duration + "</span>";
        html += "</div>";
    }
    html +=     "<span class=\"item-entry-content\">";
    html +=         "<span class=\"item-entry-top-bar\">";
    html +=             "<span class=\"item-entry-title\">" + utils.escape_html(item.title) + "</span>";
    if (this.browse_search && item_type == 'current' && item.can_edit) {
        var url_edit = this._get_btn_link(item, 'edit');
        html += "<div class=\"item-entry-links\"><span class=\"" + btn_class + " item-entry-pick item-entry-pick-edit-media\"><a href=\"" + (url_edit ? url_edit : '') + "\">" + this.translate("Edit this channel") + "</a></span></div>";
    }
    if (this.display_mode == 'thumbnail' && !(item_type == 'parent' || item_type == 'current'))
        html +=         "<span class=\"item-entry-close\">X</span>";
    if (item.can_edit && !(item_type == 'parent' || item_type == 'current')) {
        if (item.accessibility !== undefined) {
            var atext;
            switch (item.accessibility) {
                case "all": atext = "Accessible for all users"; break;
                case "auth": atext = "Accessible only for authenticated users"; break;
                case "perm": atext = "Accessible only for authenticated users with access right"; break;
                case "": atext = "Inaccessible for all users"; break;
            }
            if (atext)
                html +=     "<span class=\"item-entry-accessibility " + item.accessibility + "\" title=\"" + this.translate(atext) + "\"></span>";
        }
        if (item.visibility !== undefined) {
            var vtext;
            switch (item.visibility) {
                case "all": vtext = "Visible for all users"; break;
                case "auth": vtext = "Visible only for authenticated users"; break;
                case "perm": vtext = "Visible only for authenticated users with access right"; break;
                case "": vtext = "Invisible for all users"; break;
            }
            if (vtext)
                html +=     "<span class=\"item-entry-visibility " + item.visibility + "\" title=\"" + this.translate(vtext) + "\"></span>";
        }
        if (item_type != "channel") {
            if (item.validated)
                html +=     "<span class=\"item-entry-publication published\" title=\"" + this.translate("This media is published") + "\"></span>";
            else
                html +=     "<span class=\"item-entry-publication\" title=\"" + this.translate("This media is not published") + "\"></span>";
        }
        if (item_type == "video" && !item.ready)
            html +=         "<span class=\"item-entry-state\" title=\"" + this.translate("This video is not ready") + "\"></span>";
    }
    if (item.duration && this.display_mode != 'thumbnail')
        html +=         "<span class=\"item-entry-duration\">" + item.duration + "</span>";
    html +=         "</span>";
    html +=         "<span class=\"item-entry-bottom-bar\">";
    if (item.show_type)
        html +=         "<span class=\"item-entry-type\">" + this.translate("Type:") + " " + this.translate(item_type) + "</span>";
    if (item.creation)
        html +=         "<span class=\"item-entry-date\">" + this.translate("Created on") + " " + utils.get_date_display(item.creation) + "</span>";
    if (item.show_add_date && item.add_date)
        html +=         "<span class=\"item-entry-date\">" + this.translate("Added on") + " " + utils.get_date_display(item.add_date) + "</span>";
    if (item.show_parent_title && item.parent_title)
        html +=         "<span class=\"item-entry-parent\">" + this.translate("Parent channel:") + " " + item.parent_title + "</span>";
    //if (item.matching && this.no_overlay)
      //  html +=         "<span class=\"item-entry-parent\">"+this.translate("Found in") +": "+item.matching.replace(',', ' + ')+"</span>";
    if(item.chapters && this.browse_search && this.displayed == 'search') {
        html +=         "<span class='item-entry-date item-entry-chapters'><p>" + this.translate("chapters") + ":</p><ul>";
        for (var index in item.chapters) {
            var chapter = item.chapters[index];
            html += "<li><a href='/videos/" + item.slug + "/#start=" + chapter.time +  "&autoplay'>";
            if (chapter.title)
                html += chapter.title;
            else
                html += chapter.time_display;
            html += "</a></li>";
        }
        html += "</ul></span>";
    }
    html +=         "</span>";
    html +=     "</span>";
    html += "</div>";
    if (this.browse_search && this.displayed == 'list' && item_type == 'current') {
        html += "<div class=\"category-description-text\">" + item.description + "</div>\
                    <div class=\"category-description-rss\"> ";
                    if (this.display_itunes_rss) {
                        html += this.translate("Subscribe to channel's videos RSS:") +
                        "<a href=\"/channels/" + item.oid + "/rss.xml\">\
                            <img src=\"" + this.url_icone_rss + "\"/> " + this.translate("standard") + "</a>\
                        <a href=\"/channels/playlist/itunes/" + item.slug + ".xml\">\
                            <img src=\"" + this.url_icone_itunes + "\"/> " + this.translate("iTunes") + "</a>\
                        <a href=\"/channels/playlist/itunes/audio/" + item.slug + ".xml\">\
                            <img src=\"" + this.url_icone_itunes + "\"/> " + this.translate("iTunes (audio only)") + "</a>";
                    } else {
                       html += "<a href=\"/channels/" + item.oid + "/rss.xml\">\
                        <img src=\"" + this.url_icone_rss + "\"/>" + this.translate("Subscribe to channel's videos RSS") + "</a>";
                    }
        html +=     "</div>";
    }
    return html;
};
ECMSCatalogBrowser.prototype._set_on_click_entry_block = function($entry_block, oid, item_type, selectable) {
    if (this.display_mode != 'thumbnail') {
        if (item_type == "channel" || item_type == "parent") {
            $entry_block.click({ obj: this, oid: oid }, function(evt) {
                if (evt.data.obj.use_overlay) {
                    evt.data.obj.display_channel(evt.data.oid);
                    evt.data.obj.tree_manager.expand_tree(evt.data.oid);
                } else {
                    if (item_type == "parent" && evt.data.oid == '0')
                        window.location = evt.data.obj._get_btn_link(null);
                    else
                        evt.data.obj.pick(evt.data.oid);
                }
            });
        } else if ((selectable && this.use_overlay) || (this.browse_search && this.display_mode != 'thumbnail' && (item_type != "current" && item_type != "channel" && item_type != "parent"))) {
            $entry_block.click({ obj: this, oid: oid }, function(event) {
                event.data.obj.pick(event.data.oid);
            });
        }
    } else if (!(item_type == 'parent' || item_type == 'current')) {
        $(".item-entry-preview", $entry_block).click({ obj: this, oid: oid }, function(evt) {
            if (evt.data.obj.use_overlay && !selectable) {
                evt.data.obj.display_channel(evt.data.oid);
                evt.data.obj.tree_manager.expand_tree(evt.data.oid);
            } else {
                evt.data.obj.pick(evt.data.oid);
            }
        });
    } else {
        $entry_block.click({ obj: this, oid: oid }, function (evt) {
            if (evt.data.obj.use_overlay && !selectable) {
                evt.data.obj.display_channel(evt.data.oid);
                evt.data.obj.tree_manager.expand_tree(evt.data.oid);
            } else {
                if (item_type == "parent" && evt.data.oid == '0' && !evt.data.obj.use_overlay) {
                    window.location = evt.data.obj._get_btn_link(null);
                } else {
                    evt.data.obj.pick(evt.data.oid);
                }
            }
        });
    }
};
ECMSCatalogBrowser.prototype._get_entry_links_html = function(item, btn_class, item_type, selectable) {
    var html = "<div class=\"item-entry-links\">";
    var url_view = this._get_btn_link(item, 'view');
    if ((item_type == "channel" || item_type == "parent") && !this.use_overlay)
        html += "<span class=\"" + btn_class + " item-entry-display\">" + (url_view ? "<a href=\"" +  url_view + "\">" : '')  + this.translate("Display channel") + (url_view ? "</a>" : '') + "</span>";
    if (selectable && this.use_overlay) {
        if (item_type == "channel" || item_type == "parent" || item_type == "current")
            html += "<span class=\"" + btn_class + " main item-entry-pick\">" + this.translate("Select this channel") + "</span>";
        else
            html += "<span class=\"" + btn_class + " main item-entry-pick\">" + this.translate("Select this media") + "</span>";
    } else {
        if (!(item_type == "parent" || item_type == "current") && !this.use_overlay) {
            if (item_type != "channel") {
                html += "<span class=\"" + btn_class + " item-entry-pick-view-media\"><a href=\"" + (url_view ? url_view : '') + "\">" + this.translate("See") + "</a></span>";
            }
            if (item.can_edit) {
                var url_edit = this._get_btn_link(item, 'edit');
                html += "<span class=\"" + btn_class + " item-entry-pick-edit-media\"><a href=\"" + (url_edit ? url_edit : '') + "\">" + this.translate("Edit")  + "</a></span>";
            }
            if (item.can_delete)
                html += "<span class=\"" + btn_class + " item-entry-pick-delete-media\">" + this.translate("Delete") + "</span>";
        }
    }
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype._get_btn_link = function(item, action) {
    var type = '';
    var prefix = '';
    if (item) {
        type = item.oid[0];
    }
    if (!type || type === '' || type === '0') {
        if (!item || item.oid == '0')
            return '/channels/#';
    }
    if (action == 'view') {
        if (type == 'c') {
            prefix = '/channels/#';
        } else if (type == 'l') {
            prefix = '/lives/';
        } else if (type == 'v') {
            prefix = '/videos/';
        } else if (type == 'p') {
            prefix = '/photos/';
        }
        if (prefix && item.slug)
            return (prefix + item.slug);
    } else if (action == 'edit') {
        if (type == 'c')
            return ("/admin/channels/" + item.dbid);
        else
            return ("/edit/" + item.oid);
    }
    return;
};
ECMSCatalogBrowser.prototype._set_on_click_entry_links = function($entry_links, item, oid, item_type, selectable) {
    if (item_type == "channel" || (item_type == "parent"))
        $(".item-entry-display", $entry_links).click({ obj: this, oid: oid }, function (event) {
            if (event.data.obj.use_overlay)
                event.data.obj.display_channel(event.data.oid);
        });
    if (selectable) {
        $(".item-entry-pick", $entry_links).click({ obj: this, oid: oid }, function (event) { event.data.obj.pick(event.data.oid); });
    }
    if (this.browse_search) {
        if (item.can_delete)
            $(".item-entry-pick-delete-media", $entry_links).click({ obj: this, oid: oid }, function(evt) { evt.data.obj.pick(evt.data.oid, 'delete'); });
    }
};
ECMSCatalogBrowser.prototype._get_thumbnail_info_box_html = function(item, item_type, btn_class, selectable) {
    var html = "<div class=\"overlay-info-title\">\
                  <div class=\"close\" title=\"" + this.translate('Hide this window') + "\" onclick=\"javascript: box_hide_info();\"></div>\
                  <h3><a href=\"\">" + item.title + "</a></h3>\
                </div>\
                <div class=\"overlay-info-content\">";
    html += "<table class=\"overlay-info-table\">";
    if (this.browse_search && this.displayed == 'search') {
        if (item.chapters) {
            html += "<tr><td>" + this.translate("chapters") + ":</td>";
            html += "<tr><td><ul>";
            for (var index in item.chapters) {
                var chapter = item.chapters[index];
                html += "<li><a href='/videos/" + item.slug + "/#start=" + chapter.time +  "&autoplay'>";
                if (chapter.title)
                    html += chapter.title;
                else
                    html += chapter.time_display;
                html += "</a></li>";
            }
            html += "</ul></td></tr>";
        }
    /*    {% if obj.chapters_matches %}
            <div>this.translate("The query has been found in following slides:")</div>
            {% for match in obj.chapters_matches %}
                <p class="marged">
                    <a href="{% url 'mediaserver-video_page' obj.obj.slug %}#start={{ match.time }}&search={{ search }}&autoplay">
                        <span><b><i>{{ match.time_display }}</i></b></span>
                        <span> {{ match.context.title }}</span>
                    </a>
                </p>
            {% endfor %}
        {% endif %}
        {% if obj.photos_matches %}
            <div>this.translate("The query has been found in following photos:")</div>
            {% for match in obj.photos_matches %}
                <p class="marged">
                    <a href="{% url 'mediaserver-video_page' obj.obj.slug %}#start={{ match.index }}&search={{ search }}">
                        <span><b><i>this.translate("Photo") #{{ match.index }}</i></b></span>
                        <span> {{ match.context.title }}</span>
                        <span> <i>{{ match.context.description }}</i></span>
                    </a>
                </p>
            {% endfor %}
        {% endif %}
        {% if obj.audio_matches %}
            <div>this.translate("The query has been found in audio:")</div>
            {% for match in obj.audio_matches %}
                <p class="marged">
                    <a href="{% url 'mediaserver-video_page' obj.obj.slug %}#start={{ match.time }}&search={{ search }}&autoplay">
                        <span><b><i>{{ match.time_display }}</i></b></span>
                        <span> {{ match.context|safe }}</span>
                    </a>
                </p>
            {% endfor %}
        {% endif %}
        {% if obj.chapters_matches or obj.photos_matches or obj.audio_matches %}
            <p><b>this.translate("Information about media")</b></p>
        {% endif %} */
    }
    if (item.creation && item_type == "video")
        html += "<tr>\
                    <td class=\"overlay-info-label\">" + this.translate("Recording date") + " :</td>\
                    <td>" + utils.get_date_display(item.creation) + "</td>\
                </tr>";
    if (item.add_date)
        html += "<tr>\
                    <td class=\"overlay-info-label\">" + this.translate("Publishing date") + ":</td>\
                    <td>" + utils.get_date_display(item.add_date) + "</td>\
                </tr>";
       /* {% if obj.obj.speaker %}{% if obj.obj.OBJECT_TYPE == "video" or obj.obj.OBJECT_TYPE == "live" %}
            <tr>
                <td class="overlay-info-label">this.translate("Speaker") :</td>
                <td>{{ obj.obj.speaker }}</td>
            </tr>
        {% endif %}{% endif %} TODO info speaker dans item */
      /*  {% if obj.obj.views > 1 and obj.obj.display_viewers %}
            <tr>
                <td class="overlay-info-label">this.translate("Views") :</td>
                <td>{{ obj.obj.get_views_display }}</td>
            </tr>
        {% endif %}
        {% if obj.obj.comments > 1 %}
            <tr>
                <td class="overlay-info-label">this.translate("Comments") :</td>
                <td>{{ obj.obj.get_comments_display }}</td>
            </tr>
        {% endif %} TODO get stats*/
    if (item.duration)
        html += "<tr>\
                    <td class=\"overlay-info-label\">" + this.translate("Duration") + " :</td>\
                    <td>" + item.duration + "</td>\
                 </tr>";
    if (item.short_description)
        html += "<tr><td colspan=\"2\"><div class=\"description\">" + item.short_description + "</div></td></tr>";
    html += "<tr><td colspan=\"2\">";
    html += this._get_entry_links_html(item, btn_class, item_type, selectable);
    html += "</td></tr>";
    html += "</table>";
    html += "</div>";
    return html;
};
ECMSCatalogBrowser.prototype._set_thumbnail_info_box_html = function(item_type, btn_class, selectable, oid, $entry_block, item) {
    var obj = this;
    $(".info-thumb", $entry_block).click(function() {
        if ($("#item_entry_" + oid + "_info").html() !== '') {
            box_open_info("item_entry_" + oid);
            return;
        }
        if (obj.displayed == 'search') {
            var html = obj._get_thumbnail_info_box_html(item, item_type, btn_class, selectable);
            $("#item_entry_" + oid + "_info").append($(html));
            var $entry_overlay = $("#item_entry_" + oid + "_info");
            obj._set_on_click_entry_links($entry_overlay, oid, item_type, selectable);
            box_open_info("item_entry_" + oid);
        } else {
            obj.get_info(oid, true, function(data) {
                var item = data.info;
                obj.update_catalog(item);
                var html = obj._get_thumbnail_info_box_html(item, item_type, btn_class, selectable);
                $("#item_entry_" + oid + "_info").append($(html));
                var $entry_overlay = $("#item_entry_" + oid + "_info");
                obj._set_on_click_entry_links($entry_overlay, oid, item_type, selectable);
                box_open_info("item_entry_" + oid);
            });
        }
        
        return;
    });
};
ECMSCatalogBrowser.prototype.pick = function(oid, action) {
    if (oid === null || oid === undefined) {
        // deselect
        if (this.current_selection && this.current_selection.oid)
            $("#item_entry_"+this.current_selection.oid).removeClass("selected");
        return;
    }
    if (this.catalog[oid]) {
        this._pick(oid, { success: true, info: this.catalog[oid] }, true, action);
        return;
    }
    // load info if no info are available
    var obj = this;
    this.get_info(oid, false, function(result) {
        obj._pick(oid, result, false, action);
    });
};
ECMSCatalogBrowser.prototype._pick = function(oid, result, no_update, action) {
    if (result.success) {
        if (this.use_overlay)
            this.overlay.hide();
        // update info in local catalog
        if (!no_update)
            this.update_catalog(result.info);
        // change current selection
        if (this.current_selection && this.current_selection.oid)
            $("#item_entry_"+this.current_selection.oid).removeClass("selected");
        this.current_selection = this.catalog[oid];
        $("#item_entry_"+oid).addClass("selected");
        if (this.on_pick) {
            if (!this.use_overlay) {
                this.on_pick(this.catalog[oid], action);
            } else {
                this.on_pick(this.catalog[oid]);
            }
        }
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
ECMSCatalogBrowser.prototype.get_last_pick = function() {
    return this.current_selection;
};
ECMSCatalogBrowser.prototype.on_search_submit = function(no_pushstate) {
    if (!$("#catalog_browser_search", this.$widgets.search_form).val())
        return;
    // get fields to search in
    var checked = {
        catalog_browser_search_in_titles: $("#catalog_browser_search_in_titles", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_descriptions: $("#catalog_browser_search_in_descriptions", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_keywords: $("#catalog_browser_search_in_keywords", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_licenses: $("#catalog_browser_search_in_licenses", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_companies: $("#catalog_browser_search_in_companies", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_chapters: $("#catalog_browser_search_in_chapters", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_in_photos: $("#catalog_browser_search_in_photos", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_for_categories: $("#catalog_browser_search_for_categories", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_for_videos: $("#catalog_browser_search_for_videos", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_for_lives: $("#catalog_browser_search_for_lives", this.$widgets.search_form).is(":checked"),
        catalog_browser_search_for_photos: $("#catalog_browser_search_for_photos", this.$widgets.search_form).is(":checked")
    };
    var fields = "";
    if (checked.catalog_browser_search_in_titles)
        fields += "_title";
    if (checked.catalog_browser_search_in_descriptions)
        fields += "_description";
    if (checked.catalog_browser_search_in_keywords)
        fields += "_keywords";
    if (this.displayable_content.length > 1 || this.displayable_content.indexOf("c") == -1) {
        if (checked.catalog_browser_search_in_licenses)
            fields += "_license";
        if (checked.catalog_browser_search_in_companies)
            fields += "_company";
    }
    if (this.displayable_content.indexOf("v") != -1 && checked.catalog_browser_search_in_chapters)
        fields += "_chapters";
    if ((this.displayable_content.indexOf("v") != -1 || this.displayable_content.indexOf("p") != -1) && checked.catalog_browser_search_in_photos)
        fields += "_photos";
    if (fields)
        fields = fields.substring(1);
    else
        fields = "metadata";
    // get content to search
    var content = "";
    if (this.displayable_content.length > 1) {
        if (this.displayable_content.indexOf("c") != -1 && checked.catalog_browser_search_for_categories)
            content += "c";
        if (this.displayable_content.indexOf("v") != -1 && checked.catalog_browser_search_for_videos)
            content += "v";
        if (this.displayable_content.indexOf("l") != -1 && checked.catalog_browser_search_for_lives)
            content += "l";
        if (this.displayable_content.indexOf("p") != -1 && checked.catalog_browser_search_for_photos)
            content += "p";
    }
    if (!content)
        content = this.displayable_content;
    // prepare search request
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
    if (this.request_data)
        for (var field in this.request_data) {
            data[field] = this.request_data[field];
        }
    // execute search request
    var obj = this;
    obj.display_loading();
    var callback = function (response) {
        obj.last_search_response = response;
        obj.hide_loading();
        if (response.success) {
            obj.hide_message("search");
            obj.display_content("search", response);
            if (obj.browse_search) {
                var title = obj.translate('Result for') + ' ' + data.search;
                var url = obj.url_search + '?search=' + data.search;
                if (!no_pushstate)
                    window.history.pushState({search: data.search, filters: checked}, title, url);
            }
        }
        else {
            obj.$widgets.content_search.html("");
            obj.display_message("search", response.error);
        }
    };
    this.api_manager.ajax_call('search', data, callback);
};
/* Latest display */
ECMSCatalogBrowser.prototype.latest_init = function() {
    if (this.latest_initialized)
        return;
    this.latest_initialized = true;
    // load videos
    // TODO restore values from cookies
    this.load_latest();
};
ECMSCatalogBrowser.prototype.load_latest = function(count, end) {
    if (this.latest_loading)
        return;
    this.latest_loading = true;
    
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
    var callback = function(response) {
        obj.hide_loading();
        if (response.success) {
            obj.hide_message("latest");
            obj.last_latest = response;
            obj.display_latest(response);
        }
        else {
            obj.display_message("latest", response.error);
        }
        obj.latest_loading = false;
    };
    this.api_manager.ajax_call('get_latest_content', data, callback);
};
ECMSCatalogBrowser.prototype.display_latest = function(result) {
    this.latest_start = result.max_date;
    this.latest_more = result.more === true;
    this.$widgets.latest_place.empty();
    for (var i=0; i < result.items.length; i++) {
        var item = result.items[i];
        item.show_type = true;
        item.show_add_date = true;
        item.show_parent_title = true;
        if (item.date_label && (item.date_label != this.latest_date_label)) {
            this.latest_date_label = item.date_label;
            this.$widgets.latest_place.append("<h3>" + item.date_label + "</h3>");
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
        this.$widgets.latest_btn.css("display", "block");
    else
        this.$widgets.latest_btn.css("display", "none");
};
ECMSCatalogBrowser.prototype.latest_more_click = function(count) {
    if (!this.latest_more)
        return;
    this.load_latest(count);
};
ECMSCatalogBrowser.prototype.latest_refresh = function() {
    this.latest_more = false;
    this.latest_start = "";
    this.latest_date_label = "";
    this.$widgets.latest_place.html("");
    this.load_latest();
};
/* Messages */
ECMSCatalogBrowser.prototype.display_message = function(place, text, type) {
    var t = type ? type : "error";
    this.$widgets["message_"+place].html("<div class=\"" + t + "\">" + text + "</div>");
    if (!this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "block");
        this.messages_displayed[place] = true;
    }
};
ECMSCatalogBrowser.prototype.hide_message = function(place) {
    if (this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "none");
        this.messages_displayed[place] = false;
    }
};
ECMSCatalogBrowser.prototype.display_loading = function() {
    var obj = this;
    if (!this.loading_timeout) {
        this.loading_timeout = setTimeout(function() {
            obj.$widgets.loading.css("display", "block");
            obj.loading_timeout = null;
        }, 500);
    }
};
ECMSCatalogBrowser.prototype.hide_loading = function() {
    if (this.loading_timeout) {
        clearTimeout(this.loading_timeout);
        this.loading_timeout = null;
    }
    this.$widgets.loading.css("display", "");
};
/* Resize */
ECMSCatalogBrowser.prototype.resize = function() {
    var width = $(window).width() - 100;
    if (width < 900)
        width = 900;
    else if (width > 1200)
        width = 1200;
    this.$widgets.main.width(width);
    var height = $(window).height() - 100;
    this.$widgets.main.height(height);
};