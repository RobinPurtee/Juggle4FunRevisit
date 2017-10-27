// hand strings
const RightHand = "R";
const LeftHand = "L";
// Toss direction strings
const Pass = "P";
const Diagonal = "D";
const Self = "S";
const Heff = "H";


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
//  location - If not null it references the toss the prop is current executing. If null then the prop is in a hand or on the floor
function Prop(id_) {
    this.id = id_;
    this.location = null;
}

// Test if prop is in a hand
Prop.prototype.isInFlight = function() {
    return this.location != null && this.location instanceof Toss;
}

Prop.prototype.isInHand = function() {
    return this.location != null && this.location instanceof Hand;
}

Prop.prototype.isOnFloor = function() {
    return this.location === null;
}

Prop.prototype.toString = function() {
        let retStr = this.id.toString();
        if (this.isOnFloor()) {
            retStr += " - Floor";
        } else {
            retStr += " - " + this.location.toString();
        }
        return retStr;
    }
//-----------------------------------------------------------------------------
// Manager for the state of a hand
// Properties:
// jugglerId - the id of the juggler
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
function Hand(jugglerId_, hand_) {
    this.jugglerId = jugglerId_;
    this.hand = hand_;
    this.props = new Array();
}
//-----------------------------------------------------------------------------
Hand.prototype.isVacant = function() {
    return (this.props.length === 0);
}

Hand.prototype.Toss = function(toss_) {
    let prop = this.props.shift();
    if (toss_.originJuggler === null) {
        toss_.originJuggler = this.jugglerId;
    }
    toss_.originHand = this.hand;
    prop.location = toss_;
    return prop;
}

Hand.prototype.Catch = function(prop_) {
    //TODO: possibly validate the prop is intended for this hand
    prop_.location = this;
    this.props.push(prop_);
}

Hand.prototype.toString = function() {
    return this.jugglerId.toString() + this.hand.toString();
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
    this.hands.set(RightHand, new Hand(this.id, RightHand));
    this.hands.set(LeftHand, new Hand(this.id, LeftHand));
    this.tossHand = RightHand;
    this.rhythmLength = tossRow_.length;
    this.currentToss = 0;
    this.inComingProps = new Array();
    this.isTossing = true;
    this.hasHurrys = false;
    this.isHanded = true;
    this.tosses = new Array(this.rhythmLength);
    for (let i = 0; i < this.rhythmLength; ++i) {
        let tossStr = tossRow_[i].textContent;
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
    if (prop_.location instanceof Toss) {
        let insertIndex = prop_.location.magnitude - 2; // subtract one to convert to 0 base and one because it is caught a before thrown
        if (this.inComingProps[insertIndex] != undefined) {
            throw new TossException(prop_.location, "Toss from " + prop_.location.toString() + " and " + this.inComingProps[insertIndex] + " will arrive at the same time");
        }
        this.inComingProps[insertIndex] = prop_;
    } else {
        prop_.location = null; // pro has landed on the floor
        throw new TossException(prop_.location, "Dropped prop " + prop_.id + " on the floor because it has no valid destination");
    }
}

// Get the the incoming prop but do not remove it from the queue
Juggler.prototype.peekInComingProp = function() {
    let ret = null;
    if (this.inComingProps.length > 0 && this.inComingProps[0] != undefined) {
        ret = this.inComingProps[0];
    }
    return ret;
}

// catch the in coming prop
Juggler.prototype.Catch = function() {
    let propCaught = null;
    if (this.inComingProps.length > 0) {
        let curProp = this.inComingProps.shift();
        if (curProp != undefined) {
            if (curProp.isInFlight()) {
                this.hands.get(curProp.location.destinationHand()).Catch(curProp);
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
    let inComingProp = this.peekInComingProp();
    if (inComingProp != null && inComingProp.location.destinationHand() != undefined) {
        isHurryComing = inComingProp.location.destinationHand() != this.tossHand;
        if (isHurryComing) {
            this.tossHand = this.inComingProps[0].location.destinationHand();
        }
    }

    let prop = this.hands.get(this.tossHand).Toss(toss);
    toss.originHand = this.tossHand;
    prop.location = toss;

    this.tossHand = (this.tossHand === RightHand) ? LeftHand : RightHand;
    ++this.currentToss;
    if (this.currentToss === this.rhythmLength) {
        this.currentToss = 0;
    }
    return prop;
}

Juggler.prototype.toString = function() {
    let ret = this.id + this.tossHand;
    return ret;
}


// Utility function to check if a CSS class style exists
// param: the string name of the class to check for
// return: boolean; true if the class exists else false
function CSSClassExists(className_){
    let ret = false;
    for(let i = 0; i < document.styleSheets.length && !ret; ++i){
        let styleSheet = document.styleSheets[i];
        let rules = styleSheet.rules ? styleSheet.rules : styleSheet.cssRules;
        for(let j = 0; j < rules.length && !ret; ++j){
            ret = className_ === rules[j].selectorText;
        }
    }
    return ret;
}

// class holding the position of the juggler and the angle it is facing
// param: x_ - the x coordinate of the position
// param: y_ - the y coordinate of the position
// param: angle_ - the angle of the front of the juggler
function JugglerPosition(x_, y_, angle_) {
    this.x = x_ || 0;
    this.y = y_ || 0;
    this.angle = angle_ || 0;

    // translate the relative to the juggler point given to global coordinates
    this.transformPoint = function(x_, y_){
        let rads = this.angle * (Math.PI / 180);
        let sin = Math.sin(rads);
        let cos = Math.cos(rads);
        return {
            x: ((x_ * cos) - (y_ * sin)) + this.x
          , y: ((x_ * sin) + (y_ * cos)) + this.y
        }
    }
}


// The object to manage the display of a Juggler
function JugglerView(svgRoot_, name_, position_) {
    // build a juggler svg group
    if(!CSSClassExists(".jugglerArms")){
        document.styleSheets[0].insertRule(".jugglerArms {fill:none;stroke:#000000;stroke-width:1;}")
    }
    if(!CSSClassExists(".jugglerRightHand")){
        document.styleSheets[0].insertRule(".jugglerRightHand {fill:#e80000;stroke:#000000;stroke-width:1;}")
    }
    if(!CSSClassExists(".jugglerLeftHand")){
        document.styleSheets[0].insertRule(".jugglerLeftHand {fill:#00e800;stroke:#000000;stroke-width:1;}")
    }
    if(!CSSClassExists(".jugglerHead")){
        document.styleSheets[0].insertRule(".jugglerHead {fill:#ebebeb;stroke:#000000;stroke-width:1;}")
    }
    if(!CSSClassExists(".jugglerName")){
        document.styleSheets[0].insertRule(".jugglerHead {font-size:15px}")
    }

    this.juggler = svgRoot_.group();
    // build the torso group
    this.torso = this.juggler.group();
    this.torso.path("M 19.798 -30.072 C 13.049 -30.072 6.308 -30.072 2.927 -25.144 C 0.222 -21.198 -0.318 -14.093 -0.425 -6.244 C -0.452 -4.29 -0.452 -2.289 -0.452 -0.28 C -0.452 1.551 -0.452 3.378 -0.431 5.174 C -0.337 13.265 0.183 20.705 3.046 24.856 C 6.538 29.928 13.55 29.928 20.548 29.928")
    this.torso.addClass("jugglerArms");
    this.rightHand = this.torso.circle(12).center(21, 30).addClass("jugglerRightHand");
    this.leftHand = this.torso.circle(12).center(21, -30).addClass("jugglerLeftHand");
    // torso built
    this.juggler.circle(24).center(0, 0).addClass("jugglerHead");
    this.juggler.text(name_).center(0, 0).addClass("jugglerName");
    // Juggler svg built

    this.position = new JugglerPosition(position_.x, position_.y, position_.angle);
    this.juggler.move(position_.x, position_.y);
    this.torso.rotate(position_.angle, 0, 0);
}

// animate the rotation of the juggler to the given angle
JugglerView.prototype.animateToAngle = function(angle_, time_) {
    let time = time_ || 1000;
     let relativeAngle = angle_ - this.position.angle || 0;
    if(relativeAngle !== 0){
        this.position.angle = angle_;
        let rotateTransform = {
            rotation: relativeAngle,
            cx:0,
            cy:0,
            relative:true
        };

        this.torso.animate(time, ">", 0)
            .transform(rotateTransform, true);

    }
}
// animate the movement of the juggler to a given location
JugglerView.prototype.animateToLocation = function(x_, y_, time_){
    let time = time_ || 1000;
    let x = x_ || 0;
    let y = y_ || 0;
    this.position.x = x;
    this.position.y = y;
    this.juggler.animate(time, ">", 0).move(x,y);
}
// animate the the juggler to the given position in a straght line
JugglerView.prototype.animateToPosition = function(position_, time_) {
    let time = time_ || 1000;

    this.animateToLocation(position_.x, position_.y, time)
    this.animateToAngle(position_.angle, time);

}
// Get the Point in global coordinates of the center of the right hand
JugglerView.prototype.getRightHandPoint = function(){
    return this.position.transformPoint(this.rightHand.cx(), this.rightHand.cy());
}
// Get the Point in global coordinates of the center of the left hand
JugglerView.prototype.getLeftHandPoint = function(){
    return this.position.transformPoint(this.leftHand.cx(), this.leftHand.cy());
}

//-------------------------------------------------------------------------------------

function Pattern(numberOfJugglers_, numberOfProps_, rhythmTable_) {
    // create the jugglers
    this.jugglers = new Array(numberOfJugglers_);
    let jugglerIdIndex = 65; // charater code for 'A'
    for (let i = 0; i < numberOfJugglers_; ++i) {
        let tableRow = rhythmTable_.rows[i];
        if (tableRow === undefined) {
            tableRow = rhythmTable_.rows[0];
        }
        this.jugglers[i] = new Juggler(String.fromCharCode(jugglerIdIndex), tableRow.cells);
        ++jugglerIdIndex;
    }
    this.rhythmLength = this.jugglers[0].rhythmLength;
    // if there are only 2 jugglers then set the partner id to each other
    if (numberOfJugglers_ === 2) {
        this.jugglers[0].setPartnerId(this.jugglers[1].id);
        this.jugglers[1].setPartnerId(this.jugglers[0].id);
    }
    // create the props
    this.props = new Array(numberOfProps_);
    let propNameIndex = 97; // charater code for 'a'
    for (let i = 0; i < numberOfProps_; ++i) {
        this.props[i] = new Prop(String.fromCharCode(propNameIndex));
        ++propNameIndex;
    }
    // distribute the props
    let curHand = RightHand;
    let jugglerIndex = 0;
    this.props.forEach(function(prop_) {
        this.jugglers[jugglerIndex].pickup(curHand, prop_);
        ++jugglerIndex;
        if (jugglerIndex >= this.jugglers.length) {
            jugglerIndex = 0;
            curHand = (curHand === RightHand) ? LeftHand : RightHand;
        }

    }, this);
}

// execute the next toss in the rhythm for all jugglers
// return: array of all tossed props
Pattern.prototype.Toss = function() {
    let tosses = new Array();
    this.jugglers.forEach(function(juggler_, index_, jugglers_) {
        let prop = juggler_.Toss();
        tosses.push(prop);
        let receivingJuggler = jugglers_.find(function(j_) {
            return j_.id === prop.location.juggler;
        });
        receivingJuggler.addInComingProp(prop);
    }, this);
    return tosses;
}

// execute the next catch in the rhythm for all jugglers
// return: array of all props caught
Pattern.prototype.Catch = function() {
    let caughts = new Array();
    this.jugglers.forEach(function(juggler_) {
        let prop = juggler_.Catch();
        if (prop != null) {
            caughts.push(prop);
        }
    }, this);
    if (caughts.length == 0) {
        caughts = null;
    }
    return caughts;
}


Pattern.prototype.RunForCycle = function(limit) {
    for (let toss = 0; toss < limit; ++toss) {
        let tossedProps = this.pattern.Toss();
        assert.equal(tossedProps.length, 2, "2 props tossed");
        assert.ok(arePropsValid(toss, tossedProps), "The correct props where tossed");
        caughtProps = pattern.Catch();
        if (toss < 1) { // the first 2 tosses have no catch
            assert.equal(caughtProps, null, "No props caught");
        } else {
            assert.ok(arePropsValid(toss - 1, caughtProps), "The correct props where caught");
        }

    }
}


Pattern.prototype.hasCycled = function() {
    let propIndex = 0;
    let currentHand = RightHand;
    let isComplete = true;
    for (let i = 0; i < 2 && isComplete; ++i) {
        for (let jugglerIndex = 0; jugglerIndex < this.jugglers.length && propIndex < this.props.length && isComplete; ++jugglerIndex) {
            isComplete = this.props[propIndex].isInHand &&
                this.props[propIndex].location.juggler == this.jugglers[jugglerIndex].id &&
                this.props[propIndex].location.hand === currentHand;
            ++propIndex;
        }
        if (isComplete) {
            currentHand = LeftHand;
        }
    }
    currentHand = RightHand;
    for (let jugglerIndex = 0; jugglerIndex < this.jugglers.length && propIndex < this.props.length && isComplete; ++jugglerIndex) {
        isComplete = this.props[propIndex].isInFlight() &&
            this.props[propIndex].location.juggler == this.jugglers[jugglerIndex].id &&
            this.props[propIndex].location.hand == currentHand;
    }
}