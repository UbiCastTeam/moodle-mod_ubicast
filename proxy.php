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

// check that curl is available
if (!function_exists("curl_init") || !function_exists("curl_setopt") || !function_exists("curl_exec") || !function_exists("curl_close")) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_curl_missing', 'easycastms')));
    die;
}

// get api action
if (!isset($_REQUEST['action'])) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_action_missing', 'easycastms')));
    die;
}
$action = $_REQUEST['action'];

// Prepare MediaServer url
$config = get_config('easycastms');
$data = $_REQUEST;
unset($data['action']);
unset($data['course_id']);
if (isset($data['_'])) // jquery anti caching argument
    unset($data['_']);
$data['api_key'] = $config->easycastms_apikey;
$data['use_username'] = $USER->username;

$args = '';
if (gettype($data) == 'array') {
    foreach ($data as $key => $value) {
        $args .= '&'.urlencode($key).'='.urlencode($value);
    }
    if (strlen($args) > 0)
        $args[0] = '?';
}
$url = $config->easycastms_url.$action.$args;

// Execute request
$response_body = null;
$http_status = 200;
try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    // Set so curl_exec returns the result instead of outputting it.
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Set SSL options
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    // Get the response and close the channel.
    $response_body = curl_exec($ch);
    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
}
catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_request_error', 'easycastms').' '.$e->getMessage()));
    die;
}
http_response_code($http_status);
try {
    $response = json_decode($response_body);
    if ($response != null)
        echo $response_body;
    else
        echo json_encode(array('success' => false, 'error' => get_string('proxy_parsing_error', 'easycastms').' Code: '.json_last_error().'. Reponse: \''.$response_body.'\''));
}
catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => get_string('proxy_parsing_error', 'easycastms').' '.$e.' Response: \''.$response_body.'\''));
}
die;

