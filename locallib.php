<?php
/**
 * Private easycastms module utility functions
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once('../../config.php');
require_once("$CFG->libdir/filelib.php");
require_once("$CFG->libdir/resourcelib.php");
// Needed to get `lti_sign_parameters` and `lti_post_launch_html`
require_once($CFG->dirroot . '/mod/lti/locallib.php');

function easycastms_get_url_prefix($easycastms_media) {
    $prefix = 'videos';
    if ($easycastms_media->mediaid[0] == 'l') {
        $prefix = 'lives';
    }
    else {
        if ($easycastms_media->mediaid[0] == 'p') {
            $prefix = 'photos';
        }
    }
    return $prefix;
}

function easycastms_print_header($easycastms_media, $cm, $course) {
    global $PAGE, $OUTPUT;

    $PAGE->set_title($course->shortname.': '.$easycastms_media->name);
    $PAGE->set_heading($course->fullname);
    $PAGE->set_activity_record($easycastms_media);
    echo $OUTPUT->header();
}

function easycastms_print_intro($easycastms_media, $cm, $course, $ignoresettings=false) {
    global $OUTPUT;

    if (!$ignoresettings) {
        if (trim(strip_tags($easycastms_media->intro))) {
            echo $OUTPUT->box_start('mod_introbox', 'easycastmsintro');
            echo format_module_intro('easycastms', $easycastms_media, $cm->id);
            echo $OUTPUT->box_end();
        }
    }
}

function easycastms_get_launch_data($instance, $mediaId) {
    global $PAGE, $CFG;

    $typeconfig = (array) $instance;
    $course = $PAGE->course;

    $context = context_course::instance($course->id);
    $users = get_enrolled_users($context);

    // Default LTI config
    $typeconfig['sendname'] = '1';
    $typeconfig['sendemailaddr'] = '1';
    $typeconfig['acceptgrades'] = '0';
    $typeconfig['allowroster'] = '0';
    $typeconfig['forcessl'] = '0';

    // Default the organizationid if not specified.
    if (empty($typeconfig['organizationid'])) {
        $urlparts = parse_url($CFG->wwwroot);

        $typeconfig['organizationid'] = $urlparts['host'];
    }

    // Get LTI secret and key from config
    $config = get_config('easycastms');
    $key = $config->easycastms_ltikey;
    $secret = $config->easycastms_ltisecret;
    $tool_base_URL = $config->easycastms_url;

    $endpoint = "$tool_base_URL/lti/$mediaId/";
    $endpoint = trim($endpoint);

    $orgid = $typeconfig['organizationid'];

    $allparams = lti_build_request($instance, $typeconfig, $course);
    $requestparams = array_merge($allparams, lti_build_standard_request($instance, $orgid, false));

    $requestparams['launch_presentation_document_target'] = 'iframe';

    if (!empty($key) && !empty($secret)) {
        $parms = lti_sign_parameters($requestparams, $endpoint, "POST", $key, $secret);

        $endpointurl = new \moodle_url($endpoint);
        $endpointparams = $endpointurl->params();

        // Strip querystring params in endpoint url from $parms to avoid duplication.
        if (!empty($endpointparams) && !empty($parms)) {
            foreach (array_keys($endpointparams) as $paramname) {
                if (isset($parms[$paramname])) {
                    unset($parms[$paramname]);
                }
            }
        }

    } else {
        $parms = $requestparams;
    }

    return array($endpoint, $parms);
}

/**
 * Launch an external tool activity.
 *
 * @param array $instance Course Module instance
 * @param string $mediaId Easycast Media ID
 * @return string The HTML code containing the javascript code for the launch
 */
function easycastms_launch_tool($instance, $mediaId) {

    list($endpoint, $parms) = easycastms_get_launch_data($instance, $mediaId);

    $debuglaunch = false;

    $content = lti_post_launch_html($parms, $endpoint, $debuglaunch);

    echo $content;
}

function easycastms_display_media($easycastms_media, $cm, $course) {
    global $CFG, $PAGE, $OUTPUT;

    $title = $easycastms_media->name;

    easycastms_print_header($easycastms_media, $cm, $course);

    $config = get_config('easycastms');
    $key = $config->easycastms_ltikey;
    $secret = $config->easycastms_ltisecret;

    $iframe_url = 'launch.php?id='.$course->id.'&mediaId='.$easycastms_media->mediaid;

    if (empty($key) || empty($secret)) {
      $prefix = easycastms_get_url_prefix($easycastms_media);
      $iframe_url = "$config->easycastms_url/$prefix/permalink/$easycastms_media->mediaid/iframe/";
    }

    $code = '
    <iframe id="mediaserver_iframe" style="width: 100%; height: 800px;" src="'.$iframe_url.'" frameborder="0" allowfullscreen="allowfullscreen"></iframe>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/jquery.min.js?_=1"></script>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/iframe_manager.js?_=1"></script>
    ';
    echo $code;

    easycastms_print_intro($easycastms_media, $cm, $course);

    echo $OUTPUT->footer();
    die;
}

// Add http_response_code (this function does not exist if PHP < 5.4)
if (!function_exists('http_response_code')) {
    function http_response_code($code = NULL) {
        if ($code !== NULL) {
            switch ($code) {
                case 100: $text = 'Continue'; break;
                case 101: $text = 'Switching Protocols'; break;
                case 200: $text = 'OK'; break;
                case 201: $text = 'Created'; break;
                case 202: $text = 'Accepted'; break;
                case 203: $text = 'Non-Authoritative Information'; break;
                case 204: $text = 'No Content'; break;
                case 205: $text = 'Reset Content'; break;
                case 206: $text = 'Partial Content'; break;
                case 300: $text = 'Multiple Choices'; break;
                case 301: $text = 'Moved Permanently'; break;
                case 302: $text = 'Moved Temporarily'; break;
                case 303: $text = 'See Other'; break;
                case 304: $text = 'Not Modified'; break;
                case 305: $text = 'Use Proxy'; break;
                case 400: $text = 'Bad Request'; break;
                case 401: $text = 'Unauthorized'; break;
                case 402: $text = 'Payment Required'; break;
                case 403: $text = 'Forbidden'; break;
                case 404: $text = 'Not Found'; break;
                case 405: $text = 'Method Not Allowed'; break;
                case 406: $text = 'Not Acceptable'; break;
                case 407: $text = 'Proxy Authentication Required'; break;
                case 408: $text = 'Request Time-out'; break;
                case 409: $text = 'Conflict'; break;
                case 410: $text = 'Gone'; break;
                case 411: $text = 'Length Required'; break;
                case 412: $text = 'Precondition Failed'; break;
                case 413: $text = 'Request Entity Too Large'; break;
                case 414: $text = 'Request-URI Too Large'; break;
                case 415: $text = 'Unsupported Media Type'; break;
                case 500: $text = 'Internal Server Error'; break;
                case 501: $text = 'Not Implemented'; break;
                case 502: $text = 'Bad Gateway'; break;
                case 503: $text = 'Service Unavailable'; break;
                case 504: $text = 'Gateway Time-out'; break;
                case 505: $text = 'HTTP Version not supported'; break;
                default:
                    exit('Unknown http status code "'.htmlentities($code).'"');
                break;
            }
            $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');
            header($protocol.' '.$code.' '.$text);
            $GLOBALS['http_response_code'] = $code;
        }
        else {
            $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);
        }
        return $code;
    }
}
