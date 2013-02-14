<?php
/**
 * Url module admin settings and defaults
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

if ($ADMIN->fulltree) {
    require_once("$CFG->libdir/resourcelib.php");

    $settings->add(new admin_setting_configtext('easycastms/easycastms_url', get_string('settings_url', 'easycastms'),
        get_string('settings_url_helptext', 'easycastms'), ''));
    
    $settings->add(new admin_setting_configpasswordunmask('easycastms/easycastms_apikey', get_string('settings_apikey', 'easycastms'),
        get_string('settings_apikey_helptext', 'easycastms'), ''));
}
