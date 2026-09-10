var PopUpManager = require('PopUpManager').PopUpManager;
var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');

cc.Class({
    extends: PopUpBase,

    properties: {
        customVideoRender: {
            default: null,
            type: cc.Node,
        },
    },


    onShow: function(data) {
        this.customVideoRender.getComponent("CustomVideoRender");

        this.videoStatus = 0;
        this.audioStatus = 0;

        if (K.AgoraEnabled) {
            cc.systemEvent.on("requestVideoPermission", this.onRequestVideoPermission.bind(this));
            cc.systemEvent.on("requestAudioPermission", this.onRequestAudioPermission.bind(this));
        }
    },

    onClose: function() {
        GameManager.popUpManager.remove(PopUpType.Permission, function() {});
    },

    onPermissionAllowAudio: function() {
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "requestGuideAudioPermission");
        }
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "requestGuideAudioPermission",
                "()V"
            );
        }
    },

    onPermissionAllowVideo: function() {
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "requestGuideVideoPermission");
        }
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "requestGuideVideoPermission",
                "()V"
            );
        }
    },

    onPermissionRequestAll: function() {
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "requestVideoPermission");
        } else if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            return jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "requestVideoPermission",
                "()V"
            );
        } else {
            this.videoStatus = 3;
            this.onRequestAudioPermission(3);
        }
    },

    onRequestVideoPermission: function(data) {
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppController", "requestAudioPermission");
            this.videoStatus = data;
        }
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "requestAudioPermission",
                "()V"
            );
            this.videoStatus = data;
        }
    },

    onRequestAudioPermission: function(data) {
        this.audioStatus = data;
        if (this.videoStatus == 3 && this.audioStatus == 3) {
            cc.find("continue", this.node).active = false;
            cc.find("allow", this.node).active = false;
            cc.find("allow2", this.node).active = false;
            cc.find("go", this.node).active = true;

            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
                this.customVideoRender.active = true;
                this.customVideoRender.getComponent("CustomVideoRender").onVideoPlaybackStart();
                jsb.reflection.callStaticMethod("RootViewController", "startCameraCapture");
            }
            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
                this.customVideoRender.active = true;
            }
            cc.find("step1", this.node).active = false;
            cc.find("success", this.node).active = true;
        } else if (this.videoStatus == 2) {
            cc.find("continue", this.node).active = false;
            cc.find("allow", this.node).active = false;
            cc.find("allow2", this.node).active = false;
            cc.find("go", this.node).active = true;

            cc.find("step1", this.node).active = false;
            cc.find("oops", this.node).active = true;
        } else if (this.audioStatus == 2) {
            cc.find("continue", this.node).active = false;
            cc.find("allow", this.node).active = false;
            cc.find("allow2", this.node).active = true;
            cc.find("go", this.node).active = false;

            cc.find("step1", this.node).active = false;
            cc.find("oops2", this.node).active = true;
        }
    },

    onPermissionBack: function() {
        this.onClose();
    },

    onPermissionBack2: function() {
        this.onClose();
    },

    onPermissionGo: function() {
        this.customVideoRender.active = false;
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("RootViewController", "stopCameraCapture");
            this.customVideoRender.getComponent("CustomVideoRender").onVideoPlaybackEnd();
        }
        this.onClose();
    },

});