<?php

/**
 * The mod_ubicast instance list viewed event.
 *
 * @package    mod_ubicast
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_ubicast\event;

defined('MOODLE_INTERNAL') || die();

/**
 * The mod_ubicast instance list viewed event class.
 *
 * @package    mod_ubicast
 * @since      Moodle 2.7
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class course_module_instance_list_viewed extends \core\event\course_module_instance_list_viewed {
    // No code required here as the parent class handles it all.
}
