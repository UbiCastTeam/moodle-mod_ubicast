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
 * Mandatory public API of ubicast module
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

/**
 * Return the list if Moodle features this module supports
 *
 * @param string $feature FEATURE_xx constant for requested feature
 * @return mixed True if module supports feature, false if not, null otherwise.
 */
function ubicast_supports($feature) {
    switch ($feature) {
        case FEATURE_MOD_ARCHETYPE:
            return MOD_ARCHETYPE_RESOURCE;

        case FEATURE_GROUPS:
            return false;

        case FEATURE_GROUPINGS:
            return false;

        case FEATURE_GROUPMEMBERSONLY:
            return true;

        case FEATURE_MOD_INTRO:
            return true;

        case FEATURE_COMPLETION_TRACKS_VIEWS:
            return true;

        case FEATURE_GRADE_HAS_GRADE:
            return false;

        case FEATURE_GRADE_OUTCOMES:
            return false;

        case FEATURE_BACKUP_MOODLE2:
            return true;

        case FEATURE_SHOW_DESCRIPTION:
            return true;

        case FEATURE_MOD_PURPOSE:
            return MOD_PURPOSE_CONTENT;

        default:
            return null;
    }
}

/**
 * Returns all other capabilities used by this module.
 * @return array Array of capability strings
 */
function ubicast_get_extra_capabilities() {
    return array('moodle/site:accessallgroups');
}

/**
 * This function is used by the reset_course_userdata function in moodlelib.
 * This function will remove all assignment submissions and feedbacks in the database
 * and clean up any related data.
 *
 * @param stdClass $data the data submitted from the reset course.
 * @return array
 */
function ubicast_reset_userdata($data) {
    return array();
}

/**
 * List the actions that correspond to a view of this module.
 * This is used by the participation report.
 *
 * Note: This is not used by new logging system. Event with
 *       crud = 'r' and edulevel = LEVEL_PARTICIPATING will
 *       be considered as view action.
 *
 * @return array
 */
function ubicast_get_view_actions() {
    return array('view', 'view all');
}

/**
 * List the actions that correspond to a post of this module.
 * This is used by the participation report.
 *
 * Note: This is not used by new logging system. Event with
 *       crud = ('c' || 'u' || 'd') and edulevel = LEVEL_PARTICIPATING
 *       will be considered as post action.
 *
 * @return array
 */
function ubicast_get_post_actions() {
    return array('update', 'add');
}

/**
 * Adds a mod_ubicast instance
 *
 * This is done by calling the add_instance() method of the assignment type class
 * @param stdClass $data
 * @param mod_ubicast_mod_form $mform
 * @return int The instance id of the new mod_ubicast
 */
function ubicast_add_instance($data, $mform): int {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $DB->insert_record('ubicast', $data);

    $completiontime = empty($data->completionexpected) ? null : $data->completionexpected;
    \core_completion\api::update_completion_date_event(
        $data->coursemodule, 'ubicast', $data->id, $completiontime
    );

    return $data->id;
}

/**
 * Update a mod_ubicast instance
 *
 * This is done by calling the update_record() method of the assignment type class
 * @param stdClass $data
 * @param stdClass $mform - unused
 * @return bool
 */
function ubicast_update_instance($data, $mform): bool {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $data->instance;

    $ok = $DB->update_record('ubicast', $data);

    $completiontime = empty($data->completionexpected) ? null : $data->completionexpected;
    \core_completion\api::update_completion_date_event(
        $data->coursemodule, 'ubicast', $data->id, $completiontime
    );

    return $ok;
}

/**
 * delete a mod_ubicast instance
 * @param int $id
 * @return bool
 */
function ubicast_delete_instance($id): bool {
    global $DB;

    $ubicastresource = $DB->get_record('ubicast', array('id' => $id));
    if (!$ubicastresource) {
        return false;
    }

    // Note: all context files are deleted automatically.

    $DB->delete_records('ubicast', array('id' => $ubicastresource->id));

    return true;
}


/**
 * This standard function will check all instances of this module
 * and make sure there are up-to-date events created for each of them.
 * If courseid = 0, then every assignment event in the site is checked, else
 * only assignment events belonging to the course specified are checked.
 *
 * @param int $courseid
 * @param int|stdClass $instance mod_ubicast instance or ID.
 * @param int|stdClass $cm Course module object or ID (not used in this module).
 * @return bool
 */
function ubicast_refresh_events($courseid = 0, $instance = null, $cm = null): bool {
    global $DB;

    // 1. Build the list of mod_ubicast records we need to process.
    if ($instance) {
        if (is_object($instance)) {
            // The caller already provided the full record (duplication path).
            $records = [$instance];
        } else {
            // Caller gave us just an id.
            $records = [
                $DB->get_record(
                    'ubicast', ['id' => (int)$instance], '*', MUST_EXIST
                ),
            ];
        }
    } else {
        // Refresh the whole course or whole site.
        $records = $DB->get_records(
            'ubicast', $courseid ? ['course' => $courseid] : []
        );
    }

    // 2. For each activity build / update the calendar event.
    foreach ($records as $record) {
        if (!$record) {  // Safety.
            continue;
        }

        $cm = get_coursemodule_from_instance(
            'ubicast',
            $record->id,
            $record->course,
            false,
            MUST_EXIST
        );

        $completiontime = empty($record->completionexpected)
            ? null
            : (int)$record->completionexpected;

        \core_completion\api::update_completion_date_event(
            $cm->id, 'ubicast', $record->id, $completiontime
        );
    }
    return true;
}

/**
 * Provide the event action for calendar events.
 *
 * @param calendar_event $event The calendar event
 * @param \core_calendar\action_factory $factory The factory to create the action
 * @param int $userid Optional user id, defaults to current user
 * @return \core_calendar\local\event\value_objects\action|null
 */
function mod_ubicast_core_calendar_provide_event_action(
    calendar_event $event,
    \core_calendar\action_factory $factory,
    int $userid = 0
) {
    global $USER;

    if (empty($userid)) {
        $userid = $USER->id;
    }

    $cm = get_fast_modinfo($event->courseid, $userid)->instances['ubicast'][$event->instance];

    if (!$cm->uservisible) {
        // The module is not visible to the user for any reason.
        return null;
    }

    $completion = new \completion_info($cm->get_course());

    $completiondata = $completion->get_data($cm, false, $userid);

    if ($completiondata->completionstate != COMPLETION_INCOMPLETE) {
        return null;
    }

    return $factory->create_instance(
        get_string('view'),
        new \moodle_url('/mod/ubicast/view.php', ['id' => $cm->id]),
        1,
        true
    );
}
