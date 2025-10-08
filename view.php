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
 * ubicast module main user interface
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once('lib.php');
require_once($CFG->dirroot . '/mod/ubicast/locallib.php');

$id = required_param('id', PARAM_INT);  // Course Module ID.

if (!$cm = get_coursemodule_from_id('ubicast', $id)) {
    throw new moodle_exception('Course Module ID was incorrect');
}
if (!$course = $DB->get_record('course', array('id' => $cm->course))) {
    throw new moodle_exception('course is misconfigured');
}
if (!$ubicastresource = $DB->get_record('ubicast', array('id' => $cm->instance))) {
    throw new moodle_exception('course module is incorrect');
}

require_course_login($course, true, $cm);
$context = context_system::instance();
require_capability('mod/ubicast:view', $context);

// Add event log.
$event = \mod_ubicast\event\course_module_viewed::create(array(
    'objectid' => $PAGE->cm->instance,
    'context' => $PAGE->context,
));
$event->add_record_snapshot('course', $PAGE->course);
// In the next line you can use $PAGE->activityrecord if you have set it, or skip this line if you don't have a record.
$event->add_record_snapshot($PAGE->cm->modname, $PAGE->activityrecord);
$event->trigger();

// Update 'viewed' state if required by completion system.
$completion = new completion_info($course);
$completion->set_module_viewed($cm);

$PAGE->set_url('/mod/ubicast/view.php', array('id' => $cm->id));

// Display media.
ubicast_display_media($ubicastresource, $cm, $course);
