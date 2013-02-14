<?php
/**
 * Definition of log events
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

$logs = array(
    array('module'=>'easycastms', 'action'=>'view', 'mtable'=>'easycastms', 'field'=>'name'),
    array('module'=>'easycastms', 'action'=>'view all', 'mtable'=>'easycastms', 'field'=>'name'),
    array('module'=>'easycastms', 'action'=>'update', 'mtable'=>'easycastms', 'field'=>'name'),
    array('module'=>'easycastms', 'action'=>'add', 'mtable'=>'easycastms', 'field'=>'name'),
);
