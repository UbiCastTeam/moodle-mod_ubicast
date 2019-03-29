<?php
/**
 * List of ubicast medias in course
 *
 * @package    mod
 * @subpackage ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');

$id = required_param('id', PARAM_INT); // course id

$course = $DB->get_record('course', array('id'=>$id), '*', MUST_EXIST);

require_course_login($course, true);
$PAGE->set_pagelayout('incourse');

$params = array(
    'context' => context_course::instance($course->id)
);
$event = \mod_ubicast\event\course_module_instance_list_viewed::create($params);
$event->add_record_snapshot('course', $course);
$event->trigger();

$strurl       = get_string('modulename', 'ubicast');
$strurls      = get_string('modulenameplural', 'ubicast');
$strname         = get_string('name');
$strintro        = get_string('moduleintro');
$strlastmodified = get_string('lastmodified');

$PAGE->set_url('/mod/ubicast/index.php', array('id' => $course->id));
$PAGE->set_title($course->shortname.': '.$strurls);
$PAGE->set_heading($course->fullname);
$PAGE->navbar->add($strurls);
echo $OUTPUT->header();
echo $OUTPUT->heading($strurls);

if (!$entries = get_all_instances_in_course('ubicast', $course)) {
    notice(get_string('thereareno', 'moodle', $strurls), "$CFG->wwwroot/course/view.php?id=$course->id");
    exit;
}

$usesections = course_format_uses_sections($course->format);

$table = new html_table();
$table->attributes['class'] = 'generaltable mod_index';

if ($usesections) {
    $strsectionname = get_string('sectionname', 'format_'.$course->format);
    $table->head  = array ($strsectionname, $strname, $strintro);
    $table->align = array ('center', 'left', 'left');
} else {
    $table->head  = array ($strlastmodified, $strname, $strintro);
    $table->align = array ('left', 'left', 'left');
}

$modinfo = get_fast_modinfo($course);
$currentsection = '';
foreach ($entries as $entry) {
    $cm = $modinfo->cms[$entry->coursemodule];
    if ($usesections) {
        $printsection = '';
        if ($entry->section !== $currentsection) {
            if ($entry->section) {
                $printsection = get_section_name($course, $entry->section);
            }
            if ($currentsection !== '') {
                $table->data[] = 'hr';
            }
            $currentsection = $entry->section;
        }
    } else {
        $printsection = '<span class="smallinfo">'.userdate($entry->timemodified)."</span>";
    }

    $extra = empty($cm->extra) ? '' : $cm->extra;
    $media_type = 'video';
    if ($entry->mediaid[0] == 'l') {
        $media_type = 'live';
    } else if ($entry->mediaid[0] == 'p') {
        $media_type = 'photos';
    }
    $icon = '<img src="'.$OUTPUT->image_url($media_type, 'ubicast').'" class="activityicon" alt="'.$media_type.'" /> ';

    $class = $entry->visible ? '' : 'class="dimmed"'; // hidden modules are dimmed
    $table->data[] = array (
        $printsection,
        "<a $class $extra href=\"view.php?id=$cm->id\">".$icon.format_string($entry->name)."</a>",
        format_module_intro('ubicast', $entry, $cm->id));
}

echo html_writer::table($table);

echo $OUTPUT->footer();
