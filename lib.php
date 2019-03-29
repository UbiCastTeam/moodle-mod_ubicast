<?php
/**
 * Mandatory public API of ubicast module
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

// List of features supported in ubicast module
function ubicast_supports($feature) {
    switch($feature) {
        case FEATURE_MOD_ARCHETYPE:           return MOD_ARCHETYPE_RESOURCE;
        case FEATURE_GROUPS:                  return false;
        case FEATURE_GROUPINGS:               return false;
        case FEATURE_GROUPMEMBERSONLY:        return true;
        case FEATURE_MOD_INTRO:               return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS: return true;
        case FEATURE_GRADE_HAS_GRADE:         return false;
        case FEATURE_GRADE_OUTCOMES:          return false;
        case FEATURE_BACKUP_MOODLE2:          return true;
        case FEATURE_SHOW_DESCRIPTION:        return true;

        default: return null;
    }
}

// Returns all other caps used in module
function ubicast_get_extra_capabilities() {
    return array('moodle/site:accessallgroups');
}

// This function is used by the reset_course_userdata function in moodlelib.
function ubicast_reset_userdata($data) {
    return array();
}

// List of view style log actions
function ubicast_get_view_actions() {
    return array('view', 'view all');
}

// List of update style log actions
function ubicast_get_post_actions() {
    return array('update', 'add');
}

// Add ubicast media.
function ubicast_add_instance($data, $mform) {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $DB->insert_record('ubicast', $data);

    return $data->id;
}

// Update url instance.
function ubicast_update_instance($data, $mform) {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $data->instance;

    $DB->update_record('ubicast', $data);

    return true;
}

// Delete ubicast instance.
function ubicast_delete_instance($id) {
    global $DB;

    $ubicast_media = $DB->get_record('ubicast', array('id'=>$id));
    if (!$ubicast_media) {
        return false;
    }

    // note: all context files are deleted automatically

    $DB->delete_records('ubicast', array('id'=>$ubicast_media->id));

    return true;
}

// Return user outline
function ubicast_user_outline($course, $user, $mod, $ubicast_media) {
    global $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'ubicast',
                                              'action'=>'view', 'info'=>$ubicast_media->id), 'time ASC')) {

        $numviews = count($logs);
        $lastlog = array_pop($logs);

        $result = new stdClass();
        $result->info = get_string('numviews', '', $numviews);
        $result->time = $lastlog->time;

        return $result;
    }
    return NULL;
}

// Displays last time seen by user
function ubicast_user_complete($course, $user, $mod, $ubicast_media) {
    global $CFG, $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'ubicast',
                                              'action'=>'view', 'info'=>$ubicast_media->id), 'time ASC')) {
        $numviews = count($logs);
        $lastlog = array_pop($logs);

        $strmostrecently = get_string('mostrecently');
        $strnumviews = get_string('numviews', '', $numviews);

        echo "$strnumviews - $strmostrecently ".userdate($lastlog->time);

    } else {
        print_string('neverseen', 'ubicast');
    }
}
