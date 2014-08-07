<?php
/**
 * easycastms module main user interface
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once('lib.php');
require_once("$CFG->dirroot/mod/easycastms/locallib.php");
 
$id = required_param('id', PARAM_INT); // Course Module ID
 
if (!$cm = get_coursemodule_from_id('easycastms', $id)) {
    print_error('Course Module ID was incorrect');
}
if (!$course = $DB->get_record('course', array('id' => $cm->course))) {
    print_error('course is misconfigured');
}
if (!$easycastms_media = $DB->get_record('easycastms', array('id' => $cm->instance))) {
    print_error('course module is incorrect');
}

require_course_login($course, true, $cm);
$context = get_context_instance(CONTEXT_MODULE, $cm->id);
require_capability('mod/easycastms:view', $context);

add_to_log($course->id, 'easycastms', 'view', 'view.php?id='.$cm->id, $easycastms_media->id, $cm->id);

// Update 'viewed' state if required by completion system
$completion = new completion_info($course);
$completion->set_module_viewed($cm);

$PAGE->set_url('/mod/easycastms/view.php', array('id' => $cm->id));

// display media
easycastms_display_media($easycastms_media, $cm, $course);

