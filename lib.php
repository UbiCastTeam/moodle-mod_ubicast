<?php
/**
 * Mandatory public API of easycastms module
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

// List of features supported in easycastms module
function easycastms_supports($feature) {
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
function easycastms_get_extra_capabilities() {
    return array('moodle/site:accessallgroups');
}

// This function is used by the reset_course_userdata function in moodlelib.
function easycastms_reset_userdata($data) {
    return array();
}

// List of view style log actions
function easycastms_get_view_actions() {
    return array('view', 'view all');
}

// List of update style log actions
function easycastms_get_post_actions() {
    return array('update', 'add');
}

// Add easycastms media.
function easycastms_add_instance($data, $mform) {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $DB->insert_record('easycastms', $data);

    return $data->id;
}

// Update url instance.
function easycastms_update_instance($data, $mform) {
    global $CFG, $DB;

    $data->name = $data->name;
    $data->mediaid = $data->mediaid;

    $data->timemodified = time();
    $data->id = $data->instance;

    $DB->update_record('easycastms', $data);

    return true;
}

// Delete easycastms instance.
function easycastms_delete_instance($id) {
    global $DB;

    $easycastms_media = $DB->get_record('easycastms', array('id'=>$id));
    if (!$easycastms_media) {
        return false;
    }

    // note: all context files are deleted automatically

    $DB->delete_records('easycastms', array('id'=>$easycastms_media->id));

    return true;
}

// Return user outline
function easycastms_user_outline($course, $user, $mod, $easycastms_media) {
    global $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'easycastms',
                                              'action'=>'view', 'info'=>$easycastms_media->id), 'time ASC')) {

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
function easycastms_user_complete($course, $user, $mod, $easycastms_media) {
    global $CFG, $DB;

    if ($logs = $DB->get_records('log', array('userid'=>$user->id, 'module'=>'easycastms',
                                              'action'=>'view', 'info'=>$easycastms_media->id), 'time ASC')) {
        $numviews = count($logs);
        $lastlog = array_pop($logs);

        $strmostrecently = get_string('mostrecently');
        $strnumviews = get_string('numviews', '', $numviews);

        echo "$strnumviews - $strmostrecently ".userdate($lastlog->time);

    } else {
        print_string('neverseen', 'easycastms');
    }
}
