<?php
/**
 * Private url module utility functions
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once('../../config.php');
require_once("$CFG->libdir/filelib.php");
require_once("$CFG->libdir/resourcelib.php");

function easycastms_get_url_prefix($easycastms_media) {
    $prefix = 'videos';
    if ($easycastms_media->mediaid[0] == 'l') {
        $prefix = 'lives';
    } 
    else {
        if ($easycastms_media->mediaid[0] == 'p') {
            $prefix = 'photos';
        }
    }
    return $prefix;
}

function easycastms_print_header($easycastms_media, $cm, $course) {
    global $PAGE, $OUTPUT;
    
    $PAGE->set_title($course->shortname.': '.$easycastms_media->name);
    $PAGE->set_heading($course->fullname);
    $PAGE->set_activity_record($easycastms_media);
    echo $OUTPUT->header();
}

function easycastms_print_intro($easycastms_media, $cm, $course, $ignoresettings=false) {
    global $OUTPUT;
    
    if (!$ignoresettings) {
        if (trim(strip_tags($easycastms_media->intro))) {
            echo $OUTPUT->box_start('mod_introbox', 'easycastmsintro');
            echo format_module_intro('easycastms', $easycastms_media, $cm->id);
            echo $OUTPUT->box_end();
        }
    }
}

function easycastms_display_media($easycastms_media, $cm, $course, $can_edit) {
    global $CFG, $PAGE, $OUTPUT;
    
    $title = $easycastms_media->name;
    
    easycastms_print_header($easycastms_media, $cm, $course);
    
    $config = get_config('easycastms');
    
    $prefix = easycastms_get_url_prefix($easycastms_media);
    
    $edit_btn = '';
    if ($can_edit) {
        $edit_btn = '<div class="edit-btn"><a href="edit.php?id='.$cm->id.'" title="'.get_string('edit_link', 'easycastms').'"></a></div>';
    }
    
    $code = '
        <div id="easycastms_'.$easycastms_media->mediaid.'" class="easycastms-embed">
            <div class="easycastms-btn-place">
                '.$edit_btn.'
                <div class="fullscreen-btn"><a href="javascript: media_manager_'.$easycastms_media->mediaid.'.toggle_fullscreen();" title="'.get_string('fullscreen', 'easycastms').'"></a></div>
            </div>
            <iframe style="width: 100%; height: 800px;" src="'.$config->easycastms_url.'/'.$prefix.'/permalink/'.$easycastms_media->mediaid.'/iframe/"></iframe>
        </div>
        <link rel="stylesheet" href="statics/stylesheets/embed.css" type="text/css"/>
        <script type="text/javascript" src="statics/javascripts/jquery-latest.min.js"></script>
        <script type="text/javascript" src="statics/javascripts/fullscreen.js"></script>
        <script type="text/javascript" src="statics/javascripts/media_manager.js"></script>
        <script type="text/javascript"> var media_manager_'.$easycastms_media->mediaid.' = new MediaManager("'.$easycastms_media->mediaid.'"); </script>
    ';
    echo $code;
    
    easycastms_print_intro($easycastms_media, $cm, $course);
    
    echo $OUTPUT->footer();
    die;
}

function easycastms_display_media_edition($easycastms_media, $cm, $course) {
    global $CFG, $PAGE, $OUTPUT;
    
    $title = $easycastms_media->name;
    
    easycastms_print_header($easycastms_media, $cm, $course);
    
    $config = get_config('easycastms');
    
    $code = '
        <div id="easycastms_'.$easycastms_media->mediaid.'" class="easycastms-embed">
            <div class="easycastms-btn-place">
                <div class="see-btn"><a href="view.php?id='.$cm->id.'" title="'.get_string('view_link', 'easycastms').'"></a></div>
                <!--<div class="fullscreen-btn"><a href="javascript: media_manager_'.$easycastms_media->mediaid.'.toggle_fullscreen();" title="'.get_string('fullscreen', 'easycastms').'"></a></div>-->
            </div>
            <iframe style="width: 100%; height: 800px;" src="'.$config->easycastms_url.'/edit/iframe/'.$easycastms_media->mediaid.'/"></iframe>
        </div>
        <link rel="stylesheet" href="statics/stylesheets/embed.css" type="text/css"/>
        <!--<script type="text/javascript" src="statics/javascripts/jquery-latest.min.js"></script>-->
        <!--<script type="text/javascript" src="statics/javascripts/fullscreen.js"></script>-->
        <script type="text/javascript" src="statics/javascripts/media_manager.js"></script>
        <script type="text/javascript"> var media_manager_'.$easycastms_media->mediaid.' = new MediaManager("'.$easycastms_media->mediaid.'"); </script>
    ';
    echo $code;
    
    easycastms_print_intro($easycastms_media, $cm, $course);
    
    echo $OUTPUT->footer();
    die;
}

class HttpRequest {
    public $url = null;
    public $data = null;
    public $method = 'GET';
    public $body = null;
    public $headers = array();
    public $allow_redirect = true;

    private $url_info = null;
    private $data_string = '';
    private $host_name = null;
    private $host_ip = null;
    private $response_body = null;
    private $response_headers = array();
    private $response_code = null;
    private $response_message = null;
    private $port = null;
    private $verbose = true;

    public function __construct($url, $method = 'GET', $data = null) {
        $this->url = $url;
        $this->method = $method;
        $this->data = $data;

        // parse url
        $this->url_info = parse_url($url);
        $this->host_name = $this->url_info['host'];
        $this->host_ip = gethostbyname($this->host_name);
        
        // data arguments
        $this->data_string = '';
        if (gettype($data) == 'array') {
            foreach ($this->data as $key => $value) {
                $this->data_string .= '&'.urlencode($key).'='.urlencode($value);
            }
            if (strlen($this->data_string) > 0)
                $this->data_string[0] = '?';
        }

        // get port number given the scheme
        if (!isset($this->url_info['port'])) {
            if ($this->url_info['scheme'] == "http")
                $this->port = 80;
            else if ($this->url_info['scheme'] == "https")
                $this->port = 443;
        } else {
            $this->port = $this->url_info['port'];
        }

        // add default headers
        $this->headers["Host"] = "$this->host_name";
        $this->headers["Connection"] = "close";
    }

    private function constructRequest() {
        $path = "/";
        if (isset($this->url_info['path']))
            $path = $this->url_info['path'];

        $req = "$this->method $path$this->data_string HTTP/1.1\r\n";
        foreach ($this->headers as $header => $value) {
            $req .= "$header: $value\r\n";
        }
        return "$req\r\n";
    }

    /// reads a line from a file
    function readLine($fp) {
        $line = "";

        while (!feof($fp)) {
            $line .= fgets($fp, 2048);
            if (substr($line, -1) == "\n")
                return rtrim($line, "\r\n");
        }
        return $line;
    }

    public function send() {
        $fp = @fsockopen($this->host_ip, $this->port, $errno, $errstr, 30);
        if (!is_resource($fp))
            throw new Exception("$errstr ($errno)");

        // construct request
        $request = $this->constructRequest();

        // write request to socket
        fwrite($fp, $request);

        // read the status line
        $line = $this->readline($fp);
        $status = explode(" ", $line);

        // make sure the HTTP version is valid
        if (!isset($status[0]) || !preg_match("/^HTTP\/\d+\.?\d*/", $status[0]))
            throw new Exception("Couldn't get HTTP version from response.");

        // get the response code
        if (!isset($status[1]))
            throw new Exception("Couldn't get HTTP response code from response.");
        else
            $this->response_code = $status[1];

        // get the reason, e.g. "not found"
        if (!isset($status[2]))
            throw new Exception("Couldn't get HTTP response reason from response.");
        else
            $this->response_reason = $status[2];

        // read the headers
        while (!feof($fp) && $line != "") {
            $line = $this->readLine($fp);
            if ($line != "") {
                $header = preg_split("/:/", $line);
                $this->response_headers[$header[0]] = ltrim($header[1]);
            }
        }
        $chunked = false;
        if (isset($this->response_headers['Transfer-Encoding']) && $this->response_headers['Transfer-Encoding'] == 'chunked')
            $chunked = true;

        // read the body
        $this->response_body = "";
        if (!$chunked) {
            while (!feof($fp)) {
                $line = $this->readLine($fp);
                $this->response_body .= "$line\n";
            }
        }
        else {
            // read body of chunked response
            // http://fr.wikipedia.org/wiki/Chunked_transfer_encoding
            $chunk_line = true;
            $chunk_length = 0;
            $readen = 0;
            $chunk_content = "";
            while (!feof($fp)) {
                $line = $this->readLine($fp);
                if ($chunk_line) {
                    if ($line) {
                        $chunk_line = false;
                        $chunk_length = hexdec($line);
                        $chunk_content = "";
                        $readen = 0;
                    }
                }
                else {
                    $chunk_content .= "\n$line";
                    $readen += strlen($line) + 1; // +1 for \n
                    if ($readen >= $chunk_length) {
                        $chunk_line = true;
                        if (strlen($chunk_content) > 0)
                            $this->response_body .= substr($chunk_content, 1);
                    }
                }
            }
        }

        // close the connection
        fclose($fp);
        
        return true;
    }

    public function getResponseCode() {
        return $this->response_code;
    }

    public function getHeaders() {
        return $this->response_headers;
    }
    
    public function getResponseBody() {
        return $this->response_body;
    }
}

