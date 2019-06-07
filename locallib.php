<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Private ubicast module utility functions
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir.'/filelib.php');
require_once($CFG->libdir.'/resourcelib.php');
// Needed to get `lti_sign_parameters` and `lti_post_launch_html`.
require_once($CFG->dirroot.'/mod/lti/locallib.php');


/**
 * Launch an external tool activity.
 *
 * @param array $cm Course Module instance
 * @param string $target MediaServer LTI page relative path
 * @return string The HTML code containing the javascript code for the launch
 */
function ubicast_launch_tool($course, $cm, $target) {
    global $CFG;

    // Default LTI config.
    $typeconfig = null;
    if (!empty($cm)) {
        $typeconfig = (array) $cm;
    } else {
        $typeconfig = (array) $course;
    }
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

    // Get LTI secret and key from config.
    $config = get_config('ubicast');
    $key = $config->ubicast_ltikey;
    $secret = $config->ubicast_ltisecret;

    $endpoint = $config->ubicast_url.'/lti/'.$target;
    $endpoint = trim($endpoint);

    $orgid = $typeconfig['organizationid'];

    $instance = $cm;
    if (empty($cm)) {
        $instance = new stdClass();
        $instance->id = 0;
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

function ubicast_display_media($ubicastresource, $cm, $course) {
    global $CFG, $PAGE, $OUTPUT;

    $title = $ubicastresource->name;

    // Page header.
    $PAGE->set_title($course->shortname.': '.$ubicastresource->name);
    $PAGE->set_heading($course->fullname);
    $PAGE->set_activity_record($ubicastresource);
    echo $OUTPUT->header();

    // Page body.
    $config = get_config('ubicast');
    $key = $config->ubicast_ltikey;
    $secret = $config->ubicast_ltisecret;

    $iframeurl = $CFG->wwwroot.'/mod/ubicast/launch.php?id='.$cm->id.'&mediaid='.$ubicastresource->mediaid;
    if (empty($key) || empty($secret)) {
        $iframeurl = $config->ubicast_url.'/permalink/'.$ubicastresource->mediaid.'/iframe/';
    }

    $code = '
    <iframe class="mediaserver-iframe" style="width: 100%; height: 800px;" src="'.$iframeurl.'" frameborder="0"
        allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/ubicast/statics/jquery.min.js?_=4"></script>
    <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/ubicast/statics/iframe_manager.js?_=4"></script>
    ';
    echo $code;

    // Page intro.
    if (!isset($ignoresettings)) {
        if (trim(strip_tags($ubicastresource->intro))) {
            echo $OUTPUT->box_start('mod_introbox', 'ubicastintro');
            echo format_module_intro('ubicast', $ubicastresource, $cm->id);
            echo $OUTPUT->box_end();
        }
    }

    // Page footer.
    echo $OUTPUT->footer();
    die;
}
