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
 * LTI lauch page for ubicast module
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once("../../config.php");
require_once($CFG->dirroot.'/mod/ubicast/lib.php');
require_once($CFG->dirroot.'/mod/ubicast/locallib.php');

$id = required_param('id', PARAM_INT);  // Course Module ID.
$mediaid = required_param('mediaid', PARAM_ALPHANUM);  // Nudgis media object ID.

$cm = get_coursemodule_from_id('ubicast', $id, 0, false, MUST_EXIST);

$course = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);

$context = context_module::instance($cm->id);

require_login($course, true, $cm);
require_capability('mod/ubicast:view', $context);

ubicast_launch_tool($course, $cm, $mediaid.'/');
