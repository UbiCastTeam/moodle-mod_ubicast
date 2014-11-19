Easycast MediaServer Moodle activity plugin
===========================================

Copyright: UbiCast (http://ubicast.eu)
License: http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later


Description:
------------
This Moodle activity module allows users to add media from an EasyCast MediaServer in their courses.

Installation:
-------------

Follow [the standard moodle procedure](https://docs.moodle.org/28/en/Installing_plugins) to install the module. You can install it from [the official Moodle plugins repository](https://moodle.org/plugins/view.php?plugin=mod_easycastms) or using this git repository.

Once installed, go to the plugin settings in Moodle (usually, Plugins > Activity modules > EasyCast MediaServer plugin): 

![Plugin settings location](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/settings1.png)

Set the url of the MediaServer and the API key to use in the plugin settings: 

![Plugin settings](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/settings2.png)

You can find these in the Mediaserver Global settings menu:

![MS settings](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/settings3.png)

Usage:
------

Once configured, a new activity type is now available in Moodle:

![Use 1](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/use1.png)

This allows the user to import media he has access to in MediaServer:

![Use 2](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/use2.png)

When clicking on "Select a media" the user gets to choose easily from the media he has access to:

![Use 3](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/use3.png)

That's it, content is now integrated in the Moodle course:

![Use 4](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/use4.png)

About rights management
-----------------------

Keep in mind that the rights management is currently based on comparing the usernames in Moodle and Mediaserver (in which case we recommend using LDAP as common authentication backend); if the user has the appropriate rights defined in MediaServer, he can also edit directly from within Moodle or watch the statistics.

Dependencies:
-------------
This plugin requires the PHP CURL library, 
Moodle >= 2.7 and MediaServer >= 4.0.

