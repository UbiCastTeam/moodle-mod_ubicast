<?php
/**
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once($CFG->dirroot . '/mod/easycastms/backup/moodle2/restore_easycastms_stepslib.php'); // Because it exists (must)

/**
 * easycastms restore task that provides all the settings and steps to perform one
 * complete restore of the activity
 */
class restore_easycastms_activity_task extends restore_activity_task {

    /**
     * Define (add) particular settings this activity can have
     */
    protected function define_my_settings() {
        // No particular settings for this activity
    }

    /**
     * Define (add) particular steps this activity can have
     */
    protected function define_my_steps() {
        // easycastms only has one structure step
        $this->add_step(new restore_easycastms_activity_structure_step('easycastms_structure', 'easycastms.xml'));
    }

    /**
     * Define the contents in the activity that must be
     * processed by the link decoder
     */
    static public function define_decode_contents() {
        $contents = array();

        $contents[] = new restore_decode_content('easycastms', array('intro', 'mediaid'), 'easycastms');

        return $contents;
    }

    /**
     * Define the decoding rules for links belonging
     * to the activity to be executed by the link decoder
     */
    static public function define_decode_rules() {
        $rules = array();

        return $rules;
    }

    /**
     * Define the restore log rules that will be applied
     * by the {@link restore_logs_processor} when restoring
     * easycastms logs. It must return one array
     * of {@link restore_log_rule} objects
     */
    static public function define_restore_log_rules() {
        $rules = array();

        $rules[] = new restore_log_rule('easycastms', 'add', 'view.php?id={course_module}', '{easycastms}');
        $rules[] = new restore_log_rule('easycastms', 'update', 'view.php?id={course_module}', '{easycastms}');
        $rules[] = new restore_log_rule('easycastms', 'view', 'view.php?id={course_module}', '{easycastms}');

        return $rules;
    }

    /**
     * Define the restore log rules that will be applied
     * by the {@link restore_logs_processor} when restoring
     * course logs. It must return one array
     * of {@link restore_log_rule} objects
     *
     * Note this rules are applied when restoring course logs
     * by the restore final task, but are defined here at
     * activity level. All them are rules not linked to any module instance (cmid = 0)
     */
    static public function define_restore_log_rules_for_course() {
        $rules = array();

        $rules[] = new restore_log_rule('easycastms', 'view all', 'index.php?id={course}', null);

        return $rules;
    }
}
