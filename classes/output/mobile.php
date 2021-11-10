<?php

namespace mod_ubicast\output;

defined('MOODLE_INTERNAL') || die();

use context_module;

class mobile {

    public static function mobile_course_view($args) {
        global $DB,$OUTPUT;

        $args = (object) $args;
        $cm = get_coursemodule_from_id('ubicast', $args->cmid);

        if (!$ubicastresource = $DB->get_record('ubicast', array('id' => $cm->instance))) {
            print_error('course module is incorrect');
        }

        $config = get_config('ubicast');
        $key = $config->ubicast_ltikey;
        $secret = $config->ubicast_ltisecret;

            $iframeurl = $config->ubicast_url.'/permalink/'.$ubicastresource->mediaid.'/iframe/?login=no';
        $data=['iframeurl' => $iframeurl];
        return [
            'templates' => [
                [
                    'id' => 'main',
                    'html' => $OUTPUT->render_from_template('mod_ubicast/mobile_view_page', $data),
                ],
            ],
            'javascript' => file_get_contents($CFG->wwwroot.'/mod/ubicast/statics/iframe_manager.js'),
        ];
    }

}