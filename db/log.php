<?php
/**
 * Definition of log events
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

$logs = array(
    array('module'=>'ubicast', 'action'=>'view', 'mtable'=>'ubicast', 'field'=>'name'),
    array('module'=>'ubicast', 'action'=>'view all', 'mtable'=>'ubicast', 'field'=>'name'),
    array('module'=>'ubicast', 'action'=>'update', 'mtable'=>'ubicast', 'field'=>'name'),
    array('module'=>'ubicast', 'action'=>'add', 'mtable'=>'ubicast', 'field'=>'name'),
);
