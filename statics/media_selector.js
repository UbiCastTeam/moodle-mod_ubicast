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
    if (!options.mediaserverURL) {
        throw new Error('mediaserverURL argument is mandatory.');
    }
    if (!options.target) {
        throw new Error('target argument is mandatory.');
    }
    this.moodleURL = options.moodleURL;
    // The moodleURL param must be something like '/mod/ubicast/lti.php?id=1'.
    this.mediaserverURL = options.mediaserverURL;
    if (this.mediaserverURL[this.mediaserverURL.length - 1] == '/') {
        this.mediaserverURL = this.mediaserverURL.slice(0, -1);
    }
    this.filterBySpeaker = options.filterBySpeaker ? true : false;
    this.target = options.target;

    if (document.readyState === 'loading') {
        // The loading hasn't finished yet.
        var obj = this;
        document.addEventListener('DOMContentLoaded', function() {
            obj.init();
        });
    } else {
        // The `DOMContentLoaded` event has already fired.
        this.init();
    }
};

window.MediaSelector.prototype.init = function() {
    var input = document.querySelector('#' + this.target + ' #id_mediaid');
    var initialOID = input.value;
    this.onPick(initialOID, true);

    var obj = this;
    window.addEventListener('message', function(event) {
        if (event.origin !== obj.mediaserverURL) {
            return;
        }
        var data = event.data ? event.data : null;
        if (data.state && data.state == 'IDLE' || data.target !== obj.target) {
            return;
        }
        if (!data.item || !data.item.oid) {
            throw new Error('No oid in message from MediaServer page.');
        }
        obj.onPick(data.item.oid, data.initial_pick);
    }, false);
};

window.MediaSelector.prototype.onPick = function(oid) {
    var input = document.querySelector('#' + this.target + ' #id_mediaid');
    input.value = oid;
    var nextUrl = '/manager/?popup' + (this.filterBySpeaker ? '' : '&all');
    nextUrl += '&return=postMessageAPI:' + this.target + (oid ? '&initial=' + oid : '');
    var url = this.moodleURL + '&next=' + window.encodeURIComponent(nextUrl);
    var iframe = document.querySelector('#' + this.target + ' .ubicast-iframe');
    iframe.src = url;
    iframe.style.height = (oid ? 430 : 230) + 'px';
};
