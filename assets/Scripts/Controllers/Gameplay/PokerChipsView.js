/**
 * @classdesc Handles generation and destruction of chips on view
 * @class PokerChipsView
 * @memberof Controllers.Gameplay
 */
cc.Class({
    extends: cc.Component,

    properties: {
        chipsPrefab: {
            default: [],
            type: [cc.Prefab],
        },
        chips: {
            default: [],
            visible: false,
        },

        centerOffset: false,
        leftOffset: false,
        gridRefreshedRef: null,
        poolSize: 10,
        chipsTimer: null,

    },

    /**
     * @description Refresh the grid where chips will be present
     * @method onLoad
     * @memberof Controllers.Gameplay.PokerChipsView#
     */
    onLoad: function () {
        this.gridRefreshedRef = this.gridRefreshed.bind(this);
        GameScreen.node.on("grid-refreshed", this.gridRefreshedRef);
        // this.chipsPool = [];
        // for (var i = 0; i < this.chipsPrefab.length; i++) {
        //     this.createPool(i);
        // }
        this.chipsPrefab.reverse();

    },

    /**
     * @description Method to create pool of chips
     * @method createPool
     * @param {Number} i Identifies a unique chip prefab
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    createPool: function (i) {
        this.chipsPool[this.chipsPrefab[i].name] = [];
        for (var j = 0; j < this.poolSize; j++) {
            var chip = cc.instantiate(this.chipsPrefab[i]);
            chip.active = false;
            this.chipsPool[this.chipsPrefab[i].name].push(chip);
        }
    },

    /**
     * @description Get a Prefab From Pool
     * @method getFromPool
     * @param {String} prefabName -name of the prefab
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     * @returns {Prefab} chip Chip Prefab
     */
    getFromPool: function (prefabName) {
        var chip = this.chipsPool[prefabName].pop();
        chip.active = true;
        chip.name = prefabName;
        return chip;
    },

    /**
     * @description Returns Prefab to pool
     * @method returnToPool
     * @param {String} chip -name of the prefab
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    returnToPool: function (chip) {
        if (!!chip) {
            chip.active = false;
            chip.parent = null;
            this.chipsPool[chip.name].push(chip);
        }
    },

    /**
     * @description Destroys chips on Grid Refresh
     * @method onDestroy
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    onDestroy: function () {
        // clearTimeout(this.chipsTimer);
        GameScreen.node.off("grid-refreshed", this.gridRefreshedRef);
    },

    /**
     * @description Handles chips when the grid is refreshed
     * @method gridRefreshed
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    gridRefreshed: function () {
        this.activateChips(GameManager.activeTableCount == 1 || GameScreen.viewType == 2);
    },

    /**
     * @description Generates chips
     * @method generateChips
     * @param {Number} amount -Generates chips that values to the given amount
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    generateChips: function (amount) {
        // this.chipsTimer =
        //  this.scheduleOnce(function () {
        this.destroyChips();
        // var con = [50000, 25000, 10000, 5000, 1000, 100, 25, 10, 5, 1];
        var con = [50000, 25000, 10000, 5000, 2500, 1000, 500, 250, 100, 50, 25, 10, 5, 1];
        var modulus = amount % 50000;
        var counts = [parseInt(amount / 50000), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var index = 0;
        while (modulus >= 0 && index < 13) {
            index++;
            counts[index] = parseInt(modulus / con[index]);
            modulus = modulus % con[index];
        }
        counts.reverse();
        this.showChips(counts);
        this.activateChips(GameManager.activeTableCount == 1 || GameScreen.viewType == 2);
        // }.bind(this), 0.1);
    },

    /**
     * @description Destroy chips 
     * @method destroyChips
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    destroyChips: function () {
        // while (this.chips.length > 0) {
        //     this.returnToPool(this.chips[0]);
        // }
        // console.log("CHIPS COUNT Destroy ", this.chips.length);
        this.chips.forEach(function (element) {
            if (element) {
            element.destroy();
            }
            // this.returnToPool(element);
        }, this);
        this.chips = [];
    },

    /**
     * @description makes chips visible or invisible 
     * @method activateChips
     * @param {bool} activate -if true chips will be visible
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    activateChips: function (activate) {
        //set base size as font size
        // this.node.parent.parent.scale = !activate ? 1.3 : 1;
        // console.error("CHANFNG WIDTH")
        this.scheduleOnce(() => {
            // this.node.parent.parent.children[0].width = this.node.parent.width + 30;//10;
            // this.node.parent.parent.children[0].height = this.node.parent.height + 10;
        }, 0.05);


        this.chips.forEach(function (element) {
            element.active = activate;
        }, this);

    },

    /**
     * @description Sets position, scaling and coordinates of chips.
     * @method showChips
     * @param {Number} counts 
     * @memberof Conltrollers.Gameplay.PokerChipsView#
     */
    showChips: function (counts) {
        var offset = new cc.v2(40, 10);
        if (GameScreen.isMobile) {
            offset = new cc.v2(55, 10);
        }
        // var offset = new cc.v2(50, 5);
        var index = 0;
        var xIndex = 0;
        var yIndex = 0;
        var count = 0;
        var tempCount = [];
        counts.forEach(function (element) {
            if (element > 0) {
                count++;
                tempCount.push(0);
            }
        }, this);
        counts.forEach(function (element) {
            var x = 0;
            if (count > 3)
                count = 3;
            // if (this.centerOffset)
            x = offset.x * (xIndex - parseInt(count / 2));
            // else if (this.leftOffset)
            //     x = offset.x * (xIndex);
            // else
            //     x = offset.x * (-xIndex);

            if (element > 0) {
                yIndex = tempCount[xIndex];
            }
            for (var i = 0; i < element; i++) {
                if (!this.chipsPrefab[index]) {
                    continue;
                }
                var chip = cc.instantiate(this.chipsPrefab[index]);
                // var chip = this.getFromPool(this.chipsPrefab[index].name);
                this.chips.push(chip);
                this.node.addChild(chip);
                // chip.parent = this.node;
                chip.setPosition(x, offset.y * yIndex + 30);
                if (GameScreen.isMobile) {
                    chip.setScale(1.5, 1.5);
                } else {
                    chip.setScale(1.1, 1.1);
                }
                tempCount[xIndex]++;
                yIndex++;
            }
            if (element > 0) {
                if (xIndex < 2)
                    xIndex++;
                else {
                    xIndex = 0;
                }
            }
            index++;
        }, this);

        //  console.log("CHIPS COUNT CReated ", this.chips.length);
    }

});
