/*******************************************
* Media picker                             *
* UbiCast 2009 - 2012, all rights reserved *
* Author: Stephane Diemer                  *
*******************************************/

function MediaPicker(options) {
    // params
    this.name = "mp";
    this.base_url = "";
    this.course_id = "";
    this.default_media_icon = "";
    this.language = "en";
    
    // vars
    this.translations = {};
    this.api_tree_path = "/api/v2/channels/tree/";
    this.api_content_path = "/api/v2/channels/content/";
    this.api_get_media = "/api/v2/medias/get/";
    this.messages_displayed = {};
    this.medias = {};
    this.current_category = null;
    this.$widgets = {
        main: $("<div class=\"mediapicker\"></div>")
    };
    
    // set options
    this.allowed_options = [
        "name",
        "base_url",
        "course_id",
        "default_media_icon",
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

MediaPicker.prototype.set_options = function(options) {
    for (var i = 0; i < this.allowed_options.length; i++) {
        if (this.allowed_options[i] in options)
            this[this.allowed_options[i]] = options[this.allowed_options[i]];
    }
};

MediaPicker.prototype.translate = function (text) {
    if (text in this.translations)
        return this.translations[text];
    return text;
};

MediaPicker.prototype.init = function () {
    var obj = this;
    // build widget structure
    var html = "";
    
    html += "<div class=\"mp-left\">";
    html +=     "<div class=\"mp-column\">";
    html +=         "<div class=\"mp-title\">"+this.translate("Channels list")+"</div>";
    html +=         "<div class=\"mp-container\">";
    html +=             "<div class=\"mp-message\"></div>";
    html +=             "<div class=\"mp-tree\"></div>";
    html +=         "</div>";
    html +=     "</div>";
    html += "</div>";
    
    html += "<div class=\"mp-right\">";
    html +=     "<div class=\"mp-column\">";
    html +=         "<div class=\"mp-title\">"+this.translate("Channel's content")+"</div>";
    html +=         "<div class=\"mp-container\">";
    html +=             "<div class=\"mp-message\"></div>";
    html +=             "<div class=\"mp-content\"></div>";
    html +=         "</div>";
    html +=     "</div>";
    html += "</div>";
    
    this.$widgets.main.append(html);
    
    // get elements
    this.$widgets.tree = $(".mp-left .mp-tree", this.$widgets.main);
    this.$widgets.content = $(".mp-right .mp-content", this.$widgets.main);
    this.$widgets.message_tree = $(".mp-left .mp-message", this.$widgets.main);
    this.$widgets.message_content = $(".mp-right .mp-message", this.$widgets.main);
    this.$widgets.input = $("#id_mediaid");
    this.$widgets.preview = $("#media_picker_preview");
    this.$widgets.preview_img = $("img", this.$widgets.preview);
    this.$widgets.preview_title = $("div", this.$widgets.preview);
    
    // init tree
    this.get_tree();
    
    // get current media info
    var media_id = this.$widgets.input.val();
    if (media_id)
        this.get_media_info(media_id);
    
    // events
    $(window).resize(function () {
        obj.resize();
    });
    this.resize();
};

MediaPicker.prototype.open = function () {
    var obj = this;
    var title = this.translate("Select a media");
    this.overlay.show({
        mode: "html",
        title: title,
        html: this.$widgets.main,
        //buttons: [
        //    { label: "Cancel", callback: function (btn_dom) { obj.overlay.hide(); } },
        //    { label: "Pick selected media", id: "mediapicker_pick_btn", callback: function (btn_dom) { obj.overlay.hide(); obj.pick_selected_media(); } }
        //],
        on_hide: function () { obj.$widgets.main.detach(); }
    });
};


MediaPicker.prototype.get_media_info = function (media_id) {
    var obj = this;
    $.ajax({
        url: this.base_url,
        data: { course_id: this.course_id, action: this.api_get_media, media_id: media_id },
        dataType: "json",
        cache: false,
        success: function (response) {
            if (response.success) {
                obj.medias[media_id] = response.media;
                obj.pick_media(media_id);
            }
            else {
                obj.$widgets.preview_title.html(obj.translate("No information about media."));
            }
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout")
                obj.$widgets.preview_title.html(obj.translate("Unable to get media's information. Request timed out."));
        },
        statusCode: {
            403: function () {
                obj.$widgets.preview_title.html(obj.translate("Unable to get media's information because you cannot access to this media."));
            },
            404: function () {
                obj.$widgets.preview_title.html(obj.translate("Media does not exist."));
            },
            500: function () {
                obj.$widgets.preview_title.html(obj.translate("An error occured in medias server. Please try again later."));
            }
        }
    });
};


MediaPicker.prototype.get_tree = function () {
    var obj = this;
    $.ajax({
        url: this.base_url,
        data: { course_id: this.course_id, action: this.api_tree_path },
        dataType: "json",
        cache: false,
        success: function (response) {
            if (response.success)
                obj.display_tree(response);
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
MediaPicker.prototype.display_tree = function (data) {
    if (!data.channels)
        return;
    var html = this._display_tree(data);
    this.$widgets.tree.html(html);
};
MediaPicker.prototype._display_tree = function (data) {
    if (!data.channels)
        return "";
    var id = data.id ? data.id : "0";
    var html = "<ul id=\"channel_"+id+"\">";
    for (var i=0; i < data.channels.length; i++) {
        var channel = data.channels[i];
        var button = "<span class=\"list-none\"></span>";
        var sub_channels = "";
        if (channel.channels && channel.channels.length > 0) {
            sub_channels = this._display_tree(channel);
            button = "<span onclick=\"javascript: "+this.name+".toggle_channel('"+channel.id+"');\" class=\"list-entry\"></span>";
        }
        html += "<li id=\"channel_"+channel.id+"_link\">";
        html +=     button;
        html +=     "<a href=\"javascript: "+this.name+".display_channel('"+channel.id+"');\" title=\""+this.translate("Click to display the content of this channel")+"\">"+channel.name+"</a>";
        html += "</li>";
        html += sub_channels;
    }
    html += "</ul>";
    return html;
};

MediaPicker.prototype.toggle_channel = function (id) {
    if ($("#channel_"+id).is(":visible")) {
        $("#channel_"+id).css("display", "none");
        $("#channel_"+id+"_link span").removeClass("opened");
    }
    else {
        $("#channel_"+id).css("display", "block");
        $("#channel_"+id+"_link span").addClass("opened");
    }
};




MediaPicker.prototype.display_channel = function (parent_id) {
    if (this.current_category)
        $("#channel_"+this.current_category+"_link").removeClass("channel-active");
    this.current_category = parent_id;
    $("#channel_"+this.current_category+"_link").addClass("channel-active");
    var data = { course_id: this.course_id, action: this.api_content_path };
    if (parent_id)
        data.parent_id = parent_id;
    var obj = this;
    $.ajax({
        url: this.base_url,
        data: data,
        dataType: "json",
        cache: false,
        success: function (response) {
            if (response.success) {
                obj.hide_message("content");
                obj.display_content(response);
            }
            else {
                obj.$widgets.content.html("");
                obj.display_message("content", response.error ? response.error : obj.translate("No information about error."));
            }
        },
        error: function (xhr, textStatus, thrownError) {
            if (textStatus == "timeout") {
                obj.$widgets.content.html("");
                obj.display_message("content", obj.translate("Unable to get channel's content. Request timed out."));
            }
        },
        statusCode: {
            401: function () {
                obj.$widgets.content.html("");
                obj.display_message("content", obj.translate("You are not logged in. Please login in Moodle and retry."));
            },
            403: function () {
                obj.$widgets.content.html("");
                obj.display_message("content", obj.translate("Unable to get channel's content because you cannot access to this channel."));
            },
            404: function () {
                obj.$widgets.content.html("");
                obj.display_message("content", obj.translate("Requested channel does not exist."));
            },
            500: function () {
                obj.$widgets.content.html("");
                obj.display_message("content", obj.translate("An error occured in medias server. Please try again later."));
            }
        }
    });
};
MediaPicker.prototype.display_content = function (data) {
    var nb_elements = data.live_streams.length + data.videos.length + data.photos_groups.length;
    if (nb_elements == 0) {
        this.$widgets.content.html("");
        this.display_message("content", this.translate("This channel does not contain any media."), "info");
    }
    else {
        var html = "";
        //for (var i=0; i < data.channels.length; i++) {
        //    html += this.get_content_entry("channel", data.channels[i]);
        //}
        for (var i=0; i < data.live_streams.length; i++) {
            html += this.get_content_entry("live", data.live_streams[i]);
        }
        for (var i=0; i < data.videos.length; i++) {
            html += this.get_content_entry("video", data.videos[i]);
        }
        for (var i=0; i < data.photos_groups.length; i++) {
            html += this.get_content_entry("photos", data.photos_groups[i]);
        }
        this.$widgets.content.html(html);
    }
};
MediaPicker.prototype.get_content_entry = function (item_type, item) {
    this.medias[item.media_id] = item;
    var html = "";
    html += "<div class=\"item-entry type-"+item_type+"\" id=\""+item_type+"_"+item.media_id+"\">";
    html +=     "<a class=\"item-entry-link\" href=\"javascript: "+this.name+".pick_media('"+item.media_id+"');\">";
    html +=         "<span class=\"item-entry-preview\"><img src=\""+item.thumb+"\"/></span>";
    html +=         "<span class=\"item-entry-content\">";
    html +=             "<span class=\"item-entry-top-bar\">";
    html +=                 "<span class=\"item-entry-title\">"+item.title+"</span>";
    if (item.can_edit) {
        if (!item.visible)
            html +=             "<span class=\"item-entry-visibility\" title=\""+this.translate("This media will not appear in the catalog")+"\"></span>";
        if (item.validated)
            html +=             "<span class=\"item-entry-publication published\" title=\""+this.translate("This media is published")+"\"></span>";
        else
            html +=             "<span class=\"item-entry-publication\" title=\""+this.translate("This media is not published")+"\"></span>";
        if (item_type == "video" && !item.ready)
            html +=             "<span class=\"item-entry-state\" title=\""+this.translate("This video is not ready")+"\"></span>";
    }
    //html +=                 "{% if obj.obj.metadata.get_video_duration %}<span class=\"item-entry-duration\">{{ obj.obj.metadata.get_video_hashed_duration.formatted }}</span>{% endif %}";
    html +=             "</span>";
    html +=             "<span class=\"item-entry-bottom-bar\">";
    html +=                 "<span class=\"item-entry-creation\">"+this.get_date_display(item.creation)+"</span>";
    html +=             "</span>";
    html +=         "</span>";
    html +=     "</a>";
    html +=     "<div class=\"item-entry-links\">";
    html +=         "<a class=\"std-btn\" href=\"javascript: "+this.name+".pick_media('"+item.media_id+"');\">"+this.translate("Select this media")+"</a>";
    //if (item.can_edit)
    //    html +=     "<a class=\"std-btn\" href=\"{% url forumedia-editor_main obj.obj.metadata.media_id %}\">"+this.translate("Edit")+"</a>";
    //if (item.can_delete)
    //    html +=     "<a class=\"std-btn\" href=\"javascript: delete_form_manager.show('"+item_type+"', '"+item.media_id+"', "+item.can_delete_resources+");\">"+this.translate("Delete")+"</a>";
    html +=     "</div>";
    html += "</div>";
    return html;
};
MediaPicker.prototype.pick_media = function (media_id) {
    this.$widgets.input.val(media_id);
    this.$widgets.preview_img.attr("src", this.medias[media_id].thumb);
    this.$widgets.preview_title.html(this.medias[media_id].title);
    this.overlay.hide();
};




MediaPicker.prototype.display_message = function (place, text, type) {
    var t = "error";
    if (type)
        t = type;
    this.$widgets["message_"+place].html("<div class=\""+t+"\">"+text+"</div>");
    if (!this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "block");
        this.messages_displayed[place] = true;
    }
};
MediaPicker.prototype.hide_message = function (place) {
    if (this.messages_displayed[place]) {
        this.$widgets["message_"+place].css("display", "none");
        this.messages_displayed[place] = false;
    }
};


MediaPicker.prototype.resize = function () {
    //var width = $(window).width() - 100;
    //this.$widgets.main.width(width);
    var height = $(window).height() - 100;
    this.$widgets.main.height(height);
};

MediaPicker.prototype.set_language = function (lang) {
    if (lang == "fr") {
        this.language = "fr";
        this.translations = {
            "Channels list": "Liste des chaînes",
            "Channel's content": "Contenu de la chaîne",
            "Select a media": "Sélectionner un média",
            "No information about media.": "Pas d'information sur le média",
            "Unable to get media's information. Request timed out.": "Impossible d'obtenir les informations sur le média. Délai d'attente de la requête écoulé.",
            "Unable to get media's information because you cannot access to this media.": "Impossible d'obtenir les informations sur le média car vous ne pouvez pas accéder à ce média.",
            "Media does not exist.": "Aucun média ne correspond à l'identifiant entré.",
            "An error occured in medias server. Please try again later.": "Une erreur est suvenue dans le serveur de médias. Veuillez réessayer plus tard.",
            "No information about error.": "Aucune information sur l'erreur.",
            "Unable to get channels. Request timed out.": "Impossible d'obtenir la liste des chaînes. Délai d'attente de la requête écoulé.",
            "An error occured during request:": "Une erreur est survenue pendant la requête :",
            "Click to display the content of this channel": "Cliquez pour afficher le le contenu de cette chaîne",
            "Unable to get channel's content. Request timed out.": "Impossible d'obtenir la liste du contenu de la chaîne. Délai d'attente de la requête écoulé.",
            "You are not logged in. Please login in Moodle and retry.": "Vous devez vous authentifier pour voir les médias. Veuillez vous authentifier dans Moodle puis réessayez.",
            "Unable to get channel's content because you cannot access to this channel.": "Impossible d'obtenir la liste du contenu de la chaîne car vous ne possédez pas la permission d'y accéder",
            "Requested channel does not exist.": "La chaîne demandée n'existe pas.",
            "This channel does not contain any media.": "Cette chaîne ne contient aucun média.",
            "This media will not appear in the catalog": "Ce média n'apparaitra pas dans le catalogue",
            "This media is published": "Ce média est publié",
            "This media is not published": "Ce média n'est pas publié",
            "This video is not ready": "Cette vidéo n'est pas prête",
            "Select this media": "Sélectionner ce média",
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
            "the": "le",
            "at": "à"
        };
    }
    else {
        this.language = "en";
        this.translations = {
        };
    }
};

MediaPicker.prototype.get_date_display = function (d) {
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
    var month = "";
    switch (ymd_split[1]) {
        case "Jan": month = this.translate("January");   break;
        case "Feb": month = this.translate("February");  break;
        case "Mar": month = this.translate("March");     break;
        case "Apr": month = this.translate("April");     break;
        case "May": month = this.translate("May");       break;
        case "Jun": month = this.translate("June");      break;
        case "Jul": month = this.translate("July");      break;
        case "Aug": month = this.translate("August");    break;
        case "Sep": month = this.translate("September"); break;
        case "Oct": month = this.translate("October");   break;
        case "Nov": month = this.translate("November");  break;
        case "Dec": month = this.translate("December");  break;
        default:    month = this.translate("January");
    }
    // day
    var day = 1;
    try { day = parseInt(ymd_split[2], 10); } catch (e) { }
    
    // hour
    var hour = parseInt(hms_split[0], 10);
    // minute
    var minute = parseInt(hms_split[1], 10);
    if (minute < 10)
        minute = "0"+minute;
    
    if (this.language == "fr") {
        // 24 hours time format
        if (hour < 10)
            hour = "0"+hour;
        var time = hour+"h"+minute;
        
        return this.translate("the")+" "+day+" "+month+" "+year+" "+this.translate("at")+" "+time;
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
        var time = hour+":"+minute+" "+moment;
        
        // day complement
        var comp = "th";
        if (day == 11 || day == 12 || day == 13)
            comp = "th";
        else if (((day - 1) % 10) == 0)
            comp = "st";
        else if (((day - 2) % 10) == 0)
            comp = "nd";
        else if (((day - 3) % 10) == 0)
            comp = "rd";
        
        return month+" "+this.translate("the")+", "+day+comp+" "+year+" "+this.translate("at")+" "+time;
    }
};


