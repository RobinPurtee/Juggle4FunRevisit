var RightHand = "R";
var LeftHand = "L";
var Pass = "P";
var Diagonal = "D";
var Self = "S";
var Heff = "H";



function Toss(direction_, magnitude_, juggler_) {
    this.originJuggler = null;
    this.originHand = RightHand;
    this.magnitude = 3;
    this.direction = Pass;
    this.juggler = null;
    this.tossPath = null;
    if (!(magnitude_ instanceof undefined) && !isNaN(magnitude_)) {
        this.magnitude = magnitude_;
    }
    if (direction_ instanceof String) {
        this.direction = direction_;
    }
    if (juggler_ instanceof String) {
        this.juggler = juggler_;
    }
}


Toss.prototype.SetDisplay = function(show) {
    let state = "none";
    if (show === true) {
        state = "inline";
    }
    this.tossPath.setAttribute("display", state);
}

Toss.prototype.Show = function() { this.SetDisplay(true); }
Toss.prototype.Hide = function() { this.SetDisplay(false); }

Toss.prototype.shortDestinationString = function() {
    let retStr = new String();
    if (this.magnitude != 3) {
        retStr = this.magnitude.toString();
    }
    retStr += this.direction;
    return retStr;
}

Toss.prototype.destinationString = function() {
    let retStr = this.shortDestinationString();
    if (this.juggler != null)
        retStr += this.juggler;
    return retStr;
}


Toss.prototype.toString = function() {
    let retStr = new String();
    if (this.originJuggler != null) {
        retStr = this.originJuggler.name;
        retStr += this.originHand;
        retStr += "-";
    }
    retStr += this.magnitude.toString();
    retStr += this.direction;
    if (this.juggler != null) {
        retStr += this.juggler;
    } else {
        retStr += 'A';
    }
    return retStr;
}



function Juggler(name_, patternRow_) {
    this.name = name_;
    this.tossHand = RightHand;
    this.tosses = new Array(patternRow_.cells.length);

    this.toString = function() {
        let ret = this.name + this.tossHand;
        return ret;
    }

}