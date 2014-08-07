<?php
/**
 * URL configuration form
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) { die('Direct access to this script is forbidden.'); }

require_once($CFG->dirroot.'/course/moodleform_mod.php');
require_once($CFG->dirroot.'/config.php');

class mod_easycastms_mod_form extends moodleform_mod {
    function definition() {
        global $CFG, $DB, $COURSE;
        $mform = $this->_form;
        
        $config = get_config('easycastms');
        
        //-------------------------------------------------------
        $mform->addElement('header', 'general', get_string('general', 'form'));
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'64'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $this->add_intro_editor(false);

        //-------------------------------------------------------
        $mform->addElement('header', 'content', get_string('form_media_header', 'easycastms'));
        $mform->addElement('text', 'mediaid', get_string('form_media_id', 'easycastms'), array('size'=>'20'));
        $mform->addRule('mediaid', null, 'required', null, 'client');
        $trans_script = '';
        if (get_string('language_code', 'easycastms') == 'fr')
            $trans_script = '<script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/ecms_trans_fr.js?_=1"></script>';
        $mform->addElement('html', '
            <div class="fitem">
                <div class="felement">
                    <div id="catalog_browser_preview">
                        <img src="'.$CFG->wwwroot.'/mod/easycastms/statics/images/media.png"/>
                        <div></div>
                        <a href="javascript: catalog_browser.open();">'.get_string('form_pick_media', 'easycastms').'</a>
                    </div>
                </div>
            </div>
            
            <link rel="stylesheet" type="text/css" href="'.$CFG->wwwroot.'/mod/easycastms/statics/stylesheets/overlay-displayer.css"/>
            <link rel="stylesheet" type="text/css" href="'.$CFG->wwwroot.'/mod/easycastms/statics/stylesheets/ecms_browser.css?_=1"/>
            <link rel="stylesheet" type="text/css" href="'.$CFG->wwwroot.'/mod/easycastms/statics/stylesheets/form.css"/>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/jquery-latest.min.js"></script>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/utils.js?_=1"></script>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/overlay_displayer.js"></script>
            '.$trans_script.'
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/ecms_tree.js?_=1"></script>
            <script type="text/javascript" src="'.$CFG->wwwroot.'/mod/easycastms/statics/javascripts/ecms_browser.js?_=1"></script>
            <script type="text/javascript">
                var catalog_browser = new ECMSCatalogBrowser({
                    base_url: "'.$CFG->wwwroot.'/mod/easycastms/proxy.php",
                    use_proxy: true,
                    request_data: { course_id: "'.$COURSE->id.'" },
                    title: "'.get_string('form_pick_media', 'easycastms').'",
                    on_pick: function (media) {
                        $(document).ready(function () {
                            $("#id_mediaid").val(media.oid);
                            $("#catalog_browser_preview img").attr("src", media.thumb);
                            $("#catalog_browser_preview div").html(media.title);
                        });
                    },
                    language: "'.get_string('language_code', 'easycastms').'"
                });
                $(document).ready(function () {
                    var initial_oid = $("#id_mediaid").val();
                    if (initial_oid)
                        catalog_browser.pick(initial_oid);
                });
            </script>');
        
        //-------------------------------------------------------
        $this->standard_coursemodule_elements();

        //-------------------------------------------------------
        $this->add_action_buttons();
    }
}

