<?php

/**
 * Define all the backup steps that will be used by the backup_easycastms_activity_task
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

 /**
 * Define the complete easycastms structure for backup, with file and id annotations
 */
class backup_easycastms_activity_structure_step extends backup_activity_structure_step {

    protected function define_structure() {
        //the easycastms module stores no user info

        // Define each element separated
        $media = new backup_nested_element('easycastms', array('id'), array('name', 'intro', 'introformat', 'mediaid', 'timemodified'));


        // Build the tree
        //nothing here for easycastms

        // Define sources
        $media->set_source_table('easycastms', array('id' => backup::VAR_ACTIVITYID));

        // Define id annotations
        //module has no id annotations

        // Define file annotations
        $media->annotate_files('mod_easycastms', 'intro', null); // This file area hasn't itemid

        // Return the root element (media), wrapped into standard activity structure
        return $this->prepare_activity_structure($media);
    }
}
