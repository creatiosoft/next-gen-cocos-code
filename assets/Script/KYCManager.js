// KYCManager.js
cc.Class({
    extends: cc.Component,

    properties: {
        webView: cc.WebView
    },

    onLoad() {
        this.snsWebSDK = null;
        this.isSDKLoaded = false;
        this.accessToken = null;
        this.containerElement = null;
        this.isCompleted = false;
        this.playerId = null;
        this.accessToken = null;
        // this.initKYC();
    },

    initKYC(token, playerId) {
        // if (typeof snsWebSdk !== 'undefined') {
        this.accessToken = token;
        this.playerId = playerId;
        this.isSDKLoaded = true;
        // } else {
        //     this.checkSDKAvailability();
        // }
        this.startKYCVerification();
    },

    startKYCVerification() {
        if (!this.isSDKLoaded) {
            return;
        }
        this.launchVerificationFlowInWebView();
    },

    launchVerificationFlowInWebView() {
        try {
            this.createWebView();
            this.loadKycWebPage(this.playerId);

        } catch (error) {
            cc.error("WebView Error:", error);
        }
    },

    createWebView() {
        this.setupWebViewEvents();
        this.webViewNodeInstance = this.webView.node;
    },

    loadKycWebPage(userId) {
        const remoteUrl = this.generateRemoteKycUrl(userId);
        this.webView.url = remoteUrl;
    },

    generateRemoteKycUrl(userId) {
        const baseUrl = "https://txpokeronline.com/kyc.html";
        // const baseUrl = "https://supersuraccoon-cocos2d.com/kyc.html";
        return `${baseUrl}?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(this.accessToken)}`;
    },

    setupWebViewEvents() {
        if (!this.webView) return;

        const eventHandler = new cc.Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "KYCManager";
        eventHandler.handler = "onWebViewEvent";

        this.webView.webviewEvents.push(eventHandler);

        this.webView.node.on('loaded', this.onWebViewLoaded, this);
        this.webView.node.on('loading', this.onWebViewLoading, this);
        this.webView.node.on('error', this.onWebViewError, this);
    },

    onWebViewEvent(webview, eventType, customEventData) {
        switch (eventType) {
            case cc.WebView.EventType.LOADED:
                this.onWebViewLoaded();
                break;
            case cc.WebView.EventType.LOADING:
                this.onWebViewLoading();
                break;
            case cc.WebView.EventType.ERROR:
                this.onWebViewError();
                break;
        }
    },

    onWebViewLoaded() {
        this.setupWebViewCommunication();
    },

    onWebViewLoading() {},

    onWebViewError() {
        this.scheduleOnce(() => {
            // this.closeKYC();

            if (this.webView && this.webView.node) {
                this.webView.node.active = false;
            }
            if (this.webView) {
                this.webView.url = "";
            }
            cc.systemEvent.dispatchEvent(new cc.Event.EventCustom('KYCManager_Error', true));
            this.node.removeFromParent(true);

        }, 1);
    },

    setupWebViewCommunication() {
        const scheme = "kyccallback";
        this.webView.setJavascriptInterfaceScheme(scheme);
        this.webView.setOnJSCallback(this.onWebViewMessage.bind(this));
    },

    onWebViewMessage(webview, url) {
        try {
            if (url.startsWith("kyccallback://")) {
                const message = url.replace("kyccallback://", "");
                const data = JSON.parse(decodeURIComponent(message));
                this.handleWebViewMessage(data);
            }
        } catch (error) {
            cc.error("onWebViewMessage", error);
        }
    },

    handleWebViewMessage(data) {
        switch (data.type) {
            case 'stepCompleted':
                break;
            case 'error':
                break;
            case 'verificationDone':
                break;
            case 'needNewToken':
                break;
            case 'closeWebView':
                this.handleCloseWebView(data.payload);
                break;
            case 'applicantLoaded':
                break;
            case 'applicantSubmitted':
                this.isCompleted = true;
                break;
            case 'pageUnloading':
                break;
        }
    },

    handleCloseWebView(payload) {
        this.scheduleOnce(() => {
            this.closeKYC();
        }, 0.1);
    },

    closeKYC() {
        if (this.webView && this.webView.node) {
            this.webView.node.active = false;
        }
        if (this.webView) {
            this.webView.url = "";
        }

        if (this.isCompleted) {
            cc.systemEvent.dispatchEvent(new cc.Event.EventCustom('KYCManager_Completed', true));
        } else {
            cc.systemEvent.dispatchEvent(new cc.Event.EventCustom('KYCManager_Pending', true));
        }
        this.node.removeFromParent(true);
    },

    hideWebView() {
        if (this.webViewNodeInstance) {
            this.webViewNodeInstance.active = false;
        }
        this.removeWebView();
    },

    removeWebView() {
        if (this.webViewNodeInstance) {
            this.webViewNodeInstance.destroy();
            this.webViewNodeInstance = null;
            this.webView = null;
        }
    },

    onDestroy() {
        this.closeKYC();
    }
});