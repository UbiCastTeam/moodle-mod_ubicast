<?php

/**
 * The mod_easycastms instance list viewed event.
 *
 * @package    mod_easycastms
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_easycastms\event;

defined('MOODLE_INTERNAL') || die();

/**
 * The mod_easycastms instance list viewed event class.
 *
 * @package    mod_easycastms
 * @since      Moodle 2.7
 * @copyright  2014 Baptiste Desprez <baptiste.desprez@polytechnique.fr>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class course_module_instance_list_viewed extends \core\event\course_module_instance_list_viewed {
    // No code required here as the parent class handles it all.
}
