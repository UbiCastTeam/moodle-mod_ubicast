<?php
/**
 * Folder module version information
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

$plugin->version   = 2019030100;                 // The current module version (Date: YYYYMMDDXX)
$plugin->requires  = 2015111610; // 3.0          // Requires this Moodle version
$plugin->component = 'mod_easycastms';           // Full name of the plugin (used for diagnostics)
$plugin->release   = '2.2 (Build: 2019030100)';  // Human-readable version name
$plugin->maturity  = MATURITY_STABLE;            // Maturity of module
$plugin->cron      = 0;
