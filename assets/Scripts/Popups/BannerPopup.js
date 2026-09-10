var PopUpType = require('PopUpManager').PopUpType;
var PopUpBase = require('PopUpBase');
const { default: bannerHandler } = require('../bannerAds/bannerPopupHandler');

cc.Class({
    extends: PopUpBase,

    properties: {

        message: {
            default: null,
            type: cc.Label,
        },

        dismissNode: {
            default: null,
            type: cc.Node,
        },

        dismissToggle: {
            default: null,
            type: cc.Toggle,
        },

        bannerAdsNode: {
            default: null,
            type: cc.Node
        },
    },

    onShow: function(data) {

        let filterData = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].status == 'Active') {
                filterData.push(data[i]);
            }
        }
        
        this.data = filterData;

        console.log(this.data);

        // this.message.string = this.data.message || this.data.info || "Server is under maintenance.\nPlease come back later.";

        let handler = this.bannerAdsNode.getComponent(bannerHandler);
        handler.setData(this.data, this.updateTitleCallback.bind(this));
    },

    updateTitleCallback(name) {
        this.message.string = name;
    },

    onLoad: function() {},

    onDismiss: function() {},

    onClose: function() {
        GameManager.popUpManager.remove(PopUpType.BannerPopup, function() {});

        if (this.dismissToggle.isChecked) {
            GameManager.api_banner_dismiss();
        }
    },
});