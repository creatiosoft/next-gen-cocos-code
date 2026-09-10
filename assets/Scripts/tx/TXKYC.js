
var TXKYC = cc.Class({
    extends: cc.Component,

    editor: {
        menu: 'tx/TXKYC',
    },

    properties: {
    },

    onShow: function (data) {
    },

    onClose: function () {
        this.node.removeFromParent(true);
    },

});
