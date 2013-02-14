<?php

/**
 * Defines backup_easycastms_activity_task class
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once($CFG->dirroot . '/mod/easycastms/backup/moodle2/backup_easycastms_stepslib.php');

/**
 * Provides all the settings and steps to perform one complete backup of the activity
 */
class backup_easycastms_activity_task extends backup_activity_task {

    /**
     * No specific settings for this activity
     */
    protected function define_my_settings() {
    }

    /**
     * Defines a backup step to store the instance data in the easycastms.xml file
     */
    protected function define_my_steps() {
        $this->add_step(new backup_easycastms_activity_structure_step('easycastms_structure', 'easycastms.xml'));
    }

    /**
     * Code the transformations to perform in the activity in
     * order to get transportable (encoded) links
     */
    static public function encode_content_links($content) {
        return $content;
    }
}
