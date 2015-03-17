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

$module->version   = 2015031700;                 // The current module version (Date: YYYYMMDDXX)
$module->requires  = 2014051200; // 2.7.0        // Requires this Moodle version
$module->component = 'mod_easycastms';           // Full name of the plugin (used for diagnostics)
$module->cron      = 0;
$module->release   = '1.18 (Build: 2015031700)'; // Human-readable version name
$module->maturity  = MATURITY_STABLE;            // Maturity of module
