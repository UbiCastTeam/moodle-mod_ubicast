<?php
/**
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Define all the restore steps that will be used by the restore_easycastms_activity_task
 */

/**
 * Structure step to restore one easycastms activity
 */
class restore_easycastms_activity_structure_step extends restore_activity_structure_step {

    protected function define_structure() {

        $paths = array();
        $paths[] = new restore_path_element('easycastms', '/activity/easycastms');

        // Return the paths wrapped into standard activity structure
        return $this->prepare_activity_structure($paths);
    }

    protected function process_easycastms($data) {
        global $DB;

        $data = (object)$data;
        $oldid = $data->id;
        $data->course = $this->get_courseid();

        // insert the easycastms record
        $newitemid = $DB->insert_record('easycastms', $data);
        // immediately after inserting "activity" record, call this
        $this->apply_activity_instance($newitemid);
    }

    protected function after_execute() {
        // Add easycastms related files, no need to match by itemname (just internally handled context)
        $this->add_related_files('mod_easycastms', 'intro', null);
    }
}
