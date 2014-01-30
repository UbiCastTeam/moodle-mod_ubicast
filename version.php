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

$module->version   = 2014013000;                 // The current module version (Date: YYYYMMDDXX)
$module->requires  = 2012062500;                 // Requires this Moodle version
$module->component = 'mod_easycastms';           // Full name of the plugin (used for diagnostics)
$module->cron      = 0;
$module->release   = '1.14 (Build: 2014013000)'; // Human-readable version name
$module->maturity  = MATURITY_STABLE;            // Maturity of module
