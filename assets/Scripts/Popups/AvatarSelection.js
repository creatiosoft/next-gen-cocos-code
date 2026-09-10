var emitter = require('EventEmitter');
/**
 * @classdesc Manages the selection of avatar in avatar popup
 * @class AvatarSelection
 * @memberof Popups
 * @extends EventEmitter
 */

cc.Class({
    extends: emitter,

    properties: {
        selection: {
            default: null,
            type: cc.Node,
        },
        // AvatarPopUp: {
        //     default: null,
        //     type: AvatarPopupType,
        // },
        avatarImg: {
            default: null,
            type: cc.Sprite,
        },

        id: null,
    },

    /**
     * @description This is used for initialisation
     * @method onLoad
     * @memberof Popups.AvatarSelection#
     */
    onLoad: function () {
        //this.id = this.node.name.split('_')[1];
    },

    /**
     * @description This is called when a avatar is being selected
     * @method selectAvatar
     * @memberof Popups.AvatarSelection#
     */
    selectAvatar: function () {
        // if (AvatarPopup.soundValue == null || AvatarPopup.soundValue == false) {
        //     GameManager.playSound(K.Sounds.click);
        // }
        this.showSelection();
        //this.AvatarPopUp.onSelectAvatar(this.id);
        GameManager.emit("SelectedAvatar", this.id);

    },

    /**
     * @description This is used for highlighting selected avatar
     * @method showSelection
     * @memberof Popups.AvatarSelection#
     */
    showSelection: function () {
        this.selection.active = true;
    },

    /**
     * @description 
     * @method setAvatarImg
     * @param {Object} spriteFrame
     * @memberof Popups.AvatarSelection#
     */
    setAvatarImg: function (spriteFrame, id) {
        this.avatarImg.spriteFrame = spriteFrame;
        this.id = id;
    },


    /**
     * @description This is used for unselecting the highlighted avatar
     * @method unSelectAvatar
     * @memberof Popups.AvatarSelection#
     */
    unSelectAvatar: function () {
        this.selection.active = false;
    },
});
