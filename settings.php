<?php
/**
 * Url module admin settings and defaults
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

if ($ADMIN->fulltree) {
    require_once("$CFG->libdir/resourcelib.php");

    $settings->add(new admin_setting_configtext('ubicast/ubicast_url', get_string('settings_url', 'ubicast'),
        get_string('settings_url_help', 'ubicast'), ''));

    $settings->add(new admin_setting_configtext('ubicast/ubicast_ltikey', get_string('settings_ltikey', 'ubicast'),
        get_string('settings_ltikey_help', 'ubicast'), ''));

    $settings->add(new admin_setting_configpasswordunmask('ubicast/ubicast_ltisecret', get_string('settings_ltisecret', 'ubicast'),
        get_string('settings_ltisecret_help', 'ubicast'), ''));
}
