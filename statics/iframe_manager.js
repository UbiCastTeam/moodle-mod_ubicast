/**
 * Tiny script to manage iframe height
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var onResize = function() {
    var height = window.innerHeight * 0.75;
    if (height < 300) {
        height = 300;
    }
    var iframes = document.getElementsByClassName('nudgis-iframe');
    for (var i = 0; i < iframes.length; i++) {
        iframes[i].style.height = height + 'px';
    }
};
window.addEventListener('resize', onResize);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onResize);
} else {
    onResize();
}
