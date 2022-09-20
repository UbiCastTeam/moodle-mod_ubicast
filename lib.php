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

defined('MOODLE_INTERNAL') || die();

// List of features supported in ubicast module.
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

// Returns all other caps used in module.
function ubicast_get_extra_capabilities() {
    return array('moodle/site:accessallgroups');
}

// This function is used by the reset_course_userdata function in moodlelib.
function ubicast_reset_userdata($data) {
    return array();
}

// List of view style log actions.
function ubicast_get_view_actions() {
    return array('view', 'view all');
}

// List of update style log actions.
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

    $ubicastresource = $DB->get_record('ubicast', array('id' => $id));
    if (!$ubicastresource) {
        return false;
    }

    // Note: all context files are deleted automatically.

    $DB->delete_records('ubicast', array('id' => $ubicastresource->id));

    return true;
}
