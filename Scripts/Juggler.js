// hand strings
var RightHand = "R";
var LeftHand = "L";
// Toss direction strings
var Pass = "P";
var Diagonal = "D";
var Self = "S";
var Heff = "H";


function TossException(toss_, message_) {
    this.toss = toss_;
    this.message = message_;
}


// The object that represents a Toss 
// parameters:
//      direction_ - A Toss direction string (maybe a full Toss string)
//      magnitude_ - This siteswap value of the pass (optional: defaults to 3)
//      juggler_   - The name of the destination juggler (optional: defaults to "A")

function Toss(direction_, magnitude_, juggler_) {
    this.originJuggler = null;
    this.originHand = RightHand;
    this.magnitude = magnitude_;
    this.direction = direction_;
    this.juggler = juggler_;
    this.tossPath = null;

    if (direction_ != undefined && direction_.length > 1) {
        let length = direction_.length;
        let i = 0;
        // if the Toss string has more than 3 charaters then it has an origin section
        if (length > 3) {
            this.originJuggler = direction_[i].toUpperCase();
            ++i;
            this.originHand = direction_[i].toUpperCase();
            ++i;
            ++i; // increment past the "-"
        }
        // if the next charater is a not a number
        this.magnitude = Number.parseInt(direction_[i]);
        if (Number.isNaN(this.magnitude)) {
            this.magnitude = 3; // set the magnitude to default
        } else {
            ++i; // go to the next charater to get the direction
        }
        this.direction = direction_[i].toUpperCase();
        ++i;
        if (i < length) {
            this.juggler = direction_[i].toUpperCase();
        }
    } else {
        if (direction_ === undefined) {
            this.direction = Self;
        }

        if (this.magnitude === undefined || isNaN(this.magnitude)) {
            this.magnitude = 3;
        }
        if (direction_ === undefined) {
            this.direction = Self;
        }
        if (juggler_ === undefined) {
            this.juggler = null;
        }
    }
}

Toss.prototype.destinationHand = function() {
    let hand = undefined;
    if (this.originJuggler != undefined) {
        if (this.direction == Pass || this.direction == Self) {
            hand = (this.originHand === RightHand) ? LeftHand : RightHand;
        } else {
            hand = this.originHand;
        }
    }
    return hand;
}
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
    if (this.juggler != null && this.direction != Self && this.direction != Heff)
        retStr += this.juggler;
    return retStr;
}

Toss.prototype.toString = function() {
    let retStr = new String();
    if (this.originJuggler != null) {
        retStr = this.originJuggler;
        retStr += this.originHand;
        retStr += "-";
    }
    retStr += this.magnitude.toString();
    retStr += this.direction;
    if ((this.direction === Self || this.direction === Heff)) {
        if (this.originJuggler != null) {
            retStr += this.originJuggler;
        }
    } else if (this.juggler != null) {
        retStr += this.juggler;
    }
    return retStr;
}

// Manager for the state of a hand
// Properties:
//  hand - the hand id under each juggler (value should be RightHand or LeftHand)
//  props - an array of objects currently held by the hand
// Methods:
//  isVacant() - test if the prop array is empty
//  Toss() - returns the prop it removes from the top of the prop array
//  Catch(prop_) - causes the prop to be added the bottom of the prop array
// Remarks:
//  The state of the hand toggles based 
// Parameters:
//      hand_ - the hand of this object
//      props_ - optional list of the props that are currently held by the hand
function Hand(hand_, props_) {
    this.hand = hand_;
    this.props = new Array();
    if (props_ != undefined) {
        if (Array.isArray(props_)) {
            this.props = this.props.concat(props_);
        } else {
            this.props.push(props_);
        }
    }
}

Hand.prototype.isVacant = function() {
    return (this.props.length === 0);
}

Hand.prototype.Toss = function() {
    return this.props.shift();
}

Hand.prototype.Catch = function(prop_) {
    this.props.push(prop_);
}


// Object that represents a Juggler
// parameters:
//  id_ - single charater Id of the juggler used 
//  tossRow_ - the DOM Table Row element containing the list of tosses for this juggler
//  name_ - optional name for the juggler

// A Juggler waits for a "catch" with a Toss parameter, then executes a toss by incrementing 
// the currentToss indexer, then based on the Toss in the catch will toggle the current hand. 
function Juggler(id_, tossRow_, name_) {
    this.id = id_;
    this.name = name_;
    this.hands = new Map();
    this.hands.set(RightHand, new Hand(RightHand));
    this.hands.set(LeftHand, new Hand(LeftHand));
    this.tossHand = RightHand;
    this.cycleLength = tossRow_.length;
    this.currentToss = 0;
    this.inComingToss = new Array();
    this.isTossing = true;
    this.hasHurrys = false;
    this.isHanded = true;
    this.tosses = new Array(this.cycleLength);
    for (var i = 0; i < this.cycleLength; ++i) {
        let tossStr = tossRow_[i].innerText;
        let toss = new Toss(tossStr);
        toss.originHand = this.tossHand;
        this.tossHand = (this.tossHand === RightHand) ? LeftHand : RightHand;
        toss.originJuggler = this.id;
        this.tosses[i] = toss;
    }
    this.tossHand = RightHand;
}

Juggler.prototype.pickup = function(hand_, prop_) {
    this.hands[hand_].Catch(prop_);
}

Juggler.prototype.setPartnerId = function(id_) {
    this.tosses.forEach(function(toss_) {
        if (toss_.direction == Pass || toss_.direction == Diagonal) {
            toss_.juggler = id_;
        }
    }, this);
}



// called to tell the juggler what hand the pass headed toward so he can clear that hand
Juggler.prototype.inComingToss = function(toss_) {
    if (this.inComingToss[toss_.magnitude] != undefined) {
        throw new TossException(toss_, "Toss from " + toss_.toString() + " and " + this.inComingToss[toss_.magnitude] + " will arrive at the same time");
    }
    this.inComingToss[toss_.magnitude] = toss_;
}

Juggler.prototype.catch = function(prop_) {
    let curToss = this.inComingToss.shift();
    this.hands[curToss.hand].Catch(prop_);
}

Juggler.prototype.getCurrentToss = function() {
    return this.tosses[this.currentToss];
}

Juggler.prototype.toss = function() {
    let isHurry = false;
    if (this.inComingToss.length > 0 && this.inComingToss[0].destinationHand != undefined) {
        isHurry = this.inComingToss[0].destinationHand === this.tossHand;
    }
    if (this.tosses[this.currentToss].originHand != this.tossHand) {
        this.tosses[this.currentToss].originHand = this.tossHand;
    }
    this.hands[this.currentToss].Toss();
    if (!isHurry) {
        this.tossHand = (this.tossHand === RightHand) ? LeftHand : RightHand;
    }
    ++this.currentToss;
    if (this.currentToss === this.cycleLength) {
        this.currentToss = 0;
    }
}

Juggler.prototype.toString = function() {
    let ret = this.id + this.tossHand;
    return ret;
}