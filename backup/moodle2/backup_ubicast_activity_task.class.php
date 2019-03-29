<?php
/**
 * Defines backup_ubicast_activity_task class
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once($CFG->dirroot . '/mod/ubicast/backup/moodle2/backup_ubicast_stepslib.php');

/**
 * Provides all the settings and steps to perform one complete backup of the activity
 */
class backup_ubicast_activity_task extends backup_activity_task {

    /**
     * No specific settings for this activity
     */
    protected function define_my_settings() {
    }

    /**
     * Defines a backup step to store the instance data in the ubicast.xml file
     */
    protected function define_my_steps() {
        $this->add_step(new backup_ubicast_activity_structure_step('ubicast_structure', 'ubicast.xml'));
    }

    /**
     * Code the transformations to perform in the activity in
     * order to get transportable (encoded) links
     */
    static public function encode_content_links($content) {
        return $content;
    }
}
