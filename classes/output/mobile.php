<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Mobile output class for ubicast
 *
 * @package    mod_ubicast
 */
namespace mod_ubicast\output;

use context_module;

/**
 * Mobile output class for ubicast
 *
 * @package    mod_ubicast
 */
class mobile {
    /**
     * Returns the ubicast course view for the mobile app.
     *
     * @param mixed $args
     * @throws \moodle_exception
     * @return array HTML, javascript and other data.
     */
    public static function mobile_course_view($args) {
        global $DB, $OUTPUT;

        $args = (object) $args;
        $cm = get_coursemodule_from_id('ubicast', $args->cmid);

        if (!$ubicastresource = $DB->get_record('ubicast', array('id' => $cm->instance))) {
            throw new moodle_exception('course module is incorrect');
        }

        $config = get_config('ubicast');
        $key = $config->ubicast_ltikey;
        $secret = $config->ubicast_ltisecret;
        $target = $ubicastresource->mediaid;
        $endpoint = $config->ubicast_url.'/lti/'.$target;
        $endpoint = trim($endpoint);

        $data = [
            'launch_activity_mobile' => get_string('launch_activity_mobile', 'mod_ubicast'),
            'endpoint' => $endpoint
        ];
        return [
            'templates' => [
                [
                    'id' => 'main',
                    'html' => $OUTPUT->render_from_template('mod_ubicast/mobile_view_page', $data),
                ],
            ],
        ];
    }

}
