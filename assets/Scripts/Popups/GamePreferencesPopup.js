var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
var CheckBoxType = require('Checkbox');
var GameScreen = require('GameScreen');
var JoinSimilar = require('PostTypes').JoinSimilar;
var Toggle = require('Toggle');
var AvatarSelection = require('AvatarSelection');
var LoginHandler = require('LoginHandler');

/**
 * @classdesc Manages gamepreferences popUp
 * @class GamePreferencesPopup
 * @memberof Popups
 */
cc.Class({
    extends: cc.Component,

    properties: {
        playerName: {
            default: null,
            type: cc.Label,
        },
        playerId: {
            default: null,
            type: cc.Label,
        },
        selectAvatar: {
            default: null,
            type: cc.Node,
        },
        // 
        balance: {
            default: null,
            type: cc.Label,
        },
        chips: {
            default: null,
            type: cc.Label,
        },
        version: {
            default: null,
            type: cc.Label,
        },
        pokerVersionString: {
            default: null,
            type: cc.RichText,
        },
        gameVersionString: {
            default: null,
            type: cc.RichText,
        },
        playerImg: {
            default: null,
            type: cc.Sprite
        },
        selectedAvatarPreview: {
            default: null,
            type: cc.Sprite
        },
        avatarScrollViewRef: {
            default: null,
            type: cc.Node,
        },
        avatarGridParent: {
            default: null,
            type: cc.Node,
        },
        noDataNode: {
            default: null,
            type: cc.Node,
        },
        avatars: {
            default: [],
            type: AvatarSelection,
        },
        selectedAvatarID: 0,
        profileAvatar: {
            default: null,
            type: cc.Sprite
        },
        profileNode: {
            default: null,
            type: cc.Node,
        },
        profileName: {
            default: null,
            type: cc.Label,
        },
        userEmail: {
            default: null,
            type: cc.Label,
        },
    },

    /**
     * @description For initialization.
     * @method onLoad
     * @memberof Popups.GamePreferencesPopup#
     */
    onLoad: function () {
        this.loadAvatars();
        GameManager.on("SelectedAvatar", this.onSelectAvatar.bind(this));
        GameManager.on("REALCHIPSUPDATE", this.onRealChipsUpdated.bind(this));
        this.avatars.forEach(function (element) {
            element.unSelectAvatar();
        }, this);
    },

    /**
     * @description Manage default states of buttons in popup.
     * @method onShow
     * @param{Object} data
     * @memberof Popups.GamePreferencesPopup#   
     */

    onEnable: function () {

        this.version.string = "Version: v" + K.ServerAddress.clientVer;
        this.playerImg.spriteFrame = GameManager.user.urlImg;

        this.balance.string = Number((GameManager.user.category == "GOLD" ? GameManager.user.freeChips : GameManager.user.realChips).toFixed(2));
        this.balance.string = GameManager.convertChips(this.balance.string);
        this.playerName.string = GameManager.user.userName;
        this.playerId.string = "Player ID: " + GameManager.user.playerId;
        this.profileName.string = GameManager.user.userName;

        if (!GameManager.isMobile) {
            this.playerId.string = GameManager.user.playerId;
        }

        this.avatars.forEach(function (avatar) {
            avatar.unSelectAvatar();
        });

        this.selectedAvatarID = -1;
        var imageIndex = parseInt(GameManager.user.profileImage);
        if (imageIndex >= 0) {
            this.selectedAvatarID = imageIndex;
            this.avatars[imageIndex].selection.active = true;
        }
        if (this.selectedAvatarPreview) {
            this.selectedAvatarPreview.spriteFrame = GameManager.user.urlImg;
        }

            this.profileAvatar.spriteFrame = GameManager.user.urlImg;
            this.userEmail.string = GameManager.user.emailId;
    },

    onSelectAvatar: function (avatarId) {

        this.avatars.forEach(function (avatar) {
            avatar.unSelectAvatar();
        });

        this.avatars[avatarId].showSelection();
        this.selectedAvatarID = avatarId;
        if (this.selectedAvatarPreview) {
            this.selectedAvatarPreview.spriteFrame = GameManager.avatarImages[avatarId];
        }
    },

    /**
     * @description Leave current table
     * @method onLeave
     * @memberof Popups.GamePreferencesPopup#
     */
    onLeave: function () {
        this.gameScreen.leaveCurrent();
        this.node.active = false;
    },


    /**
     * @description Displays the popup for logout
     * @method onLogOut
     * @memberof Popups.GamePreferencesPopup#
     */
    onLogOut: function () {
        // this.coloredCardToggle.onToggle();
        // this.dealerChat.onToggle();
        GameManager.popUpManager.show(PopUpType.OnLogOutPopup, null, function () { });
        GameManager.playSound(K.Sounds.click);
    },

    onRemove: function () {
        GameManager.popUpManager.show(PopUpType.RemoveDataDialog, {
            callback: function () {
                ServerCom.pomeloRequest("connector.entryHandler.disablePlayer", {
                    playerId: GameManager.user.playerId,
                    isLoggedIn: true,
                    access_token: K.Token.access_token
                }, (response) => {
                    console.log(response);
                    if (response.success) {
                        var param = {
                            code: 3333,
                            errorType: 3333,
                            response: response.message
                        };
                        GameManager.popUpManager.show(PopUpType.DisconnectDialog, param, function () { });
                    }

                }, null, 5000, false);
            }
        }, function () { });
    },

    /**
     * @description Cancel button callback
     * @method onSettingsClose
     * @memberof Popups.GamePreferencesPopup#
     */
    onSettingsClose: function () {
        this.selectAvatar.active = false;
        
        GameManager.playSound(K.Sounds.click);
        if (GameManager.isCashgameMaintenance) {
            let cashgame = cc.find("Canvas").getChildByName("LobbyHandlerNew").getChildByName("Center").getChildByName("cashTable");
            if (cashgame && cashgame.active) {
                GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                    message: GameManager.cashgameMaintenanceMsg || "Cash game services are currently under maintenance.",
                    action: "cashgameMaintenance",
                    sticky: true
                }, function () { });
            }
        }
        if (GameManager.isTournamentMaintenance) {
            let tourlist = cc.find("Canvas").getChildByName("LobbyHandlerNew").getChildByName("Center").getChildByName("TournamentLobbyList");
            if (tourlist && tourlist.active) {
                GameManager.popUpManager.show(PopUpType.MaintenancePopup, {
                    message: GameManager.tournamentMaintenanceMsg || "Tournament services are currently under maintenance.",
                    action: "tournamentMaintenance",
                    sticky: true
                }, function () { });
            }
        }

        this.node.active = false;
    },

    loadAvatars: function () {
        console.log('avatarPool', GameManager.avatarPool);
        console.log('avatarImages', GameManager.avatarImages);

        for (var key in GameManager.avatarPool) {
            let avatar = GameManager.avatarPool[key];
            avatar.scale = 1.55;
            this.avatarGridParent.addChild(avatar);
            GameManager.avatarPool[key].active = true;
            GameManager.avatarPool[key].getComponent("AvatarSelection").AvatarPopUp = this;
            this.avatars[key] = GameManager.avatarPool[key].getComponent("AvatarSelection");
            //this.avatars[i].on("SelectedAvatar", this.onSelectAvatar.bind(this));\
        }
    },

    updateAvatar: function (avatarId) {
        //------------------------------uncomment for api call---------------------------------//
        var profileData = {
            query: {
                playerId: "hsdfhd"
            },
            updateKeys: {
                profileImage: "0",
            }
        };
        var data = profileData;
        data.query.playerId = GameManager.user.playerId;
        data.updateKeys.profileImage = this.selectedAvatarID;
        // console.log("[Avatar] updateAvatar: sending to server selectedAvatarID (1-indexed)=", this.selectedAvatarID, "playerId=", data.query.playerId);

        ServerCom.pomeloRequest(K.PomeloAPI.updateProfile, data, function (response) {
            // console.log("[Avatar] updateAvatar server response:", response);
            // When in a game table, server responds with {avtarImage, playerId, channelId} instead of {success: true}
            var updateSucceeded = response.success || (response.avtarImage !== undefined);
            if (updateSucceeded) {
                GameManager.user.profileImage = this.selectedAvatarID;
                GameManager.user.urlImg = GameManager.avatarImages[GameManager.user.profileImage];
                this.playerImg.spriteFrame = GameManager.user.urlImg;
                // console.log("[Avatar] updateAvatar success: set profileImage (0-indexed)=", GameManager.user.profileImage, "urlImg=", GameManager.user.urlImg);
                // GameManager.user.profileImage = this.selectedAvatarID;
                // GameManager.user.urlImg = GameManager.avatarImages[GameManager.user.profileImage - 1];
                // this.playerImg.spriteFrame = GameManager.user.urlImg;
                GameManager.emit("image-loaded", GameManager.user);
                // console.log("[Avatar] updateAvatar: emitted image-loaded with profileImage=", GameManager.user.profileImage);

                this.selectAvatar.active = false;
                if (this.noDataNode) {
                    this.noDataNode.active = true;
                }
                this.profileAvatar.spriteFrame = GameManager.user.urlImg;
                this.profileName.string = GameManager.user.userName;
            }
        }.bind(this), null, 5000, false, false);
    },

    onAvatars: function () {
        this.selectAvatar.active = true;

        this.avatars.forEach(function (element) {
            element.unSelectAvatar();
        }, this);
        this.selectedAvatarID = -1;
        var imageIndex = parseInt(GameManager.user.profileImage);
        // console.log("[Avatar] onAvatars open: GameManager.user.profileImage=", GameManager.user.profileImage, "imageIndex (0-indexed)=", imageIndex);
        if (imageIndex >= 0) {
            this.selectedAvatarID = imageIndex;
            this.avatars[imageIndex].selection.active = true;
        }
        if (this.selectedAvatarPreview) {
            this.selectedAvatarPreview.spriteFrame = GameManager.user.urlImg;
        }
        // console.log("[Avatar] onAvatars open: selectedAvatarID (1-indexed)=", this.selectedAvatarID);
        if (this.noDataNode) {
            this.noDataNode.active = false;
        }
    },

    onAvatarsBack: function () {
        this.selectAvatar.active = false;
        if (this.noDataNode) {
            this.noDataNode.active = true;
        }

        if (!GameManager.isMobile) {
            this.editProfileTab.active = false;
        }
        this.profileAvatar.spriteFrame = GameManager.user.urlImg;
        this.profileName.string = GameManager.user.userName;
    },

    onAvatarsSubmit: function () {
        this.updateAvatar(this.selectedAvatarID);

    },

    onRealChipsUpdated: function () {
        this.balance.string = this.balance2.string = this.balance3.string = Number((GameManager.user.category == "GOLD" ? GameManager.user.freeChips : GameManager.user.realChips).toFixed(2));
    },

    onDeleteAccount: function () {
        GameManager.popUpManager.show(PopUpType.AccountDeleteConfirm, null, function () { });
    },
    onContactUs: function () {
        //
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL("https://txpokeronline.com/");
        } else {
            // Web browser
            window.open("https://txpokeronline.com/", "_blank");
        }
    },
    onPricingClicked: function () {
        //
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL("https://txpokeronline.com/pricing.html");
        } else {
            // Web browser
            window.open("https://txpokeronline.com/pricing.html", "_blank");
        }
    },
    onRulesClicked: function () {
        //
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL("https://txpokeronline.com/rules.html");
        } else {
            // Web browser
            window.open("https://txpokeronline.com/rules.html", "_blank");
        }
    },
    onTermsClicked: function () {
        //
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL("https://txpokeronline.com/terms.html");
        } else {
            // Web browser
            window.open("https://txpokeronline.com/terms.html", "_blank");
        }
    },

    showProfile(){
        this.profileNode.active = true;
        this.profileAvatar.spriteFrame = GameManager.user.urlImg;
        this.profileName.string = GameManager.user.userName;
    },

    hideProfile(){
        this.profileNode.active = false;
    },
});