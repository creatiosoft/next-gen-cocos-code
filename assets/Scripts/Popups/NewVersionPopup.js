var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

/**
 * @classdesc
 * @class OnLogOutPopup
 * @memberof Popups
 */
cc.Class({
    extends: PopUpBase,

    properties: {
        downloadAPKProgressLabel: {
            default: null,
            type: cc.Label,
        },

        downloadAPKProgress: {
            default: null,
            type: cc.ProgressBar,
        },

        downloadAPKNode: {
            default: null,
            type: cc.Node,
        },

    },

    // use this for initialization
    onLoad: function() {

    },

    onShow: function() {
        this.downloadAPKNode.active = false;
        this.downloadAPKProgressLabel.string = '';
    },

    /**
     * @description Called when enter button is clicked
     * @method onOkBtn
     * @memberof Popups.OnLogOutPopup#
     */
    onOkBtn: function() {

        if (cc.sys.isNative) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                cc.sys.openURL(K.iosBuildUrl);
            } else {
                this.downloadAPKProgress.progress = 0;
                this.downloadAPKNode.active = true;
                this.downloadAPKProgressLabel.string = 'Downloading: 0%';
                GameManager.updateAPK();
            }
        } else {
            window.location.reload();
        }
    },
    onCloseBtnClicked: function() {
        if (cc.sys.isBrowser) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.close();
            }
        } else {
            cc.game.end();
        }
    },
    onUpdateProgress: function(progress) {
        this.downloadAPKProgressLabel.string = `Downloading: ${progress}%`;

        this.downloadAPKProgress.progress = progress / 100;

        if (progress >= 100) {
            this.downloadAPKProgressLabel.string = `Kindly install the latest version.`;
        }
    }
});