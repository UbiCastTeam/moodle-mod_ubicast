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
 * Strings for component 'ubicast', language 'en'
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['language_code'] = 'en';

// Moodle required strings.
$string['modulename'] = 'Nudgis resource';
$string['modulename_help'] = 'The UbiCast Nudgis module enables a teacher to provide a channel or a media from a Nudgis web TV as a course resource.';
$string['modulename_link'] = 'mod/ubicast/view';
$string['modulenameplural'] = 'Nudgis resource';
$string['pluginadministration'] = 'UbiCast Nudgis module administration';
$string['pluginname'] = 'UbiCast Nudgis plugin';
$string['privacy:metadata'] = 'The UbiCast Nudgis module only stores links to media from Nudgis.';
$string['ubicast:addinstance'] = 'Add a new Nudgis resource';
$string['ubicast:view'] = 'View Nudgis resource';

// Forms strings.
$string['form_resource_header'] = 'Resource';
$string['form_resource'] = 'Resource ID';
$string['form_resource_help'] = 'Select resource from Nudgis. You can also copy-paste a resource ID manually (example: "v124cbdfb0e5c9e28a30").';

// Settings page strings.
$string['settings_url'] = 'Nudgis base URL';
$string['settings_url_help'] = 'Enter the Nudgis base URL. Example: "https://nudgis.ubicast.tv".';
$string['settings_ltikey'] = 'Nudgis LTI key';
$string['settings_ltikey_help'] = 'Enter the Nudgis LTI key. An LTI key looks like "xmz9GgcutbUvwDFNBzHMryMmzyX7wy".';
$string['settings_ltisecret'] = 'Nudgis LTI secret';
$string['settings_ltisecret_help'] = 'Enter the Nudgis LTI secret. An LTI secret looks like "4fCQKsxQwFSxCCvdd4Dq9cxNbhZK4afPBpY312wq1mASGkAgC9qy8n9QEPq8".';
$string['settings_speakerfilter'] = 'Show only user\'s media in selection';
$string['settings_speakerfilter_help'] = 'When selecting a media to embed, show only media for which the user is set as the speaker. This setting is ignored if Nudgis is using a version below or equal 8.3.0.';
