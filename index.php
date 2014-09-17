<?php
/**
 * List of easycastms medias in course
 *
 * @package    mod
 * @subpackage easycastms
 * @copyright  2013 UbiCast {@link http://ubicast.eu}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');

$id = required_param('id', PARAM_INT); // course id

$course = $DB->get_record('course', array('id'=>$id), '*', MUST_EXIST);

require_course_login($course, true);
$PAGE->set_pagelayout('incourse');

$event = \mod_easycastms\event\course_module_instance_list_viewed::create(array(
    'context' => context_course::instance($course->id)
));
$event->trigger();

$strmedias       = get_string('medias', 'easycastms');
$strsectionname  = get_string('sectionname', 'format_'.$course->format);
$strname         = get_string('name');
$strintro        = get_string('moduleintro');
$strlastmodified = get_string('lastmodified');

$PAGE->set_url('/mod/easycastms/index.php', array('id' => $course->id));
$PAGE->set_title($course->shortname.': '.$strmedias);
$PAGE->set_heading($course->fullname);
$PAGE->navbar->add($strmedias);
echo $OUTPUT->header();

$easycastms_medias = get_all_instances_in_course('easycastms', $course);
if (!$easycastms_medias) {
    notice(get_string('thereareno', 'moodle', $strmedias), "$CFG->wwwroot/course/view.php?id=$course->id");
    exit;
}

$usesections = course_format_uses_sections($course->format);
if ($usesections) {
    $sections = get_all_sections($course->id);
}

$table = new html_table();
$table->attributes['class'] = 'generaltable mod_index';

if ($usesections) {
    $table->head  = array($strsectionname, $strname, $strintro);
    $table->align = array('center', 'left', 'left');
} else {
    $table->head  = array($strlastmodified, $strname, $strintro);
    $table->align = array('left', 'left', 'left');
}

$modinfo = get_fast_modinfo($course);
$currentsection = '';
foreach ($easycastms_medias as $easycastms_media) {
    $cm = $modinfo->cms[$easycastms_media->coursemodule];
    if ($usesections) {
        $printsection = '';
        if ($easycastms_media->section !== $currentsection) {
            if ($easycastms_media->section) {
                $printsection = get_section_name($course, $sections[$easycastms_media->section]);
            }
            if ($currentsection !== '') {
                $table->data[] = 'hr';
            }
            $currentsection = $easycastms_media->section;
        }
    } else {
        $printsection = '<span class="smallinfo">'.userdate($easycastms_media->timemodified).'</span>';
    }

    $extra = empty($cm->extra) ? '' : $cm->extra;
    $media_type = 'video';
    if ($easycastms_media->mediaid[0] == 'l') {
        $media_type = 'live';
    } else if ($easycastms_media->mediaid[0] == 'p') {
        $media_type = 'photos';
    }
    $icon = '<img src="'.$OUTPUT->pix_url($media_type).'" class="activityicon" alt="'.$media_type.'" /> ';

    $class = $easycastms_media->visible ? '' : 'class="dimmed"'; // hidden modules are dimmed
    $table->data[] = array(
        $printsection,
        '<a $class $extra href="view.php?id=$cm->id">'.$icon.format_string($easycastms_media->name).'</a>',
        format_module_intro('easycastms', $easycastms_media, $cm->id));
}

echo html_writer::table($table);

echo $OUTPUT->footer();
