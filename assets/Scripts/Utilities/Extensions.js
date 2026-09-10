/*
// Author: Rajat Khurana
// Date: 5th Decemeber 2019
// Summary: Some extension methods. 
*/

//*************************************Number*************************************//
Number.prototype.roundOff = function(place) {
    return Number(this.toFixed(place));
};

Number.prototype.clamp = function(min, max) {
    return Math.max(min, Math.min(this, max));
};

Number.prototype.clamp01 = function() {
    return Math.max(0, Math.min(this, 1));
};
//********************************************************************************//



//*************************************String*************************************//
String.prototype.toNumber = function() {
    return Number(this);
};

String.prototype.getNumber = function() {
    return this.replace(/\D/g, '');
};

String.prototype.getDecimal = function() {
    return parseFloat(this.match(/[\d\.]+/));
};
//********************************************************************************//



//*************************************Others*************************************//
Math.roundOff = function(value, place) {
    value = Number(value);
    return Number(value.toFixed(place));
};
//********************************************************************************//