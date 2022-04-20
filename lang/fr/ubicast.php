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
 * Strings for component 'ubicast', language 'fr'
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['language_code'] = 'fr';

// Moodle required strings.
$string['modulename'] = 'Ressource Nudgis';
$string['modulename_help'] = 'Le module UbiCast Nudgis permet aux professeurs d\'ajouter des chaînes et des médias issus d\'une web TV Nudgis en tant que ressources d\'un cours.';
$string['modulename_link'] = 'mod/ubicast/view';
$string['modulenameplural'] = 'Ressources Nudgis';
$string['pluginadministration'] = 'Administration du module UbiCast Nudgis';
$string['pluginname'] = 'Connecteur UbiCast Nudgis';
$string['privacy:metadata'] = 'Le module UbiCast Nudgis ne stocke que des liens vers les médias de Nudgis.';
$string['ubicast:addinstance'] = 'Ajouter une ressource Nudgis';
$string['ubicast:view'] = 'Voir la ressource Nudgis';

// Forms strings.
$string['form_resource_header'] = 'Ressource';
$string['form_resource'] = 'ID de la ressource';
$string['form_resource_help'] = 'Sélectionnez une ressource. Vous pouvez aussi copier-coller un ID de ressource (exemple: "v124cbdfb0e5c9e28a30").';

// Settings page strings.
$string['settings_url'] = 'URL du portail Nudgis';
$string['settings_url_help'] = 'Entrez l\'URL du portail Nudgis. Par exemple: "https://nudgis.ubicast.tv".';
$string['settings_ltikey'] = 'Clé LTI du portail Nudgis';
$string['settings_ltikey_help'] = 'Entrez la clé LTI du portail Nudgis. Une clé valide ressemble à "xmz9GgcutbUvwDFNBzHMryMmzyX7wy".';
$string['settings_ltisecret'] = 'Secret LTI du portail Nudgis';
$string['settings_ltisecret_help'] = 'Entrez le secret LTI du portail Nudgis. Un secret valide ressemble à  "4fCQKsxQwFSxCCvdd4Dq9cxNbhZK4afPBpY312wq1mASGkAgC9qy8n9QEPq8".';
$string['settings_speakerfilter'] = 'Afficher uniquement les médias de l\'utilisateur dans la sélection';
$string['settings_speakerfilter_help'] = 'Lors de la sélection d\'un média, n\'afficher que les médias pour lesquels l\'utilisateur est l\'intervenant. Ce paramètre est ignoré si Nudgis est dans une version inférieure ou égale à 8.3.0.';
