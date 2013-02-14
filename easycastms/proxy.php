<?php
/**
 * easycastms module proxy for API calls with easycastms
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once('lib.php');
require_once("$CFG->dirroot/mod/easycastms/locallib.php");


// check access right
header('Content-type: application/json'); // set response mime type
if (!isloggedin()) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_login_required', 'easycastms')));
    die;
}
$context = null;
if (isset($_REQUEST['course_id'])) {
    $context = context_course::instance($_REQUEST['course_id']); // course context
    $PAGE->set_url('/mod/easycastms/proxy.php', array('course_id' => $_REQUEST['course_id']));
}
else {
    $context = context_user::instance($USER->id); // user context
    $PAGE->set_url('/mod/easycastms/proxy.php');
}
if (!has_capability('mod/easycastms:addinstance', $context)) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_permission_required', 'easycastms')));
    die;
}


// get api action
if (!isset($_REQUEST['action'])) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_action_missing', 'easycastms')));
    die;
}
$action = $_REQUEST['action'];


// API call on easycastms
$config = get_config('easycastms');
$data = array('api_key' => $config->easycastms_apikey, 'username' => $USER->username);
if ($action == '/api/v2/channels/content/') {
    if (isset($_REQUEST['parent_id']))
        $data['parent_id'] = $_REQUEST['parent_id'];
}
else if ($action == '/api/v2/medias/get/') {
    if (isset($_REQUEST['media_id']))
        $data['media_id'] = $_REQUEST['media_id'];
}
$req = new HttpRequest($config->easycastms_url.$action, 'GET', $data);
try {
    $req->send();
}
catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_request_error', 'easycastms').' '.$e->getMessage()));
    die;
}
try {
    $response_body = $req->getResponseBody();
    $response = json_decode($response_body);
    if ($response != null)
        echo $response_body;
    else
        echo json_encode(array('success' => false, 'error' => get_string('proxy_parsing_error', 'easycastms').' Code: '.json_last_error().'. Reponse: \''.$response_body.'\''));
}
catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_parsing_error', 'easycastms').' '.$e.' Response: \''.$req->getResponseBody().'\''));
}
die;

