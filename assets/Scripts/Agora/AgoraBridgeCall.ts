import { MGR_AGORA } from "./AgoraManager";

export default class AgoraBridgeCall {

    public static callback = null;

    public static nativeCallback(method, data, msg) {
        // console.log('AgoraBridgeCall.nativeCallback');
        // console.log('method', method);
        // console.log('data', data);
        // console.log('msg', msg);

        if (method == "onUserJoined") {
            cc.systemEvent.emit("onUserJoined", data, msg);
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
        else if (method == "doLogin") {
        	cc.systemEvent.emit("doLogin", data, msg);
	    } 
	    else if (method == "doLogout") {
	        cc.systemEvent.emit("doLogout", data, msg);
	    }
        else if (method == "requestVideoPermission") {
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
    }
};

cc['AgoraBridgeCall'] = AgoraBridgeCall;