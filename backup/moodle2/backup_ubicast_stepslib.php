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
 * Define all the backup steps that will be used by the backup_ubicast_activity_task
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Define the complete ubicast structure for backup, with file and id annotations
 */
class backup_ubicast_activity_structure_step extends backup_activity_structure_step {

    protected function define_structure() {
        // The ubicast module stores no user info.

        // Define each element separated.
        $media = new backup_nested_element('ubicast', array('id'), array('name', 'intro', 'introformat', 'mediaid', 'timemodified'));

        // Build the tree.
        // Nothing here for ubicast.

        // Define sources.
        $media->set_source_table('ubicast', array('id' => backup::VAR_ACTIVITYID));

        // Define id annotations.
        // Module has no id annotations.

        // Define file annotations.
        $media->annotate_files('mod_ubicast', 'intro', null);  // This file area hasn't itemid.

        // Return the root element (media), wrapped into standard activity structure.
        return $this->prepare_activity_structure($media);
    }
}
