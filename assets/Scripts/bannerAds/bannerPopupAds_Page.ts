const { ccclass, property } = cc._decorator;

@ccclass
export default class bannerPopupAds_Page extends cc.Component {

    @property(cc.Sprite) banner: cc.Sprite = null;

    data: any = null;
    setBanner(data) {
        this.data = data;
        this.loadImageFromUrl(globalThis.K.ServerAddress.assets_server_s + data.bannerImage, this.banner, (() => { 
            this.node.children[1].active = false;
        }));
        //bannerLink
    }

    loadImageFromUrl(url: string, sprite: cc.Sprite, cb) {
        if (!url || !sprite) return;
        cc.loader.load(url + "", function (err, tex) {
            if (err) {
                cc.error("banner load failed:", err);
                return;
            }

            let spriteFrame = new cc.SpriteFrame(tex);
            sprite.spriteFrame = spriteFrame;
            cc.tween(sprite.node)
                .to(0.2, { opacity: 255 })
                .delay(0.01)
                .call(() => {
                    if(cb){
                        cb()
                    }
                })
                .start();
        });

    }

    clickonBanner() {
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL(this.data.bannerLink);
        } else {
            // Web browser
            window.open(this.data.bannerLink, "_blank");
        }
    }
}
