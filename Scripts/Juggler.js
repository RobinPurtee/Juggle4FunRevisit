// hand strings
var RightHand = "R";
var LeftHand = "L";
// Toss direction strings
var Pass = "P";
var Diagonal = "D";
var Self = "S";
var Heff = "H";


//-----------------------------------------------------------------------------
function TossException(toss_, message_) {
    this.toss = toss_;
    this.message = message_;
}

//-----------------------------------------------------------------------------
// The object that represents a Toss 
// parameters:
//      direction_ - A Toss direction string (maybe a full Toss string)
//      magnitude_ - This siteswap value of the pass (optional: defaults to 3)
//      juggler_   - The name of the destination juggler (optional: defaults to "A")

function Toss(direction_, magnitude_, juggler_) {
    this.originJuggler = null;
    this.originHand = null;
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
        if (this.direction === Self || this.direction === Heff) {
            this.juggler = this.originJuggler;
        }

    } else {
        if (direction_ === undefined) {
            this.direction = Self;
        }
        if (this.magnitude === undefined || isNaN(this.magnitude)) {
            this.magnitude = 3;
        }
        if (juggler_ === undefined) {
            this.juggler = null;
        }
    }
}

// Test if this toss has an origin juggler and hand
Toss.prototype.hasOrigin = function() {
    return this.originJuggler != null;
}

Toss.prototype.setOrigin = function(juggler_, hand_) {
    this.originJuggler = juggler_;
    this.originHand = hand_;
    if (this.direction === Self || this.direction === Heff) {
        this.juggler = this.originJuggler;
    }
}


// Calculate the hand of the destination juggler
// return: The destination hand if this toss has an origin juggler and hand, else undefined
Toss.prototype.destinationHand = function() {
    let hand = undefined;
    if (this.hasOrigin()) {
        if (this.direction == Pass || this.direction == Self) {
            hand = (this.originHand === RightHand) ? LeftHand : RightHand;
        } else {
            hand = this.originHand;
        }
    }
    return hand;
}

// Get a string containing just the optional magnitude and direction but no juggler
Toss.prototype.toDirectionString = function() {
    let retStr = new String();
    if (this.magnitude != 3) {
        retStr = this.magnitude.toString();
    }
    retStr += this.direction;
    return retStr;
}

// Get a string containing the magnutude (optionally), direction, and juggler of the toss 
Toss.prototype.toJugglerDirectionString = function() {
    let retStr = this.toDirectionString();
    if (this.juggler != null && this.direction != Self && this.direction != Heff)
        retStr += this.juggler;
    return retStr;
}

// Get a string that contains all properties of the toss object
Toss.prototype.toFullString = function() {
    let retStr = this.toString();
    if (this.hasOrigin()) {
        retStr += this.destinationHand();
    }
    return retStr;
}

// Get a string representation of the property values of the toss
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

//-----------------------------------------------------------------------------
// The Prop class represents a prop in the pattern
// Properties:
//  id - the id of the prop
//  toss - If not null it references the toss the prop is current executing. If null then the prop is in a hand or on the floor
function Prop(id_) {
    this.id = id_;
    this.toss = null;
}

// Test if prop is in a hand 
Prop.prototype.isInFlight = function() {
    return this.toss != null;
}

Prop.prototype.toString = function() {
        let retStr = this.id.toString();
        if (this.isInHand()) {
            retStr += " - " + this.toss.toString();
        }
        return retStr;
    }
    //-----------------------------------------------------------------------------
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

Hand.prototype.Toss = function(toss_) {
    let prop = this.props.shift();
    toss_.originHand = this.hand;
    prop.toss = toss_;
    return prop;
}

Hand.prototype.Catch = function(prop_) {
    prop_.toss = null;
    this.props.push(prop_);
}

//-------------------------------------------------------------------------------------
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
    this.inComingProps = new Array();
    this.isTossing = true;
    this.hasHurrys = false;
    this.isHanded = true;
    this.tosses = new Array(this.cycleLength);
    for (var i = 0; i < this.cycleLength; ++i) {
        let tossStr = tossRow_[i].innerText;
        let toss = new Toss(tossStr);
        toss.setOrigin(this.id, this.tossHand)
        this.tossHand = (this.tossHand === RightHand) ? LeftHand : RightHand;
        this.tosses[i] = toss;
    }
    this.tossHand = RightHand;
}

// place the given prop into the given hand
// Parameters:
//  hand_ - The id of the hand to place the prop in
//  prop_ - the prop to place in the hand
Juggler.prototype.pickup = function(hand_, prop_) {
    this.hands.get(hand_).Catch(prop_);
}

// Set the destination juggler for all Passes and Diagonals to the given id;
Juggler.prototype.setPartnerId = function(id_) {
    this.tosses.forEach(function(toss_) {
        if (toss_.direction == Pass || toss_.direction == Diagonal) {
            toss_.juggler = id_;
        }
    }, this);
}

// called to tell the juggler about an incoming toss
// remarks: Tosses are placed at the que index based on the magnitude of the toss. If that index already contains a toss
//          it means that more than one prop will reach the same hand at the same time, which throws an exception.
Juggler.prototype.addInComingProp = function(prop_) {
    let insertIndex = prop_.toss.magnitude - 2; // subtract one to convert to 0 base and one because it is caught a before thrown
    if (this.inComingProps[insertIndex] != undefined) {
        throw new TossException(prop_.toss, "Toss from " + prop_.toss.toString() + " and " + this.inComingProps[insertIndex] + " will arrive at the same time");
    }
    this.inComingProps[insertIndex] = prop_;
}

Juggler.prototype.peekInComingProp = function() {
    let ret = null;
    if (this.inComingProps.length > 0 && this.inComingProps[0] != undefined) {
        ret = this.inComingProps[0];
    }
    return ret;
}


Juggler.prototype.Catch = function() {
    var propCaught = null;
    if (this.inComingProps.length > 0) {
        let curProp = this.inComingProps.shift();
        if (curProp != undefined) {
            if (curProp.isInFlight()) {
                this.hands.get(curProp.toss.destinationHand()).Catch(curProp);
                propCaught = curProp;
            } else {
                throw new TossException(null, "Missed catch due because Prop " + curProp.id + "is not in flight");
            }

        }
    }
    return propCaught;
}

Juggler.prototype.getCurrentToss = function() {
    return this.tosses[this.currentToss];
}

Juggler.prototype.Toss = function() {
    let isHurryComing = false;
    let toss = this.getCurrentToss();
    // if there is an in comming toss that has a destination hand (in case there is not origin)
    var inComingProp = this.peekInComingProp();
    if (inComingProp != null && inComingProp.toss.destinationHand() != undefined) {
        isHurryComing = inComingProp.toss.destinationHand() == this.tossHand;
        if (isHurryComing) {
            this.tossHand = this.inComingProps[0].toss.destinationHand();
        }
    }

    let prop = this.hands.get(this.tossHand).Toss(toss);
    toss.originHand = this.tossHand;
    prop.toss = toss;

    this.tossHand = (this.tossHand === RightHand) ? LeftHand : RightHand;
    ++this.currentToss;
    if (this.currentToss === this.cycleLength) {
        this.currentToss = 0;
    }
    return prop;
}

Juggler.prototype.toString = function() {
    let ret = this.id + this.tossHand;
    return ret;
}

function createPropList(numberOfProps_) {
    let propNameIndex = 97
    let propList = new Array(numberOfProps_);
    for (var i = 0; i < numberOfProps_; ++i) {
        var propCurrentName = String.fromCharCode(propNameIndex);
        propList[i] = new Prop(propCurrentName);
        ++propNameIndex;
    }
    return propList;
}

function distributeProps(jugglers_, props_) {
    var curHand = RightHand;
    var jugglerIndex = 0;
    props_.forEach(function(prop_) {
        jugglers_[jugglerIndex].pickup(curHand, prop_);
        ++jugglerIndex;
        if (jugglerIndex >= jugglers_.length) {
            jugglerIndex = 0;
            curHand = (curHand === RightHand) ? LeftHand : RightHand;
        }

    }, this);

}