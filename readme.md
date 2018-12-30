Easycast MediaServer Moodle activity plugin
===========================================

Copyright: UbiCast (http://www.ubicast.eu)
License: http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later

Description:
------------
This Moodle activity module allows users to add media from an EasyCast MediaServer in their courses.

Dependencies:
-------------
This plugin requires the PHP CURL library,
Moodle >= *2.7* and MediaServer >= *6.6*.

Installation:
-------------

If you clone this repository, do not forget to initialise the git submodule:

```bash
git clone --recursive https://github.com/UbiCastTeam/moodle-mod_easycastms
cd moodle-mod_easycastms
```

Follow [the standard moodle procedure](https://docs.moodle.org/28/en/Installing_plugins) to install the module. You can install it from [the official Moodle plugins repository](https://moodle.org/plugins/view.php?plugin=mod_easycastms) or using this git repository (zipped with `zip -r plugin.zip moodle-mod_easycastms -x "*.git*"` to avoid zipping all the git artifacts).

Once installed, go to the plugin settings in Moodle (usually, Plugins > Activity modules > EasyCast MediaServer plugin):

![Plugin settings location](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/settings1.png)

Set the url of the MediaServer and the API key to use in the plugin settings:

![Plugin settings](http://www.ubicast.eu/medias/downloads/techdocs/lms-integration/moodle/settings2.png)

You can find these in the Mediaserver authentication settings:

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

Development environment
-----------------------

Clone the following repositories in a folder:

* https://github.com/moodlehq/moodle-docker
* https://github.com/UbiCastTeam/moodle-mod_easycastms
* Get latest version of the moodle source code at: https://download.moodle.org/ or clone https://github.com/moodle/moodle

Then follow the steps given into `moodle-docker`'s readme.

After that, follow the steps above for installation.

In moodle, the plugin will be copied to `mod/easycastms`, so to work on it, you can do it right away in there.

How does the LTI Video integration work?
-----------------

This is highly inspired from the way `moodle` does it in the external tool.

We integrate an `iframe` in our course, which points to the `launch.php` file of the plugin.

That page is returning a "self submitting" `form` (transforming therefore a `GET` request into a `POST`) towards the EasyCast Media Server LTI url of the Media (ex: `https://yourname.ubicast.tv/lti/v125acedf1dfedeojhk0/`) with all the needed parameters (`oauth`, `roles`, etc.)

This allows Media Server to know the identity of the moodle user, and give the corresponding access on the media (`student`, `teacher`, etc.)

About rights management
-----------------------

Keep in mind that the rights management is currently based on comparing the usernames in Moodle and Mediaserver (in which case we recommend using LDAP as common authentication backend); if the user has the appropriate rights defined in MediaServer, he can also edit directly from within Moodle or watch the statistics.
