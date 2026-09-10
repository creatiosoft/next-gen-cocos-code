import { MGR_AGORA } from "./AgoraManager";

const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class CustomVideoRender extends cc.Component {
    @property({ type: cc.Sprite })
    sprite: cc.Sprite = null;

    uid:number = 99999;
    agoraCreatorInst:any = null;
    texture:any = null;

    start() {

    }

    setup(uid) {
        // this.uid = (uid + '');
    }

    onLoad() {
        cc.systemEvent.on("onVideoPlaybackStart", this.onVideoPlaybackStart.bind(this));
        cc.systemEvent.on("onVideoPlaybackEnd", this.onVideoPlaybackEnd.bind(this));

        if (!cc.sys.isNative) {
            this.agoraCreatorInst = MGR_AGORA;
        }
        else {
            // @ts-ignore
            this.agoraCreatorInst = new agoraCreator();
        }

        this.texture = new cc.Texture2D();
        this.texture.initWithData(null, cc.Texture2D.PixelFormat.RGBA8888, this.node.width, this.node.height);
    }

    onVideoPlaybackStart(event) {
        this.sprite.spriteFrame = new cc.SpriteFrame(this.texture);
    },

    onVideoPlaybackEnd(event) {
        console.log("onVideoPlaybackEnd2");
        this.sprite.spriteFrame = null;
    },

    clear() {

        // if (this.agoraCreatorInst && this.agoraCreatorInst.unbindTextureId && this.uid != 0) {
        //     this.agoraCreatorInst.unbindTextureId(this.texture.getImpl().getHandle(), Number(this.uid));
        // }

        // this.uid = 0;
        // this.sprite.node.active = false;
    }

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
                this.uid != 0) {
                this.sprite.node.active = true;
                // console.log("CustomVideoPlaybackRender", 99999);
                this.agoraCreatorInst.bindTextureId(this.texture.getImpl().getHandle(), 99999);
            }
        }
    }

    getRender() {
        return this.sprite;
    }
}