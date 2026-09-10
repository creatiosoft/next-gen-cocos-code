import { MGR_AGORA } from "./AgoraManager";

const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class AgoraVideoRender extends cc.Component {
    @property({ type: cc.Sprite })
    sprite: cc.Sprite = null;

    uid:number = 0;
    channel: string = "";
    agoraCreatorInst:any = null;
    texture:any = null;

    isVideoOn = false;
    isVideoMuted = false;

    start() {

    }

    setup(uid, channel) {
        this.uid = (uid + '');
        this.channel = channel;
    }

    onUserOffline(event) {
        console.log("agora onUserOffline", event, this.uid);
        if (Number(this.uid) == Number(event)) {
            this.sprite.node.active = false;

            console.log("$$$AgoraVideoRender onUserOffline");
        }
    },

    onVideoOff(event, channel) {
        // console.trace("agora onVideoOff");
        console.log("agora onVideoOff", event, this.uid);
        if (Number(this.uid) == Number(event) && this.channel == channel) {
            this.isVideoOn = false;
            this.sprite.node.active = false;
            console.log("$$$AgoraVideoRender onVideoOff");
        }
    },

    onLogin(event, channel) {
        console.log("agora onLogin", event);
        console.log("agora onLogin", channel);
        // console.log(this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.__muteStateBackToLobby == true);
        if (this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData &&
            this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.__muteStateBackToLobby == true) {
            return;
        }
        if (Number(this.uid) == Number(event) && this.channel == channel) {
            if (!this.sprite.spriteFrame) {
                this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
            }
            this.isVideoOn = true;
            this.sprite.node.active = true;
        }
    },

    onLogout(event, channel) {
        console.log("onLogout", event);
        console.log("onLogout", channel);
        if (this.channel == channel) {
            this.isVideoOn = false;
            this.sprite.node.active = false;
            console.log("$$$AgoraVideoRender onLogout");
        }
    },

    onVideoOn(event, channel) {
        console.log("agora onVideoOn", event, channel, this.uid);
        if (this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData &&
            this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.__muteStateBackToLobby == true) {
            console.log("agora onVideoOn __muteStateBackToLobby true ???????");
            console.log("agora onVideoOn ???2", this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.__muteStateBackToLobby);
            console.log("agora onVideoOn ???3", this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.playerName);
            console.log("agora onVideoOn ???3", this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.playerId);
            return;
        }

        if (Number(this.uid) == Number(event) && this.channel == channel) {
            if (!this.sprite.spriteFrame) {
                this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
            }
            this.isVideoOn = true;
            this.sprite.node.active = true;
        }
    },

    onUserVideoOn(event, channel) {
        console.log("agora onUserVideoOn", event, channel, this.uid);
        if (this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData &&
            this.node.parent.parent.parent.parent.parent.getComponent("PlayerPresenter").playerData.__muteStateBackToLobby == true) {
            return;
        }
        if (Number(this.uid) == Number(event) && this.channel == channel) {
            if (!this.sprite.spriteFrame) {
                this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
            }
            this.isVideoOn = true;
            this.sprite.node.active = true;
        }
    },
    
    onUserVideoOff(event, channel) {
        console.log("agora onUserVideoOff", event, channel, this.uid);
        if (Number(this.uid) == Number(event) && this.channel == channel) {
            this.isVideoOn = false;
            this.sprite.spriteFrame = null;
            this.sprite.node.active = false;

            console.log("$$$AgoraVideoRender onUserVideoOff");
        }
    },

    onLoad() {

        cc.systemEvent.on("doLogin", this.onLogin.bind(this));
        cc.systemEvent.on("doLogout", this.onLogout.bind(this));
        cc.systemEvent.on("remote-render", this.onRemoteRender.bind(this));
        cc.systemEvent.on("onUserOffline", this.onUserOffline.bind(this));
        cc.systemEvent.on("onVideoOn", this.onVideoOn.bind(this));
        cc.systemEvent.on("onVideoOff", this.onVideoOff.bind(this));
        cc.systemEvent.on("onUserVideoOn", this.onUserVideoOn.bind(this));
        cc.systemEvent.on("onUserVideoOff", this.onUserVideoOff.bind(this));

        if (!cc.sys.isNative) {
            this.agoraCreatorInst = MGR_AGORA;
        }
        else {
            // @ts-ignore
            this.agoraCreatorInst = new agoraCreator();
        }

        this.sprite.spriteFrame = null;
        this.texture = new cc.Texture2D();
        this.texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.node.width, this.node.height);
    }

    clear() {

        console.log("agora clear", this.uid);

        if (this.agoraCreatorInst && this.agoraCreatorInst.unbindTextureId && this.uid != 0) {
            this.agoraCreatorInst.unbindTextureId(this.texture.getImpl().getHandle(), Number(this.uid));
        }

        this.isVideoOn = false;
        this.isVideoMuted = false;
        this.uid = 0;
        // this.sprite.spriteFrame = null;

        // let texture = new cc.Texture2D();
        // texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.node.width, this.node.height);
        // this.sprite.spriteFrame = new cc.SpriteFrame(texture);

        this.sprite.node.active = false;
    }

    onRenderVideo(event) {
        this.texture.initWithElement(event.img);
        this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
    }

    onRemoteRender(event) {
        if (Number(event.uid) == Number(this.uid)) {
            this.texture.initWithElement(event.img);
            this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
        }
    },

    _updateSize() {
        this.texture.width = this.node.width;
        this.texture.height = this.node.height;
    }

    onEnable() {
        this.node.on('size-changed', this._updateSize, this)
    }

    onDisable() {
        this.node.off('size-changed', this._updateSize, this)
    }

    onDestroy() {
    }

    update(dt) {
        if (!cc.sys.isNative) {

        }
        else {
            if (this.agoraCreatorInst && 
                this.agoraCreatorInst.bindTextureId && 
                this.uid != 0 &&
                this.isVideoOn) {
                this.sprite.node.active = true;
                this.agoraCreatorInst.bindTextureId(this.texture.getImpl().getHandle(), Number(this.uid));
            }
        }
    }

    getRender() {
        return this.sprite;
    }
}