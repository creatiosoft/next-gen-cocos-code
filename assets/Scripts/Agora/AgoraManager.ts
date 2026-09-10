import AgoraVideoRender from "./AgoraVideoRender";

class AgoraManager {
    private static readonly singleton: AgoraManager = new AgoraManager();
    public static getInstance() { return AgoraManager.singleton; }

    rtc: any = {};

    public localRender: AgoraVideoRender = null;
    public testRender: AgoraVideoRender = null;
    public remoteRenders: AgoraVideoRender[] = [];
    public remoteVideoMuteStatus: any = {};
    public remoteSelfVideoMuteStatus: any = {};
    public channel: string = "";
    // 新增：存储本地 MediaStream
    private localMediaStream: MediaStream | null = null;

    public customVideoRender(mediaStream, channel, uid, isLocal) {
        const video = document.createElement("video");
        video.style.display = "none";
        video.srcObject = mediaStream;
        video.muted = true;
        video.setAttribute("playsinline", "");

        video.onloadedmetadata = (e) => {
            const canvas = document.createElement("canvas");

            video.addEventListener('timeupdate', (event) => {
                const canvasContext = canvas.getContext("2d");

                if (isLocal) {
                    canvas.width = video.videoWidth / 2.5;
                    canvas.height = video.videoHeight / 2.5;
                }
                else {
                     canvas.width = video.videoWidth / 1.5;
                     canvas.height = video.videoHeight / 1.5;   
                }

                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
                canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
                let dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                let img = document.createElement("img");
                img.src = dataUrl;

                if (isLocal) {
                    if (this.localRender) {
                        this.localRender.onRenderVideo({ img, channel, uid });
                    }
                } else {
                    if (this.remoteVideoMuteStatus[uid] == true) {

                    }
                    else {
                        cc.systemEvent.emit("remote-render", { img, channel, uid });
                    }
                }
            });

            video.play().catch((err) => {
            });
        };

        if (isLocal) {
            this.localMediaStream = mediaStream;
        }
    }

    public async initEngine() {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            this.rtc = {
                // For the local audio and video tracks.
                localAudioTrack: null,
                localVideoTrack: null,
                client: null,
            };

            cc.game.on(cc.game.EVENT_HIDE, () => {
                console.log("cc.game.EVENT_HIDE agora");
                if (this.rtc.localVideoTrack) {
                    // this.rtc.client.unpublish([this.rtc.localAudioTrack, this.rtc.localVideoTrack]);
                    GameManager.emit("backToLobby");
                }

            });

            cc.game.on(cc.game.EVENT_SHOW, () => {
                console.log("cc.game.EVENT_SHOW agora");
                if (this.rtc.localVideoTrack) {
                    // this.rtc.client.publish([this.rtc.localAudioTrack, this.rtc.localVideoTrack]);
                    GameManager.emit("backFromLobby");
                }
            });

            console.log("agora initEngine");

            // @ts-ignored
            this.rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
            this.rtc.client.on("user-published", async (user, mediaType) => {
                // Subscribe to the remote user when the SDK triggers the "user-published" event
                await this.rtc.client.subscribe(user, mediaType);
                console.log("agora user-published", user, mediaType);

                // this.remoteSelfVideoMuteStatus[user.uid] = false;
                delete this.remoteSelfVideoMuteStatus[user.uid];
                
                // cc.systemEvent.emit("user-published", { user: user, mediaType: mediaType });

                if (mediaType === 'video') {

                    if (this.remoteVideoMuteStatus[user.uid] == true) {
                        
                    }
                    else {
                        cc.systemEvent.emit("onVideoOn", user.uid, this.channel);
                    }
                    const msTrack = user.videoTrack.getMediaStreamTrack();
                    const mediaStream = new MediaStream([msTrack]);
                    this.customVideoRender(mediaStream, this.channel, user.uid, false);
                }
                else if (mediaType === 'audio') {

                    if (this.remoteVideoMuteStatus[user.uid] == true) {                    
                        
                    }
                    else {
                        user.audioTrack.play();
                    }
                    console.log(`Playing audio for user ${user.uid}`);
                }

                // Listen for the "user-unpublished" event
                this.rtc.client.on("user-unpublished", user => {
                    // cc.systemEvent.emit("user-unpublished", { user: user });
                    console.log("agora user-unpublished", user);

                    this.remoteSelfVideoMuteStatus[user.uid] = true;

                    cc.systemEvent.emit("onVideoOff", user.uid, this.channel);
                });
            });
            this.rtc.client.on("error", (err) => {
                console.error("Agora RTC Error:", err);
            });
            this.rtc.client.on("exception", (event) => {
                console.error("Agora Exception:", event.code, event.msg, event.uid);
            });
        } else {

            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "initEngine",
                    '()V'
                );
            }
            else {
                jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "initEngine:",
                    "a354b12a37ff4c619ba6ed8f484e6b61"
                );
            }
        }
    }

    // public captureVideo(canvas, video, channel, uid, texture) {
    //     var canvasContext = canvas.getContext("2d");
    //     canvasContext.drawImage(video, 0, 0);
    //     let dataUrl = canvas.toDataURL('image/jpeg');
    //     let img = document.createElement("img");
    //     img.src = dataUrl;
    //     texture.initWithElement(img);
    //     cc.systemEvent.emit("VIDEO_RENDER", { texture: texture, channel: channel, uid: uid });
    // }

    public async joinRoom(appId, channel, token, uid, muted=false) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {

            if (this.rtc.localVideoTrack != null) {
                return;
            }

            this.channel = channel;

            console.log("<<<<<<<<< joinRoom");
            console.log(appId, channel, token, uid);
            // Join an RTC channel.

            try {
                // await this.rtc.client.join(appId, channel, token, String((uid + '')));
                await this.rtc.client.join(appId, channel, token, Number(uid));
            } catch (error) {
                console.warn("Failed to mute local audio stream:", error);
            }  

            // @ts-ignore
            this.rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            // @ts-ignore
            this.rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
                encoderConfig: {
                    width: 300,
                    height: 300,
                    frameRate: 15,
                    bitrateMin: 100,
                    bitrateMax: 400
                }
            });
            await this.rtc.client.publish([this.rtc.localAudioTrack, this.rtc.localVideoTrack]);
            // console.log("publish success!", channel, (uid + ''));
            
            if (muted) {

            }
            else {
                cc.systemEvent.emit("onVideoOn", uid, this.channel);
            }
            cc.systemEvent.emit("publish", { uid: (uid + ''), channel: channel });
            
            // let texture = new cc.Texture2D();
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((mediaStream) => {
                    this.customVideoRender(mediaStream, channel, (uid + ''), true);
                })
        }
        else {
            // console.log("joinRoom", channel, token, (uid + ''));
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "joinChannel",
                    '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V',
                    channel,
                    token,
                    (uid + '')
                );
            }
            else {
                jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "joinChannel:channnel:token:uid:",
                    appId,
                    channel,
                    token,
                    uid
                );
            }
        }
    }

    public async leaveBeforeReload() {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            console.log("leaveBeforeReload");
            const publishedTracks = this.rtc.client.localTracks || [];
            for (const track of publishedTracks) {
                if (track) {
                    track.stop();
                    track.close();
                }
            }
            await this.rtc.client.unpublish();
            await this.rtc.client.leave();
            this.rtc.localAudioTrack = null;
            this.rtc.localVideoTrack = null;
        }
    }

    public async leaveRoom(appId, channel, token, uid) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            const publishedTracks = this.rtc.client.localTracks || [];
            for (const track of publishedTracks) {
                if (track) {
                    track.stop(); // 停止播放
                    track.close(); // 关闭轨道
                    console.log(`Closed track: ${track.trackMediaType}`);
                }
            }

            // 释放 customVideoRender 的 MediaStream
            if (this.localMediaStream) {
                this.localMediaStream.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Stopped custom MediaStream track: ${track.kind}`);
                });
                this.localMediaStream = null;
            }

            // 取消发布所有轨道
            await this.rtc.client.unpublish();
            console.log("Unpublished all tracks");

            // 离开频道
            await this.rtc.client.leave();
            console.log("Left channel successfully");

            // 清空本地轨道引用
            this.rtc.localAudioTrack = null;
            this.rtc.localVideoTrack = null;

            this.channel = "";

            // // 验证摄像头状态
            // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            //     .then(stream => {
            //         stream.getTracks().forEach(track => track.stop());
            //         console.log("Verified: No active media streams");
            //     })
            //     .catch(err => console.log("No active media streams found:", err));
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "leaveChannel",
                    '(Ljava/lang/String;Ljava/lang/String;)V',
                    channel,
                    token
                );
            }
            else {
                jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "leaveChannel:token:",
                    channel,
                    token
                );
            }
        }
    }

    muteLocalAudioStream(mute) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            try {
                if (!this.rtc.localAudioTrack) {
                    console.warn("Local audio track not initialized");
                }
                // this.rtc.localAudioTrack.setMuted(mute);
                if (mute) {
                    this.rtc.localAudioTrack.stop();
                    this.rtc.localAudioTrack.mediaStreamTrack.enabled = !mute;
                }
                else {
                    this.rtc.localAudioTrack.play();
                    this.rtc.localAudioTrack.mediaStreamTrack.enabled = !mute;
                }
                console.log(`Local audio stream ${mute ? "muted" : "unmuted"}`);
            } catch (error) {
                console.warn("Failed to mute local audio stream:", error);
            }  
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "muteLocalAudioStream",
                        '()V',
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "unmuteLocalAudioStream",
                        '()V',
                    );
                }
                
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "muteLocalAudioStream"
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "unmuteLocalAudioStream"
                    );
                }
            } 
        }
    }

    muteRemoteAudioStream(uid, mute) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            try {
                const user = this.getRemoteUser(uid);
                if (!user) {
                    return;
                }
                if (user.audioTrack) {
                    if (mute) {
                        user.audioTrack.stop();
                        user.audioTrack.mediaStreamTrack.enabled = !mute;
                    }
                    else {
                        user.audioTrack.play();
                        user.audioTrack.mediaStreamTrack.enabled = !mute;
                    }
                }
                console.log(`Remote audio stream for user ${uid} ${mute ? "muted" : "unmuted"}`);
            } catch (error) {
                console.warn(`Failed to mute remote audio stream for user ${uid}:`, error);
            }
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "muteRemoteAudioStream",
                        '(I)V',
                        uid
                    );
                }
                else {
                     jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "unmuteRemoteAudioStream",
                        '(I)V',
                        uid
                    );   
                }
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "muteRemoteAudioStream:",
                        uid
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "unmuteRemoteAudioStream:",
                        uid
                    );
                }
            }
        }
    }

    muteLocalVideoStream(mute) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            try {
                if (!this.rtc.localVideoTrack) {
                    console.warn("Local video track not initialized");
                }
                this.rtc.localVideoTrack.setMuted(mute);
                console.log(`Local video stream ${mute ? "muted" : "unmuted"}`);
            } catch (error) {
                console.warn("Failed to mute local video stream:", error);
            }
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "muteLocalVideoStream",
                        '()V',
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "unmuteLocalVideoStream",
                        '()V',
                    );
                }
                
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "muteLocalVideoStream"
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "unmuteLocalVideoStream"
                    );
                }
            } 
        }
    }

    muteRemoteVideoStream(uid, mute) {
        if (!K.AgoraEnabled) {
             return;
        }
        if (!cc.sys.isNative) {
            try {
                const user = this.getRemoteUser(uid);
                if (!user) {
                    return;
                }
                this.remoteVideoMuteStatus[uid] = mute;
                if (user.videoTrack) {
                    user.videoTrack.mediaStreamTrack.enabled = !mute;
                }
                console.log(`Remote video stream for user ${uid} ${mute ? "muted" : "unmuted"}`);
            } catch (error) {
                console.warn(`Failed to mute remote video stream for user ${uid}:`, error);
            }
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "muteRemoteVideoStream",
                        '(I)V',
                        uid
                    );
                }
                else {
                     jsb.reflection.callStaticMethod(
                        'org/cocos2dx/javascript/AppActivity',
                        "unmuteRemoteVideoStream",
                        '(I)V',
                        uid
                    );   
                }
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                if (mute) {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "muteRemoteVideoStream:",
                        uid
                    );
                }
                else {
                    jsb.reflection.callStaticMethod(
                        "RootViewController",
                        "unmuteRemoteVideoStream:",
                        uid
                    );
                }
            }
        }
    }

    isJoined(channel) {
        if (!K.AgoraEnabled) {
             return false;
        }
        if (!cc.sys.isNative) {
            return (this.channel == "" ? false : true);
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "isJoined",
                    '()Z'
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isJoined"
                );
            }
        }
    }
    

    isRemoteJoined(uid) {
        if (!K.AgoraEnabled) {
             return false;
        }
        if (!cc.sys.isNative) {
            const user = this.getRemoteUser(uid);
            if (!user) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "isRemoteJoined",
                    "(I)Z",
                    uid
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isRemoteJoined:",
                    uid
                );
            }
        }
    }

    isVideoCurrentlyEnabled(channel) {
        if (!K.AgoraEnabled) {
             return false;
        }
        if (!cc.sys.isNative) {
            if (!this.rtc.localVideoTrack) {
                return false;
            }
            return this.rtc.localVideoTrack.mediaStreamTrack.enabled;
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "isVideoCurrentlyEnabled",
                    "()Z"
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isVideoCurrentlyEnabled:",
                    channel
                );
            }
        }
    }

    isAudioCurrentlyEnabled(channel) {
        if (!K.AgoraEnabled) {
             return false;
        }
        if (!cc.sys.isNative) {
            if (!this.rtc.localAudioTrack) {
                return false;
            }
            return this.rtc.localAudioTrack.mediaStreamTrack.enabled;
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    "org/cocos2dx/javascript/AppActivity",
                    "isAudioCurrentlyEnabled",
                    "()Z"
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isAudioCurrentlyEnabled:",
                    channel
                );
            }
        }
    }

    isRemoteVideoMuted(uid) {
        if (!K.AgoraEnabled) {
             return true;
        }
        if (!cc.sys.isNative) {
            const user = this.getRemoteUser(uid);
            if (!user) {
                return true;
            }
            if (this.remoteVideoMuteStatus[uid] == undefined ||
                this.remoteVideoMuteStatus[uid] == null) {
                return false;
            }
            return this.remoteVideoMuteStatus[uid];
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "isRemoteVideoMuted",
                    '(I)Z',
                    uid
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isRemoteVideoMuted:",
                    uid
                );
            }
        }
    }

    isRemoteSelfVideoMuted(uid) {
        if (!K.AgoraEnabled) {
             return true;
        }
        if (!cc.sys.isNative) {
            const user = this.getRemoteUser(uid);
            if (!user) {
                return true;
            }
            if (this.remoteSelfVideoMuteStatus[uid] == undefined ||
                this.remoteSelfVideoMuteStatus[uid] == null) {
                return false;
            }
            return this.remoteSelfVideoMuteStatus[uid];
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "isRemoteSelfVideoMuted",
                    '(I)Z',
                    uid
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isRemoteSelfVideoMuted:",
                    uid
                );
            }
        }
    }

    isRemoteAudioMuted(uid) {
        if (!K.AgoraEnabled) {
             return true;
        }
        if (!cc.sys.isNative) {
            const user = this.getRemoteUser(uid);
            if (!user || !user.audioTrack) {
                return true;
            }
            return !user.audioTrack.mediaStreamTrack.enabled;
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "isRemoteAudioMuted",
                    '(I)Z',
                    uid
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isRemoteAudioMuted:",
                    uid
                );
            }
        }
    }

    isJoinedChannel(channel) {
        if (!K.AgoraEnabled) {
             return false;
        }
        if (!cc.sys.isNative) {
            return (this.channel == channel);
        }
        else {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
                return jsb.reflection.callStaticMethod(
                    'org/cocos2dx/javascript/AppActivity',
                    "isJoinedChannel",
                    '(Ljava/lang/String;)Z',
                    channel
                );
            }
            else if (cc.sys.os === cc.sys.OS_IOS) {
                return jsb.reflection.callStaticMethod(
                    "RootViewController",
                    "isJoinedChannel:",
                    channel
                );
            }
        }
    }

    getRemoteUser(uid) {
        if (!K.AgoraEnabled) {
             return null;
        }
        for (var i = 0; i < this.rtc.client.remoteUsers.length; ++i) {
            if (this.rtc.client.remoteUsers[i].uid == uid) {
                return this.rtc.client.remoteUsers[i];
            }
        }
        return null;
    }

}

export const MGR_AGORA = AgoraManager.getInstance();
window.MGR_AGORA = MGR_AGORA;
