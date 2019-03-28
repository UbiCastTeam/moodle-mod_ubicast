<?php
/**
 * Private easycastms module utility functions
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

global $CFG;
if (!isset($CFG)){
    require_once('../../config.php');
}
require_once("$CFG->libdir/filelib.php");
require_once("$CFG->libdir/resourcelib.php");
// Needed to get `lti_sign_parameters` and `lti_post_launch_html`
require_once($CFG->dirroot . '/mod/lti/locallib.php');


/**
 * Launch an external tool activity.
 *
 * @param array $cm Course Module instance
 * @param string $target MediaServer LTI page relative path
 * @return string The HTML code containing the javascript code for the launch
 */
function easycastms_launch_tool($course, $cm, $target) {
    global $CFG;

    // Default LTI config
    $typeconfig = null;
    if (!empty($cm))
        $typeconfig = (array) $cm;
    else
        $typeconfig = (array) $course;
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

    $endpoint = "$tool_base_URL/lti/$target";
    $endpoint = trim($endpoint);

    $orgid = $typeconfig['organizationid'];

    $instance = $cm;
    if (empty($cm)) {
        $instance = new stdClass();
        $instance->course = $course->id;
        $instance->resource_link_id = $course->id.'-admin';
    }
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

    $debuglaunch = false;

    $content = lti_post_launch_html($parms, $endpoint, $debuglaunch);

    echo $content;
}

function easycastms_display_media($easycastms_media, $cm, $course) {
    global $CFG, $PAGE, $OUTPUT;

    $title = $easycastms_media->name;

    // page header
    $PAGE->set_title($course->shortname.': '.$easycastms_media->name);
    $PAGE->set_heading($course->fullname);
    $PAGE->set_activity_record($easycastms_media);
    echo $OUTPUT->header();

    // page body
    $config = get_config('easycastms');
    $key = $config->easycastms_ltikey;
    $secret = $config->easycastms_ltisecret;

    $iframe_url = $CFG->wwwroot.'/mod/easycastms/launch.php?id='.$cm->id.'&mediaId='.$easycastms_media->mediaid;
    if (empty($key) || empty($secret)) {
        $iframe_url = "$config->easycastms_url/permalink/$easycastms_media->mediaid/iframe/";
    }

    $code = '
    <iframe class="mediaserver-iframe" style="width: 100%; height: 800px;" src="'.$iframe_url.'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/jquery.min.js?_=4"></script>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/iframe_manager.js?_=4"></script>
    ';
    echo $code;

    // page intro
    if (!isset($ignoresettings)) {
        if (trim(strip_tags($easycastms_media->intro))) {
            echo $OUTPUT->box_start('mod_introbox', 'easycastmsintro');
            echo format_module_intro('easycastms', $easycastms_media, $cm->id);
            echo $OUTPUT->box_end();
        }
    }

    // page footer
    echo $OUTPUT->footer();
    die;
}
