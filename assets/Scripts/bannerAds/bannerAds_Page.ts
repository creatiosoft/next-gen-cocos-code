const { ccclass, property } = cc._decorator;

@ccclass
export default class bannerAds_Page extends cc.Component {

    @property(cc.Sprite) banner: cc.Sprite = null;

    data: any = null;
    setBanner(data) {
        this.data = data;
        const url = globalThis.K.ServerAddress.assets_server_s + data.bannerImage;
        // console.log("[BannerPage] setBanner, url:", url, "sprite assigned:", !!this.banner, "node opacity:", this.banner ? this.banner.node.opacity : "n/a");
        // if (!this.banner) {
        //     console.warn("[BannerPage] setBanner aborted: 'banner' sprite property is not assigned");
        // }
        this.loadImageFromUrl(url, this.banner, (() => {
            // this.node.children[1].active = false;
        }));
        //bannerLink
    }

    loadImageFromUrl(url: string, sprite: cc.Sprite, cb) {
        if (!url || !sprite) {
            // console.warn("[BannerPage] loadImageFromUrl aborted, url:", url, "sprite:", sprite);
            return;
        }
        cc.loader.load(url + "", function (err, tex) {
            if (err) {
                cc.error("banner load failed:", err);
                return;
            }

            // console.log("[BannerPage] banner load success:", url);
            let spriteFrame = new cc.SpriteFrame(tex);
            sprite.spriteFrame = spriteFrame;
            cc.tween(sprite.node)
                .to(0.2, { opacity: 255 })
                .delay(0.01)
                .call(() => {
                    // console.log("[BannerPage] banner opacity restored:", url);
                    if (cb) {
                        cb()
                    }
                })
                .start();
        });

    }

    clickonBanner() {
        if (this.data.bannerLink == '') {
            return;
        }
        if (cc.sys.isNative) {
            // Android & iOS
            cc.sys.openURL(this.data.bannerLink);
        } else {
            // Web browser
            window.open(this.data.bannerLink, "_blank");
        }
    }
}
