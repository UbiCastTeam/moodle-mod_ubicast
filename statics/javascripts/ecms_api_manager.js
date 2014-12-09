/*******************************************
 * EasyCast MediaServer - API Manager       *
 * Copyright: UbiCast, all rights reserved  *
 * Author: Stephane Schoorens               *
 *******************************************/

function ECMSAPIManager(options) {
    //params
    this.base_url = "";
    this.use_proxy = false;
    this.language = "";
    utils.setup_class(this, options, [
        "base_url",
        "use_proxy",

    ]);
    if (this.language)
        utils.use_lang(this.language);

    // vars
    this.methods = {
        // ### fast copy - past not used in code ###
        generic: {
            method: "",
            url: '',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        // ##########################################
        ping: {
            method: "GET",
            url: '/api/v2/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        get_api_key: {
            method: "POST", //why?
            url: '/api/v2/get-api-key/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        error_report: {
            method: "POST",
            url: '/api/v2/error-report/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        search: {
            method: "GET",
            url: '/api/v2/search/',
            errors: {
                401: this.translate("You are not logged in. Please login in Moodle and retry."),
                403: this.translate("Unable to get search's results content because you cannot access to this channel."),
                404: this.translate("Requested channel does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get search's results. Request timed out."),
            },
        },
        get_channels_list: {
            method: "GET",
            url: '/api/v2/channels/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        get_latest_content: {
            method: "GET",
            url: '/api/v2/latest/',
            errors: {
                401: this.translate("You are not logged in. Please login in Moodle and retry."),
                403: this.translate("Unable to get latest content because you cannot access to this channel."),
                404: this.translate("Requested channel does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get latest content. Request timed out."),
            },
        },
        get_channels_content: {
            method: "GET",
            url: "/api/v2/channels/content/",
            errors: {
                401: this.translate("You are not logged in. Please login in Moodle and retry."),
                403: this.translate("Unable to get channel's content because you cannot access to this channel."),
                404: this.translate("Unable to get channel's content because you cannot access to this channel."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get channel's content. Request timed out."),
            },
        },
        get_channels: {
            method: "GET",
            url: '/api/v2/channels/get/',
            errors: {
                401: this.translate("Unable to get channel's information because you are not logged in."),
                403: this.translate("Unable to get channel's information because you cannot access to this media."),
                404: this.translate("Channel does not exist."),
                500: this.translate("An error occured in channels server. Please try again later."),
                timeout: this.translate("Unable to get channel's information. Request timed out."),
            },
        },
        get_channels_tree: {
            method: "GET",
            url: '/api/v2/channels/tree/',
            errors: {
                401: this.translate("Unable to get channels tree because you are not logged in."),
                403: this.translate("Unable to get channels tree because you cannot access to this channel."),
                404: this.translate("Channel does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get channels tree. Request timed out."),
            },
        },
        get_channels_path: {
            method: "GET",
            url: '/api/v2/channels/path/',
            errors: {
                401: this.translate("Unable to get channels path because you are not logged in."),
                403: this.translate("Unable to get channels path because you cannot access to this channel."),
                404: this.translate("Channel does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get channels path. Request timed out."),
            },
        },
        get_medias_list: {
            method: "GET",
            url: '/api/v2/medias/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        get_medias: {
            method: "GET",
            url: '/api/v2/medias/get/',
            errors: {
                401: this.translate("Unable to get media's information because you are not logged in."),
                403: this.translate("Unable to get media's information because you cannot access to this media."),
                404: this.translate("Media does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Unable to get media's information. Request timed out."),
            },
        },
        add_medias: {
            method: "POST",
            url: '/api/v2/medias/add/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        medias_resources_check: {
            method: "POST",
            url: '/api/v2/medias/resources-check/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        medias_trimming_child_init: {
            method: "POST",
            url: '/api/v2/medias/trimming-child-init/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        medias_get_upload_config: {
            method: "GET",
            url: '/api/v2/medias/get-upload-config/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        get_lives_list: {
            method: "GET",
            url: '/api/v2/lives/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        prepare_lives: {
            method: "POST",
            url: '/api/v2/lives/prepare/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        start_lives: {
            method: "POST",
            url: '/api/v2/lives/start/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        stop_lives: {
            method: "POST",
            url: '/api/v2/lives/stop/',
            errors: {
                401: this.translate("Your session has expired, please log you in again."),
                403: this.translate("You are not allowed to perform this action."),
                404: this.translate("Media does not exist."),
                500: this.translate("An error occured in medias server. Please try again later."),
                timeout: this.translate("Request timed out."),
            },
        },
        lives_change_slides: {
            method: "POST",
            url: '/api/v2/lives/change-slide/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
        lives_get_viewers: {
            method: "GET",
            url: '/api/v2/lives/get-viewers/',
            errors: {
                401: this.translate(""),
                403: this.translate(""),
                404: this.translate(""),
                500: this.translate(""),
                timeout: this.translate(""),
            },
        },
    };
    var obj = this;
    $(document).ready(function() {
        obj.init();
    });
}
ECMSAPIManager.prototype.init = function() {
    /*    console.log('test');
    var callback = function(data) {
        console.log(data);
    };
    var data = {parent_oid: "c12516cfb627a967nng9", content: "c", validated: "yes"};
    this.ajax_call('get_channels_content', data, callback);
    console.log('end test'); */
};
ECMSAPIManager.prototype.ajax_call = function(method, data, callback, scallback, ecallback, async) {
    if (typeof(this.methods[method]) == "undefined") {
        console.log("no method");
        return;
    }
    async = typeof async !== 'undefined' ? async : true;
    var obj = this;
    var url = this.base_url;
    if (this.use_proxy)
        data.action = this.methods[method].url;
    else
        url += this.methods[method].url;
    if (typeof(url) == "undefined" || url == "undefined") {
        console.log("url error");
        return;
    }
    var default_success_callback = function(response) {
        if (!response.success)
            response.error = response.error ? response.error : obj.translate("No information about error.");
        return callback(response);
    };
    if (scallback) {
        default_success_callback = scallback;
    }
    var default_error_callback = function(xhr, textStatus, thrownError) {
        if (xhr.status) {
            if (obj.methods[method].errors[xhr.status])
                return callback({
                    success: false,
                    error: obj.methods[method].errors[xhr.status]
                });
        }
        if (textStatus == "timeout")
            if (obj.methods[method].errors.timeout)
                return callback({
                    success: false,
                    error: obj.methods[method].errors.timeout
                });
            else
                return callback({
                    success: false,
                    error: obj.translate("An error occured during request:") + "<br/>&nbsp;&nbsp;&nbsp;&nbsp;" + textStatus + " " + thrownError
                });
    };
    if (ecallback) {
        default_error_callback = ecallback;
    }
    $.ajax({
        url: url,
        async: async,
        method: this.methods[method].method,
        data: data,
        dataType: "json",
        cache: false,
        success: default_success_callback,
        error: default_error_callback,
    });
};
