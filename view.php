<?php
/**
 * ubicast module main user interface
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once('lib.php');
require_once("$CFG->dirroot/mod/ubicast/locallib.php");
 
$id = required_param('id', PARAM_INT); // Course Module ID
 
if (!$cm = get_coursemodule_from_id('ubicast', $id)) {
    print_error('Course Module ID was incorrect');
}
if (!$course = $DB->get_record('course', array('id' => $cm->course))) {
    print_error('course is misconfigured');
}
if (!$ubicast_media = $DB->get_record('ubicast', array('id' => $cm->instance))) {
    print_error('course module is incorrect');
}

require_course_login($course, true, $cm);
$context = context_system::instance();
require_capability('mod/ubicast:view', $context);

// logs moodle 2.7
$event = \mod_ubicast\event\course_module_viewed::create(array(
    'objectid' => $PAGE->cm->instance,
    'context' => $PAGE->context,
));
$event->add_record_snapshot('course', $PAGE->course);
// In the next line you can use $PAGE->activityrecord if you have set it, or skip this line if you don't have a record.
$event->add_record_snapshot($PAGE->cm->modname, $PAGE->activityrecord);
$event->trigger();

// Update 'viewed' state if required by completion system
$completion = new completion_info($course);
$completion->set_module_viewed($cm);

$PAGE->set_url('/mod/ubicast/view.php', array('id' => $cm->id));

// display media
ubicast_display_media($ubicast_media, $cm, $course);

