<?php
/**
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Define all the restore steps that will be used by the restore_ubicast_activity_task
 */

/**
 * Structure step to restore one ubicast activity
 */
class restore_ubicast_activity_structure_step extends restore_activity_structure_step {

    protected function define_structure() {

        $paths = array();
        $paths[] = new restore_path_element('ubicast', '/activity/ubicast');

        // Return the paths wrapped into standard activity structure
        return $this->prepare_activity_structure($paths);
    }

    protected function process_ubicast($data) {
        global $DB;

        $data = (object)$data;
        $oldid = $data->id;
        $data->course = $this->get_courseid();

        // insert the ubicast record
        $newitemid = $DB->insert_record('ubicast', $data);
        // immediately after inserting "activity" record, call this
        $this->apply_activity_instance($newitemid);
    }

    protected function after_execute() {
        // Add ubicast related files, no need to match by itemname (just internally handled context)
        $this->add_related_files('mod_ubicast', 'intro', null);
    }
}
