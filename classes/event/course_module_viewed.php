<?php
/**
 * The mod_ubicast course module viewed event.
 *
 * @package    mod_ubicast
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_ubicast\event;

defined('MOODLE_INTERNAL') || die();

/**
 * The mod_ubicast course module viewed event class.
 *
 * @package    mod_ubicast
 * @since      Moodle 2.7
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class course_module_viewed extends \core\event\course_module_viewed {

    /**
     * Init method.
     */
    protected function init() {
        $this->data['crud'] = 'r';
        $this->data['edulevel'] = self::LEVEL_PARTICIPATING;
        $this->data['objecttable'] = 'ubicast';
    }

   /**
     * Replace add_to_log() statement.
     *
     * @return array of parameters to be passed to legacy add_to_log() function.
     */
    protected function get_legacy_logdata() {
        return array($this->courseid, 'ubicast', 'view', 'view.php?id=' . $this->contextinstanceid, $this->objectid, $this->contextinstanceid);
    }
}
