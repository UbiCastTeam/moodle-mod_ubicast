Easycast MediaServer Moodle activity plugin
===========================================

Copyright: UbiCast (https://www.ubicast.eu)
License: https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later

Description:
------------

This Moodle activity module allows users to add media from an EasyCast MediaServer in their courses.


Dependencies:
-------------

This plugin requires Moodle >= *3.0* and MediaServer >= *7.9*.


Installation:
-------------

Follow [the standard moodle procedure](https://docs.moodle.org/28/en/Installing_plugins) to install the module. You can install it from [the official Moodle plugins repository](https://moodle.org/plugins/view.php?plugin=mod_easycastms) or using this git repository.

To use the repository, clone it in your mod dir:

```bash
cd "moodle/mod"
git clone "https://github.com/UbiCastTeam/moodle-mod_easycastms" easycastms
```

Once installed, go to the plugin settings in Moodle (usually, Plugins > Activity modules > EasyCast MediaServer plugin):

![Plugin settings location](../assets/plugin-location.png)

Set the MediaServer URL, LTI key and LTI secret to use in the plugin settings:

![Plugin settings](../assets/plugin-settings.png)

You can find these in the Mediaserver LTI settings (in the authentication settings section):

![LTI Settings](../assets/lti-settings.png)


Usage:
------

Once configured, a new activity type is now available in Moodle:

![Use 1](../assets/use1.png)

This allows the user to import media he has access to in MediaServer:

![Use 2](../assets/use2.png)

When clicking on "Select a media" the user gets to choose easily from the media he has access to:

![Use 3](../assets/use3.png)

That's it, content is now integrated in the Moodle course:

* Professor view

![Professor view](../assets/professor-view.jpg)

* Student view

![Student view](../assets/student-view.jpg)


About rights management
-----------------------

The permissions on embedded media are customizable in MediaServer in the LTI settings page. By default, the `student` role has the permission to access media and the `teacher` role has the permission to access and edit media.

The media selection shows media for which the user is set as the speaker.


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
----------------------------------------

This is highly inspired from the way `moodle` does it in the external tool.

We integrate an `iframe` in our course, which points to the `launch.php` file of the plugin.

That page is returning a "self submitting" `form` (transforming therefore a `GET` request into a `POST`) towards the MediaServer LTI url of the Media (ex: `https://yourname.ubicast.tv/lti/v125acedf1dfedeojhk0/`) with all the needed parameters (`oauth`, `roles`, etc...).

This allows MediaServer to know the identity of the moodle user, and give the corresponding access on the media (`student`, `teacher`, etc...).
