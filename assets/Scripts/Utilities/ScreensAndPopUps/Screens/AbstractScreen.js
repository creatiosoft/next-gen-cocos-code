/**
 * @classdesc Abstract class representing a screen
 * @class AbstractScreen
 * @memberof Utilities.ScreensAndPopUps.Screens
 */
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {

    },

     onShow: function(data) {
        this.data = data;
        
    },

    onHide: function() {
       
    },
    onButtonClickEvent: function() {

    },
    onDestroy: function() {
        
    }
});
