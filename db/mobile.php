<?php

$addons = array(
    "mod_ubicast" => array(
        "handlers" => array( // Different places where the add-on will display content.
            'coursechoicegroup' => array( // Handler unique name (can be anything)
                'displaydata' => array(
                    'title' => 'pluginname',
                    'icon' => $CFG->wwwroot . '/mod/ubicast/pix/icon.svg',
                    'class' => '',
                ),
                'delegate' => 'CoreCourseModuleDelegate', // Delegate (where to display the link to the add-on)
                'method' => 'mobile_course_view', // Main function in \mod_choicegroup\output\mobile
                'styles' => array(
                    'url' => $CFG->wwwroot . '/mod/ubicast/css/style_app.css',
                    'version' => '0.4',
                ),
                'displayrefresh' => true, // Hide default refresh button, a custom one will be used.
            )
        ),
        'lang' => array(
        )
    )
);