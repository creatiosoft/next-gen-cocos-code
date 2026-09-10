var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        envPrefab: {
            default: null,
            type: cc.Node,
        },
        envScroll: {
            default: null,
            type: cc.Node,
        },
    },

    onLoad() {
        cc.systemEvent.on("onVideoOn", this.onVideoOn.bind(this));
        cc.systemEvent.on("onVideoOff", this.onVideoOff.bind(this));
    },

    onVideoOn(event, channel) {
        let uid = Number(event);
        let avatar = this.players[uid];
        if (avatar && Number(GameManager.user.playerId.substr(0, 5)) != uid) {
            let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);
            if (isRemoteSelfAudioMuted) {
                cc.find("layout/MicOn", avatar).active = false;
                cc.find("layout/MicOff", avatar).active = true;
            }
            else {
                cc.find("layout/MicOff", avatar).active = false;
                cc.find("layout/MicOn", avatar).active = true;
            }
        }
    },

    onVideoOff(event, channel) {
        let uid = Number(event);
        let avatar = this.players[uid];
        if (avatar && Number(GameManager.user.playerId.substr(0, 5)) != uid) {
            let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);
            if (isRemoteSelfAudioMuted) {
                cc.find("layout/MicOn", avatar).active = false;
                cc.find("layout/MicOff", avatar).active = true;
            }
            else {
                cc.find("layout/MicOff", avatar).active = false;
                cc.find("layout/MicOn", avatar).active = true;
            }
        }
    },

    onShow: function (data) {
        this.pokerPresenter = data.getComponent("PokerPresenter");
        this.pokerGame = this.pokerPresenter.model.getComponent('PokerModel');
        this.players = {};

        this.envScroll.removeAllChildren();
        if (this.pokerGame) {
            console.log(this.pokerGame.gameData.tableDetails.players);

            for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
                let player = this.pokerGame.gameData.tableDetails.players[i];

                var playerIndex = this.pokerGame.getPlayerById(player.playerId);
                if (playerIndex !== -1) {
                    const receiver = this.pokerPresenter.getPlayerByIdx(playerIndex);
                    console.log(receiver);
                }
                else {
                    continue;
                }

                var avatar = cc.instantiate(this.envPrefab);
                avatar.x = 0;
                avatar.y = 0;
                avatar.active = true;

                this.envScroll.addChild(avatar);

                let uid = Number(player.playerId.substr(0, 5));

                cc.find("avatar/mask/avatar", avatar).getComponent(cc.Sprite).spriteFrame = player.urlImg;
                cc.find("layout/name", avatar).getComponent(cc.Label).string = player.playerName;

                console.log("player.playerId", player.playerId);
                console.log("GameManager.user.playerId", GameManager.user.playerId);

                let isJoined = false;                
                if (player.playerId == GameManager.user.playerId) {
                    var isVideoCurrentlyEnabled = window.MGR_AGORA.isVideoCurrentlyEnabled(this.pokerPresenter.model.gameData.agoraChannelName);
                    console.log("isVideoCurrentlyEnabled1111111", isVideoCurrentlyEnabled);
                    
                    if (isVideoCurrentlyEnabled) {
                        cc.find("MicOn", avatar).active = false;
                        cc.find("MicOff", avatar).active = true;
                    }
                    else {
                        cc.find("MicOn", avatar).active = true;
                        cc.find("MicOff", avatar).active = false;   
                    }

                    console.log("isVideoCurrentlyEnabled222222");
                    isJoined = window.MGR_AGORA.isJoined();
                }
                else {
                    let isRemoteAudioMuted = window.MGR_AGORA.isRemoteVideoMuted(uid);
                    if (isRemoteAudioMuted) {
                        cc.find("MicOn", avatar).active = true;
                        cc.find("MicOff", avatar).active = false;
                    }
                    else {
                        cc.find("MicOn", avatar).active = false;
                        cc.find("MicOff", avatar).active = true;   
                    }

                    let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);
                    if (isRemoteSelfAudioMuted) {
                        cc.find("layout/MicOn", avatar).active = false;
                        cc.find("layout/MicOff", avatar).active = true;
                    }
                    else {
                        cc.find("layout/MicOff", avatar).active = false;
                        cc.find("layout/MicOn", avatar).active = true;
                    }

                    isJoined = window.MGR_AGORA.isRemoteJoined(uid);
                }

                this.players[uid] = avatar;

                cc.find("disable", avatar).active = !isJoined;

                cc.find("MicOn", avatar).getComponent(cc.Button).clickEvents[0].customEventData = player;
                cc.find("MicOff", avatar).getComponent(cc.Button).clickEvents[0].customEventData = player;
            }
        }

        if (this.envScroll.children.length == 0) {
            cc.find("Container/Center/node/Mute", this.node).active = false;
            cc.find("Container/Center/node/UnMute", this.node).active = false;
        }
        else {
            cc.find("Container/Center/node/Mute", this.node).active = true;
            cc.find("Container/Center/node/UnMute", this.node).active = true;
        }
    },

    onMicOn:function(event, customEventData) {
        console.log("onMicOn", customEventData.playerId);
        let uid = Number(customEventData.playerId.substr(0, 5));

        if (customEventData.playerId == GameManager.user.playerId ||
            Number(customEventData.playerId) == GameManager.user.playerId) {
            window.MGR_AGORA.muteLocalVideoStream(false);
            window.MGR_AGORA.muteLocalAudioStream(false);

            var playerPresenter = this.pokerPresenter.getMyPlayer();
            if (playerPresenter) {
                playerPresenter.__muteStateBackToLobby = false;
            }
            
            cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
        }
        else {
            window.MGR_AGORA.muteRemoteVideoStream(uid, false);
            window.MGR_AGORA.muteRemoteAudioStream(uid, false);

            var playerPresenter = this.pokerPresenter.getPlayer(Number(customEventData.playerId));
            if (playerPresenter) {
                playerPresenter.__muteStateBackToLobby = false;
            }

            let isRemoteSelfAudioMuted = window.MGR_AGORA.isRemoteSelfVideoMuted(uid);
            if (!isRemoteSelfAudioMuted) {
                cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }
        }

        cc.find("MicOn", event.target.parent).active = false;
        cc.find("MicOff", event.target.parent).active = true;
    },

    onMicOff:function(event, customEventData) {
        console.log("onMicOff", customEventData.playerId);

        let uid = Number(customEventData.playerId.substr(0, 5));

        if (customEventData.playerId == GameManager.user.playerId ||
            Number(customEventData.playerId) == GameManager.user.playerId) {
            window.MGR_AGORA.muteLocalVideoStream(true);
            window.MGR_AGORA.muteLocalAudioStream(true);
            
            var playerPresenter = this.pokerPresenter.getMyPlayer();
            if (playerPresenter) {
                playerPresenter.__muteStateBackToLobby = true;
            }

            cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
        }
        else {
            window.MGR_AGORA.muteRemoteVideoStream(uid, true);
            window.MGR_AGORA.muteRemoteAudioStream(uid, true);
            var playerPresenter = this.pokerPresenter.getPlayer(Number(customEventData.playerId));
            if (playerPresenter) {
                playerPresenter.__muteStateBackToLobby = true;
            }
            cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
        }

        cc.find("MicOn", event.target.parent).active = true;
        cc.find("MicOff", event.target.parent).active = false;
    },
    
    muteunmuteAll:function(event) {
        console.log("muteunmuteAll", event.isChecked);

        if (event.isChecked) {
            // mute all
            for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
                let player = this.pokerGame.gameData.tableDetails.players[i];
                var playerIndex = this.pokerGame.getPlayerById(player.playerId);
                if (playerIndex !== -1) {
                    const receiver = this.pokerPresenter.getPlayerByIdx(playerIndex);
                    console.log(receiver);
                }
                else {
                    continue;
                }

                let uid = Number(player.playerId.substr(0, 5));
                if (player.playerId == GameManager.user.playerId) {
                    window.MGR_AGORA.muteLocalVideoStream(true);
                    window.MGR_AGORA.muteLocalAudioStream(true);

                    var playerPresenter = this.pokerPresenter.getMyPlayer();
                    if (playerPresenter) {
                        playerPresenter.__muteStateBackToLobby = true;
                    }

                    cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                }
                else {
                    window.MGR_AGORA.muteRemoteVideoStream(uid, true);
                    window.MGR_AGORA.muteRemoteAudioStream(uid, true);
                    var playerPresenter = this.pokerPresenter.getPlayer(Number(player.playerId));
                    if (playerPresenter) {
                        playerPresenter.__muteStateBackToLobby = true;
                    }
                    cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
                }

                cc.find("MicOn", this.players[uid]).active = true;
                cc.find("MicOff", this.players[uid]).active = false;
            }
        }
        else {
            // unmute all
            for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
                let player = this.pokerGame.gameData.tableDetails.players[i];
                var playerIndex = this.pokerGame.getPlayerById(player.playerId);
                if (playerIndex !== -1) {
                    const receiver = this.pokerPresenter.getPlayerByIdx(playerIndex);
                    console.log(receiver);
                }
                else {
                    continue;
                }

                let uid = Number(player.playerId.substr(0, 5));
                if (player.playerId == GameManager.user.playerId) {
                    window.MGR_AGORA.muteLocalVideoStream(false);
                    window.MGR_AGORA.muteLocalAudioStream(false);

                    var playerPresenter = this.pokerPresenter.getMyPlayer();
                    if (playerPresenter) {
                        playerPresenter.__muteStateBackToLobby = false;
                    }
                }
                else {
                    window.MGR_AGORA.muteRemoteVideoStream(uid, false);
                    window.MGR_AGORA.muteRemoteAudioStream(uid, false);
                    var playerPresenter = this.pokerPresenter.getPlayer(Number(player.playerId));
                    if (playerPresenter) {
                        playerPresenter.__muteStateBackToLobby = false;
                    }
                }
                cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);

                cc.find("MicOn", this.players[uid]).active = false;
                cc.find("MicOff", this.players[uid]).active = true;
            }
        }
    },

    muteAll:function(event) {
        for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
            let player = this.pokerGame.gameData.tableDetails.players[i];
            var playerIndex = this.pokerGame.getPlayerById(player.playerId);
            if (playerIndex !== -1) {
                const receiver = this.pokerPresenter.getPlayerByIdx(playerIndex);
                console.log(receiver);
            }
            else {
                continue;
            }

            let uid = Number(player.playerId.substr(0, 5));
            if (player.playerId == GameManager.user.playerId) {
                window.MGR_AGORA.muteLocalVideoStream(true);
                window.MGR_AGORA.muteLocalAudioStream(true);

                var playerPresenter = this.pokerPresenter.getMyPlayer();
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = true;
                }

                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }
            else {
                window.MGR_AGORA.muteRemoteVideoStream(uid, true);
                window.MGR_AGORA.muteRemoteAudioStream(uid, true);

                var playerPresenter = this.pokerPresenter.getPlayer(Number(player.playerId));
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = true;
                }

                cc.systemEvent.emit("onVideoOff", uid, this.pokerPresenter.model.gameData.agoraChannelName);
            }

            cc.find("MicOn", this.players[uid]).active = true;
            cc.find("MicOff", this.players[uid]).active = false;
        }
    },

    unmuteAll:function(event) {
        for (var i = 0; i < this.pokerGame.gameData.tableDetails.players.length; i++) {
            let player = this.pokerGame.gameData.tableDetails.players[i];
            var playerIndex = this.pokerGame.getPlayerById(player.playerId);
            if (playerIndex !== -1) {
                const receiver = this.pokerPresenter.getPlayerByIdx(playerIndex);
                console.log(receiver);
            }
            else {
                continue;
            }

            let uid = Number(player.playerId.substr(0, 5));
            if (player.playerId == GameManager.user.playerId) {
                window.MGR_AGORA.muteLocalVideoStream(false);
                window.MGR_AGORA.muteLocalAudioStream(false);

                var playerPresenter = this.pokerPresenter.getMyPlayer();
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = false;
                }
            }
            else {
                window.MGR_AGORA.muteRemoteVideoStream(uid, false);
                window.MGR_AGORA.muteRemoteAudioStream(uid, false);

                var playerPresenter = this.pokerPresenter.getPlayer(Number(player.playerId));
                if (playerPresenter) {
                    playerPresenter.__muteStateBackToLobby = false;
                }
            }
            cc.systemEvent.emit("onVideoOn", uid, this.pokerPresenter.model.gameData.agoraChannelName);

            cc.find("MicOn", this.players[uid]).active = false;
            cc.find("MicOff", this.players[uid]).active = true;
        }
    },


    onClose: function () {
        this.closeSelf();
    },

});



