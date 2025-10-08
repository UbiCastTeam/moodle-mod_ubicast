/**
 * Script to manage iframe height.
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

function onResize() {
    let height = window.innerHeight * 0.75;
    if (height < 300) {
        height = 300;
    }
    for (const iframe of document.getElementsByClassName('nudgis-iframe')) {
        iframe.style.height = height + 'px';
    }
}
window.addEventListener('resize', onResize);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onResize);
} else {
    onResize();
}
