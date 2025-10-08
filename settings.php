<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Url module admin settings and defaults
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    require_once($CFG->libdir . '/resourcelib.php');

    $settings->add(new admin_setting_configtext('ubicast/ubicast_url',
        get_string('settings_url', 'ubicast'),
        get_string('settings_url_help', 'ubicast'), ''));

    $settings->add(new admin_setting_configtext('ubicast/ubicast_ltikey',
        get_string('settings_ltikey', 'ubicast'),
        get_string('settings_ltikey_help', 'ubicast'), ''));

    $settings->add(new admin_setting_configpasswordunmask('ubicast/ubicast_ltisecret',
        get_string('settings_ltisecret', 'ubicast'),
        get_string('settings_ltisecret_help', 'ubicast'), ''));

    $settings->add(new admin_setting_configcheckbox('ubicast/ubicast_speakerfilter',
        get_string('settings_speakerfilter', 'ubicast'),
        get_string('settings_speakerfilter_help', 'ubicast'), 1));
}
