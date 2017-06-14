<?php
/**
 * Folder module version information
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

$plugin->version   = 2017061400;                 // The current module version (Date: YYYYMMDDXX)
$plugin->requires  = 2014051200; // 2.7.0        // Requires this Moodle version
$plugin->component = 'mod_easycastms';           // Full name of the plugin (used for diagnostics)
$plugin->release   = '1.20 (Build: 2017061400)'; // Human-readable version name
$plugin->maturity  = MATURITY_STABLE;            // Maturity of module
$plugin->cron      = 0;
