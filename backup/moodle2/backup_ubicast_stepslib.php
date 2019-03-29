<?php
/**
 * Define all the backup steps that will be used by the backup_ubicast_activity_task
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

 /**
 * Define the complete ubicast structure for backup, with file and id annotations
 */
class backup_ubicast_activity_structure_step extends backup_activity_structure_step {

    protected function define_structure() {
        //the ubicast module stores no user info

        // Define each element separated
        $media = new backup_nested_element('ubicast', array('id'), array('name', 'intro', 'introformat', 'mediaid', 'timemodified'));


        // Build the tree
        //nothing here for ubicast

        // Define sources
        $media->set_source_table('ubicast', array('id' => backup::VAR_ACTIVITYID));

        // Define id annotations
        //module has no id annotations

        // Define file annotations
        $media->annotate_files('mod_ubicast', 'intro', null); // This file area hasn't itemid

        // Return the root element (media), wrapped into standard activity structure
        return $this->prepare_activity_structure($media);
    }
}
