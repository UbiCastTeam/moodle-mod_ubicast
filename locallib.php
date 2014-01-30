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

function easycastms_display_media($easycastms_media, $cm, $course, $can_edit) {
    global $CFG, $PAGE, $OUTPUT;
    
    $title = $easycastms_media->name;
    
    easycastms_print_header($easycastms_media, $cm, $course);
    
    $config = get_config('easycastms');
    
    $prefix = easycastms_get_url_prefix($easycastms_media);
    
    $edit_btn = '';
    if ($can_edit) {
        $edit_btn = '<div class="edit-btn"><a href="edit.php?id='.$cm->id.'" title="'.get_string('edit_link', 'easycastms').'"></a></div>';
    }
    
    $code = '
        <div id="easycastms_'.$easycastms_media->mediaid.'" class="easycastms-embed">
            <div class="easycastms-btn-place">
                '.$edit_btn.'
                <div class="fullscreen-btn"><a href="javascript: media_manager_'.$easycastms_media->mediaid.'.toggle_fullscreen();" title="'.get_string('fullscreen', 'easycastms').'"></a></div>
            </div>
            <iframe style="width: 100%; height: 800px;" src="'.$config->easycastms_url.'/'.$prefix.'/permalink/'.$easycastms_media->mediaid.'/iframe/"></iframe>
        </div>
        <link rel="stylesheet" href="statics/stylesheets/embed.css" type="text/css"/>
        <script type="text/javascript" src="statics/javascripts/jquery-latest.min.js"></script>
        <script type="text/javascript" src="statics/javascripts/fullscreen.js"></script>
        <script type="text/javascript" src="statics/javascripts/media_manager.js"></script>
        <script type="text/javascript"> var media_manager_'.$easycastms_media->mediaid.' = new MediaManager("'.$easycastms_media->mediaid.'"); </script>
    ';
    echo $code;
    
    easycastms_print_intro($easycastms_media, $cm, $course);
    
    echo $OUTPUT->footer();
    die;
}

function easycastms_display_media_edition($easycastms_media, $cm, $course) {
    global $CFG, $PAGE, $OUTPUT;
    
    $title = $easycastms_media->name;
    
    easycastms_print_header($easycastms_media, $cm, $course);
    
    $config = get_config('easycastms');
    
    $code = '
        <div id="easycastms_'.$easycastms_media->mediaid.'" class="easycastms-embed">
            <div class="easycastms-btn-place">
                <div class="see-btn"><a href="view.php?id='.$cm->id.'" title="'.get_string('view_link', 'easycastms').'"></a></div>
                <!--<div class="fullscreen-btn"><a href="javascript: media_manager_'.$easycastms_media->mediaid.'.toggle_fullscreen();" title="'.get_string('fullscreen', 'easycastms').'"></a></div>-->
            </div>
            <iframe style="width: 100%; height: 800px;" src="'.$config->easycastms_url.'/edit/iframe/'.$easycastms_media->mediaid.'/"></iframe>
        </div>
        <link rel="stylesheet" href="statics/stylesheets/embed.css" type="text/css"/>
        <!--<script type="text/javascript" src="statics/javascripts/jquery-latest.min.js"></script>-->
        <!--<script type="text/javascript" src="statics/javascripts/fullscreen.js"></script>-->
        <script type="text/javascript" src="statics/javascripts/media_manager.js"></script>
        <script type="text/javascript"> var media_manager_'.$easycastms_media->mediaid.' = new MediaManager("'.$easycastms_media->mediaid.'"); </script>
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

