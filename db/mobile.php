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
 * Mobile app definition for ubicast
 *
 * @package   mod_ubicast
 */

defined('MOODLE_INTERNAL') || die;

$addons = array(
    "mod_ubicast" => array(
        "handlers" => array(
            'coursechoicegroup' => array(
                'displaydata' => array(
                    'title' => 'pluginname',
                    'icon' => $CFG->wwwroot . '/mod/ubicast/pix/icon.svg',
                    'class' => '',
                ),
                'delegate' => 'CoreCourseModuleDelegate',
                'method' => 'mobile_course_view',
                'styles' => array(
                    'url' => $CFG->wwwroot . '/mod/ubicast/css/style_app.css',
                    'version' => '1.0',
                ),
                'displayrefresh' => true,
                'displayopeninbrowser' => true
            )
        ),
        'lang' => array(
        )
    )
);
