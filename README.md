UbiCast MediaServer Moodle activity plugin
==========================================

Copyright: UbiCast (https://www.ubicast.eu)
License: https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later


Description:
------------

This Moodle activity module allows users to add media or channels from a UbiCast MediaServer in their courses.

This Moodle plugin is required for other UbiCast plugins (Atto button and Block plugin).


Dependencies:
-------------

* `Moodle` >= *3.0* with `mod_lti` (`external tool`).
* A UbiCast MediaServer web site (version >= *8.1*). Visit https://www.ubicast.eu/en/solutions/delivery/ to ask for a trial.
* Cookies must be allowed for the MediaServer web site (see note below).


Important note about cookies:
-----------------------------

In order to make the LTI authentication work, MediaServer needs cookies usage.
If your MediaServer is using a domain totally different from your Moodle domain, cookies will probably get blocked by browsers because they will be classified as third party cookies.
To avoid MediaServer cookies to be considered as third party cookies, we recommend to use a sub domain for MediaServer using the same top domain as the Moodle site (for example, if your Moodle uses `moodle.yourdomain.com` as domain, you can use `mediaserver.yourdomain.com` as MediaServer domain).
It is also possible to allow third party cookies usage in the browser settings.


Installation:
-------------

If you have installed this plugin when it was called "mod_easycastms", please follow this procedure to keep your data:
[rename the module to mod_ubicast](how%20to%20rename%20plugin.md)

Follow [the standard moodle procedure](https://docs.moodle.org/30/en/Installing_plugins) to install the module. You can install it from [the official Moodle plugins repository](https://moodle.org/plugins/view.php?plugin=mod_ubicast) or using this git repository.

To use the git repository, clone it in your mod dir:

```bash
cd "moodle/mod"
git clone "https://github.com/UbiCastTeam/moodle-mod_ubicast" ubicast
```

Once installed, go to the plugin settings in Moodle (usually, Plugins > Activity modules > UbiCast MediaServer plugin):

![Plugin settings location](../assets/plugin-location.png?_=1)

Set the MediaServer URL, LTI key and LTI secret to use in the plugin settings:

![Plugin settings](../assets/plugin-settings.png?_=1)

You can find these in the Mediaserver LTI settings (in the authentication settings section):

![LTI Settings](../assets/lti-settings.png?_=1)


Usage:
------

Once configured, a new activity type is now available in Moodle:

![Add menu](../assets/add-menu.png?_=1)

This allows the user to import media he has access to in MediaServer:

![Add item](../assets/add-item.png?_=1)

When clicking on "Select a media" the user gets to choose easily from the media he has access to:

![Select media](../assets/select-media.png?_=1)

That's it, content is now integrated in the Moodle course:

* Professor view

![Professor view](../assets/professor-view.jpg?_=1)

* Student view

![Student view](../assets/student-view.jpg?_=1)


About rights management
-----------------------

The permissions on embedded media are customizable in MediaServer in the LTI settings page. By default, the `student` role has the permission to access media and the `teacher` role has the permission to access and edit media.

The media selection shows media for which the user is set as the speaker.


Development environment
-----------------------

Clone the following repositories in a folder:

* https://github.com/moodlehq/moodle-docker
* https://github.com/UbiCastTeam/moodle-mod_ubicast
* Get latest version of the moodle source code at: https://download.moodle.org/ or clone https://github.com/moodle/moodle

Then follow the steps given into `moodle-docker`'s readme.

After that, follow the steps above for installation.

In moodle, the plugin will be copied to `mod/ubicast`, so to work on it, you can do it right away in there.


How does the LTI Video integration work?
----------------------------------------

This is highly inspired from the way `moodle` does it in the external tool.

We integrate an `iframe` in our course, which points to the `launch.php` file of the plugin.

That page is returning a "self submitting" `form` (transforming therefore a `GET` request into a `POST`) towards the MediaServer LTI url of the Media (ex: `https://yourname.ubicast.tv/lti/v125acedf1dfedeojhk0/`) with all the needed parameters (`oauth`, `roles`, etc...).

This allows MediaServer to know the identity of the moodle user, and give the corresponding access on the media (`student`, `teacher`, etc...).
