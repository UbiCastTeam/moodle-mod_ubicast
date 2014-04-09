==========================================================================

              Easycast MediaServer Moodle activity plugin

==========================================================================

Copyright: UbiCast (http://ubicast.eu)
License: http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later



Description:
    This module allows users to add media from an EasyCast MediaServer web TV in their courses.
    They can also edit medias directly from Moodle without having to go on the MediaServer web TV.


Installation:
    Just put a dir named "easycastms" with all files of this repository in your moodle mod dir.
    Once the plugin installed, you need to set the url of the MediaServer and the API key to use
    in the plugin settings. To edit the plugin's settings, go in :
    "Site administration" -> "Plugins" -> "Plugins overview" and then click on the button named
    "settings" on the line of the plugin. The MediaServer API key can be found in the
    "menu" -> "Global settings" page in your MediaServer.
    After these steps you can add a media from your MediaServer in a course by clicking on the
    button "+Add an activity or resource" and choosing "EasyCast MS media". You will then be
    asked to choose a title, a description and which media from MediaServer should be used.


Dependencies:
    This plugin requires the PHP CURL library, Moodle >= 2.3 and MediaServer >= 4.0.

