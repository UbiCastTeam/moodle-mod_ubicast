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
 * Folder module version information
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$plugin->version   = 2019060700;                 // The current module version (Date: YYYYMMDDXX).
$plugin->requires  = 2015111610;  // 3.0         // Requires this Moodle version.
$plugin->component = 'mod_ubicast';              // Full name of the plugin (used for diagnostics).
$plugin->release   = '3.2 (Build: 2019060700)';  // Human-readable version name.
$plugin->maturity  = MATURITY_STABLE;            // Maturity of module.
$plugin->cron      = 0;

$plugin->dependencies = [
    'mod_lti' => 2015111610,
];
