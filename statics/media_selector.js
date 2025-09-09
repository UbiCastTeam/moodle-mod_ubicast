/**
 * Media selector script
 *
 * @package    mod_ubicast
 * @copyright  2013 UbiCast {@link https://www.ubicast.eu}
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

window.MediaSelector = function(options) {
    if (!options) {
        options = {};
    }
    if (!options.moodleURL) {
        throw new Error('moodleURL argument is mandatory.');
    }
    if (!options.nudgisURL) {
        throw new Error('nudgisURL argument is mandatory.');
    }
    if (!options.target) {
        throw new Error('target argument is mandatory.');
    }
    this.moodleURL = options.moodleURL;
    // The moodleURL param must be something like '/mod/ubicast/lti.php?id=1'.
    this.nudgisURL = options.nudgisURL;
    if (this.nudgisURL[this.nudgisURL.length - 1] == '/') {
        this.nudgisURL = this.nudgisURL.slice(0, -1);
    }
    this.filterBySpeaker = options.filterBySpeaker ? true : false;
    this.target = CSS.escape(options.target);
    this.targetSafe = this.target.replace(/[^A-Za-z0-9_-]/g, '');

    if (document.readyState === 'loading') {
        // The loading hasn't finished yet.
        document.addEventListener('DOMContentLoaded', this.init.bind(this));
    } else {
        // The `DOMContentLoaded` event has already fired.
        this.init();
    }
};

window.MediaSelector.prototype.init = function() {
    const input = document.querySelector('#' + this.target + ' input[name=mediaid]');
    this.onPick(input.value, null);

    window.addEventListener('message', (event) => {
        if (event.origin !== this.nudgisURL) {
            return;
        }
        const data = event.data ? event.data : null;
        if (data.state && data.state == 'IDLE' || data.target !== this.targetSafe) {
            return;
        }
        if (!data.item || !data.item.oid) {
            throw new Error('No oid in message from Nudgis page.');
        }
        this.onPick(data.item.oid, data.item.thumb);
    }, false);
};

window.MediaSelector.prototype.onPick = function(oid, thumbURL) {
    const input = document.querySelector('#' + this.target + ' input[name=mediaid]');
    input.value = oid;
    const inputThumb = document.querySelector('#' + this.target + ' input[name=mediaimg]');
    if (inputThumb) {
        inputThumb.value = thumbURL ? thumbURL : '/static/mediaserver/images/video.svg';
    }
    const nextUrl = '/manager/?popup' + (this.filterBySpeaker ? '' : '&all') +
        '&return=postMessageAPI:' + this.targetSafe + (oid ? '&initial=' + oid : '');
    const iframe = document.querySelector('#' + this.target + ' .ubicast-iframe');
    iframe.src = this.moodleURL + '&next=' + window.encodeURIComponent(nextUrl);
    iframe.style.height = (oid ? 560 : 350) + 'px';
};
