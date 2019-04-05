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
 * URL configuration form
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot.'/course/moodleform_mod.php');
require_once($CFG->dirroot.'/config.php');

class mod_ubicast_mod_form extends moodleform_mod {
    function definition() {
        global $CFG, $DB, $COURSE;
        $mform = $this->_form;

        $config = get_config('ubicast');

        //-------------------------------------------------------
        $mform->addElement('header', 'general', get_string('general', 'form'));
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'64'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $this->standard_intro_elements();

        //-------------------------------------------------------
        $config = get_config('ubicast');
        $tool_base_URL = $config->ubicast_url;
        $mform->addElement('header', 'content', get_string('form_resource_header', 'ubicast'));
        $mform->addElement('html', '
            <div class="fitem">
                <div class="felement" style="margin: 0;">
                    <iframe class="mod-ubicast" style="margin: 0; width: 450px; height: 10px;" src="" frameborder="0"></iframe>
                </div>
            </div>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/ubicast/statics/jquery.min.js?_=9"></script>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/ubicast/statics/media_selector.js?_=9"></script>
            <script type="text/javascript">
                var media_selector = new MediaSelector({
                    moodleURL: "'.$CFG->wwwroot.'/mod/ubicast/lti.php?id='.$COURSE->id.'",
                    mediaserverURL: "'.$tool_base_URL.'",
                    target: "mod-ubicast"
                });
            </script>');
        $mform->addElement('text', 'mediaid', get_string('form_resource', 'ubicast'), ['size' => '20', 'class' => 'mod-ubicast']);
        $mform->addHelpButton('mediaid', 'form_resource', 'ubicast');
        $mform->setType('mediaid', PARAM_TEXT);
        $mform->addRule('mediaid', null, 'required', null, 'client');

        //-------------------------------------------------------
        $this->standard_coursemodule_elements();

        //-------------------------------------------------------
        $this->add_action_buttons();
    }
}
