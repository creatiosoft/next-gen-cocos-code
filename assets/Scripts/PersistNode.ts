
import { PopUpType } from "./Utilities/ScreensAndPopUps/PopUps/PopUpManager";
const PopUpBase = require("PopUpBase");
const PopUpType = require('PopUpManager').PopUpType;


const { ccclass, property, menu } = cc._decorator;


@ccclass
export default class PersistNode extends cc.Component {
    onLoad() {
    }
}

cc.nativeCallback = function(method, data, msg) {
    console.log('AgoraBridgeCall.nativeCallback');
    console.log('method', method);
    console.log('resultMsg', data);

    if (method == "onUserJoined") {
        cc.systemEvent.emit("onUserJoined", data);
    }
    else if (method == "doLogin") {
        cc.systemEvent.emit("doLogin", data, msg);
    } 
    else if (method == "doLogout") {
        cc.systemEvent.emit("doLogout", data, msg);
    }
    else if (method == "onUserOffline") {
        cc.systemEvent.emit("onUserOffline", data, msg);
    } 
    else if (method == "onUserVideoOff") {
        cc.systemEvent.emit("onUserVideoOff", data, msg);
    }
    else if (method == "onUserVideoOn") {
        cc.systemEvent.emit("onUserVideoOn", data, msg);
    }
    else if (method == "requestVideoPermission") {
        console.log("requestVideoPermission emit");
        cc.systemEvent.emit("requestVideoPermission", data);
    }
    else if (method == "requestAudioPermission") {
        cc.systemEvent.emit("requestAudioPermission", data);
    }
    else if (method == "onVideoPlaybackStart") {
        cc.systemEvent.emit("onVideoPlaybackStart", data);
    }
    else if (method == "onVideoPlaybackEnd") {
        cc.systemEvent.emit("onVideoPlaybackEnd", data);
    }
    else if (method == "onAudioPlaybackEnd") {
        cc.systemEvent.emit("onAudioPlaybackEnd", data);
    }
    else if (method == "onAudioRecordStop") {
        cc.systemEvent.emit("onAudioRecordStop", data, msg);
    }
    else if (method == "onVideoRecordStop") {
        cc.systemEvent.emit("onVideoRecordStop", data, msg);
    }
    else if (method == "onVideoRecordCancel") {
        cc.systemEvent.emit("onVideoRecordCancel", data, msg);
    }
    else if (method == "onAudioRecordSend") {
        cc.systemEvent.emit("onAudioRecordSend", data, msg);
    }
    else if (method == "onVideoRecordSend") {
        cc.systemEvent.emit("onVideoRecordSend", data, msg);
    }
}

cc.nativeCallbackUserOffline = function(data) {
    console.log('nativeCallbackUserOffline');
    cc.systemEvent.emit("onUserOffline", data);
}

cc.onRewardPurchase = function (info) {
    console.log("onRewardPurchase info = " + info);
    cc.systemEvent.emit("player:purchase", info);
};

