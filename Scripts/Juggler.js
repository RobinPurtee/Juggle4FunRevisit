"use strict"
// hand strings
const RIGHT_HAND = "R";
const LEFT_HAND = "L";
// Toss direction strings
const PASS = "P";
const DIAGONAL = "D";
const SELF = "S";
const HEFF = "H";


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

class Toss{
    constructor(direction_, magnitude_, juggler_) {
        this.originJuggler = null;
        this.originHand = null;
        this.magnitude = magnitude_;
        this.direction = direction_;
        this.juggler = juggler_;
        this.tossPath = null;

        if (direction_ != null && direction_.length > 1) {
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
            if (this.direction === SELF || this.direction === HEFF) {
                this.juggler = this.originJuggler;
            }

        } else {
            if (direction_ === null) {
                this.direction = SELF;
            }
            if (this.magnitude === null || isNaN(this.magnitude)) {
                this.magnitude = 3;
            }
            if (juggler_ === null) {
                this.juggler = null;
            }
        }
    }
// Test if this toss has an origin juggler and hand
    hasOrigin() {
        return this.originJuggler != null;
    }
//set the hand the toss is from
    setOrigin(juggler_, hand_) {
        this.originJuggler = juggler_;
        this.originHand = hand_;
        if (this.direction === SELF || this.direction === HEFF) {
            this.juggler = this.originJuggler;
        }
    }
// Calculate the hand of the destination juggler
// return: The destination hand if this toss has an origin juggler and hand, else undefined
    destinationHand() {
        let hand = undefined;
        if (this.hasOrigin()) {
            if (this.direction == PASS || this.direction == SELF) {
                hand = (this.originHand === RIGHT_HAND) ? LEFT_HAND : RIGHT_HAND;
            } else {
                hand = this.originHand;
            }
        }
        return hand;
    }
// Get a string containing just the optional magnitude and direction but no juggler
    toDirectionString() {
        let retStr = new String();
        if (this.magnitude != 3) {
            retStr = this.magnitude.toString();
        }
        retStr += this.direction;
        return retStr;
    }
// Get a string containing the magnutude (optionally), direction, and juggler of the toss
    toJugglerDirectionString() {
        let retStr = this.toDirectionString();
        if (this.juggler != null && this.direction != SELF && this.direction != HEFF)
            retStr += this.juggler;
        return retStr;
    }

// Get a string that contains all properties of the toss object
    toFullString() {
        let retStr = this.toString();
        if (this.hasOrigin()) {
            retStr += this.destinationHand();
        }
        return retStr;
    }

// Get a string representation of the property values of the toss
    toString() {
        let retStr = new String();
        if (this.originJuggler != null) {
            retStr = this.originJuggler;
            retStr += this.originHand;
            retStr += "-";
        }
        retStr += this.magnitude.toString();
        retStr += this.direction;
        if ((this.direction === SELF || this.direction === HEFF)) {
            if (this.originJuggler != null) {
                retStr += this.originJuggler;
            }
        } else if (this.juggler != null) {
            retStr += this.juggler;
        }
        return retStr;
    }
}
//-----------------------------------------------------------------------------
// The Prop class represents a prop in the pattern
// Properties:
//  id - the id of the prop
//  location - If not null it references the toss the prop is current executing. If null then the prop is in a hand or on the floor
class Prop{
    constructor(id_) {
        this.id = id_;
        this.location = null;
    }

    // Test if prop is in a hand
    isInFlight() {
        return this.location != null && this.location instanceof Toss;
    }

    isInHand() {
        return this.location != null && this.location instanceof Hand;
    }

    isOnFloor() {
        return this.location === null;
    }

    toString() {
        let retStr = this.id.toString();
        if (this.isOnFloor()) {
            retStr += " - Floor";
        } else {
            retStr += " - " + this.location.toString();
        }
        return retStr;
    }
}
// A list of props
// Properties:
//      list - the array of props
//      length - the number of props
// Methods:
//      distribute(jugglers) - distribute the props amoung the given jugglers
//      inFlightCount() -
class PropList {
    constructor(numberOfProps_){
        let propNameIndex = 97
        this.list = new Array(numberOfProps_);
        this.length = this.list.length;
        for (let i = 0; i < numberOfProps_; ++i) {
            this.list[i] = new Prop(String.fromCharCode(propNameIndex));
            ++propNameIndex;
        }
    }
    // Distribute the clubs amoung the jugglers
    distribute(jugglers_) {
        let curHand = RIGHT_HAND;
        let jugglerIndex = 0;
        for(let i = 0; i < this.list.length; ++i) {
            jugglers_[jugglerIndex].pickup(curHand, this.list[i]);
            ++jugglerIndex;
            if (jugglerIndex >= jugglers_.length) {
                jugglerIndex = 0;
                curHand = (curHand === RIGHT_HAND) ? LEFT_HAND : RIGHT_HAND;
            }

        }
    }
    // get the current number of props that are in the air
    inFlightCount() {
        let numberPropsInFlight = 0;
        this.list.forEach(function(prop_, index_) {
            if (prop_.isInFlight()) {
                ++numberPropsInFlight;
            }
        }, this);
        return numberPropsInFlight;
    }
}

//-----------------------------------------------------------------------------
// Manager for the state of a hand
// Properties:
// jugglerId - the id of the juggler
//  hand - the hand id under each juggler (value should be RIGHT_HAND or LEFT_HAND)
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
class Hand {
    constructor(jugglerId_, hand_) {
        this.jugglerId = jugglerId_;
        this.hand = hand_;
        this.props = new Array();
    }
    //-----------------------------------------------------------------------------
    isVacant() {
        return (this.props.length === 0);
    }

    Toss(toss_) {
        let prop = this.props.shift();
        if (toss_.originJuggler === null) {
            toss_.originJuggler = this.jugglerId;
        }
        toss_.originHand = this.hand;
        prop.location = toss_;
        return prop;
    }

    Catch(prop_) {
        //TODO: possibly validate the prop is intended for this hand
        prop_.location = this;
        this.props.push(prop_);
    }

    toString() {
        return this.jugglerId.toString() + this.hand.toString();
    }
}
//-------------------------------------------------------------------------------------
// Object that represents a Juggler
// parameters:
//  id_ - single charater Id of the juggler used
//  tossRow_ - the DOM Table Row element containing the list of tosses for this juggler
//  name_ - optional name for the juggler

// A Juggler waits for a "catch" with a Toss parameter, then executes a toss by incrementing
// the currentToss indexer, then based on the Toss in the catch will toggle the current hand.
class Juggler{
    constructor(id_, tossRow_, name_) {
        this.id = id_;
        this.name = name_;
        this.hands = new Map();
        this.hands.set(RIGHT_HAND, new Hand(this.id, RIGHT_HAND));
        this.hands.set(LEFT_HAND, new Hand(this.id, LEFT_HAND));
        this.tossHand = RIGHT_HAND;
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
            this.tossHand = (this.tossHand === RIGHT_HAND) ? LEFT_HAND : RIGHT_HAND;
            this.tosses[i] = toss;
        }
        this.tossHand = RIGHT_HAND;
    }

    // place the given prop into the given hand
    // Parameters:
    //  hand_ - The id of the hand to place the prop in
    //  prop_ - the prop to place in the hand
    pickup(hand_, prop_) {
        this.hands.get(hand_).Catch(prop_);
    }

    // Set the destination juggler for all Passes and Diagonals to the given id;
    setPartnerId(id_) {
        this.tosses.forEach(function(toss_) {
            if (toss_.direction == PASS || toss_.direction == DIAGONAL) {
                toss_.juggler = id_;
            }
        }, this);
    }

    // called to tell the juggler about an incoming toss
    // remarks: Tosses are placed at the que index based on the magnitude of the toss. If that index already contains a toss
    //          it means that more than one prop will reach the same hand at the same time, which throws an exception.
    addInComingProp(prop_) {
        if (prop_.location instanceof Toss) {
            let insertIndex = prop_.location.magnitude - 2; // subtract one to convert to 0 base and one because it is caught a before thrown
            if (this.inComingProps[insertIndex] != null) {
                throw new TossException(prop_.location, "Toss from " + prop_.location.toString() + " and " + this.inComingProps[insertIndex] + " will arrive at the same time");
            }
            this.inComingProps[insertIndex] = prop_;
        } else {
            prop_.location = null; // pro has landed on the floor
            throw new TossException(prop_.location, "Dropped prop " + prop_.id + " on the floor because it has no valid destination");
        }
    }

    // Get the the incoming prop but do not remove it from the queue
    peekInComingProp() {
        let ret = null;
        if (this.inComingProps.length > 0 && this.inComingProps[0] != null) {
            ret = this.inComingProps[0];
        }
        return ret;
    }

    // catch the in coming prop
    Catch() {
        let propCaught = null;
        if (this.inComingProps.length > 0) {
            let curProp = this.inComingProps.shift();
            if (curProp != null) {
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

    getCurrentToss() {
        return this.tosses[this.currentToss];
    }

    Toss() {
        let isHurryComing = false;
        let toss = this.getCurrentToss();
        // if there is an in comming toss that has a destination hand (in case there is not origin)
        let inComingProp = this.peekInComingProp();
        if (inComingProp != null && inComingProp.location.destinationHand() != null) {
            isHurryComing = inComingProp.location.destinationHand() != this.tossHand;
            if (isHurryComing) {
                this.tossHand = this.inComingProps[0].location.destinationHand();
            }
        }

        let prop = this.hands.get(this.tossHand).Toss(toss);
        toss.originHand = this.tossHand;
        prop.location = toss;

        this.tossHand = (this.tossHand === RIGHT_HAND) ? LEFT_HAND : RIGHT_HAND;
        ++this.currentToss;
        if (this.currentToss === this.rhythmLength) {
            this.currentToss = 0;
        }
        return prop;
    }

    toString() {
        let ret = this.id + this.tossHand;
        return ret;
    }
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
class JugglerPosition{
    constructor (x_, y_, angle_) {
        if(typeof x_ == 'object'){
            this.x = x_.x;
            this.y = x_.y;
            this.angle = x_.angle;
        }else{
            this.x = x_ || 0;
            this.y = y_ || 0;
            this.angle = angle_ || 0;
        }
    }
    // translate the relative to the juggler point given to global coordinates
    transformPoint(x_, y_){
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
class JugglerView{
    constructor(svgRoot_, name_, position_) {
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
            document.styleSheets[0].insertRule(".jugglerName {font-size:15px}")
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
    animateToAngle(angle_, time_) {
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
    animateToLocation(x_, y_, time_){
        let time = time_ || 1000;
        let x = x_ || 0;
        let y = y_ || 0;
        this.position.x = x;
        this.position.y = y;
        this.juggler.animate(time, ">", 0).move(x,y);
    }
    // animate the the juggler to the given position in a straght line
    animateToPosition(position_, time_) {
        let time = time_ || 1000;
        this.animateToLocation(position_.x, position_.y, time)
        this.animateToAngle(position_.angle, time);
    }
    // Get the Point in global coordinates of the center of the right hand
    getRightHandPoint(){
        return this.position.transformPoint(this.rightHand.cx(), this.rightHand.cy());
    }
    // Get the Point in global coordinates of the center of the left hand
    getLeftHandPoint(){
        return this.position.transformPoint(this.leftHand.cx(), this.leftHand.cy());
    }
}
//-------------------------------------------------------------------------------------

class Pattern{
    constructor(numberOfJugglers_, numberOfProps_, rhythmTable_) {
        // create the jugglers
        this.numberOfJugglers = numberOfJugglers_;
        this.numberOfProps = numberOfProps_;
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
        this.props = new PropList(numberOfProps_);
        // distribute the props
        this.props.distribute(this.jugglers);
    }

    // execute the next toss in the rhythm for all jugglers
    // return: array of all tossed props
    Toss() {
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
    Catch() {
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


    // RunForCycle(limit) {
    //     for (let toss = 0; toss < limit; ++toss) {
    //         let tossedProps = this.pattern.Toss();
    //         assert.equal(tossedProps.length, 2, "2 props tossed");
    //         assert.ok(arePropsValid(toss, tossedProps), "The correct props where tossed");
    //         caughtProps = pattern.Catch();
    //         if (toss < 1) { // the first 2 tosses have no catch
    //             assert.equal(caughtProps, null, "No props caught");
    //         } else {
    //             assert.ok(arePropsValid(toss - 1, caughtProps), "The correct props where caught");
    //         }

    //     }
    // }


    hasCycled() {
        let propIndex = 0;
        let currentHand = RIGHT_HAND;
        let isComplete = true;
        for (let i = 0; i < 2 && isComplete; ++i) {
            for (let jugglerIndex = 0; jugglerIndex < this.jugglers.length && propIndex < this.props.length && isComplete; ++jugglerIndex) {
                isComplete = this.props[propIndex].isInHand &&
                    this.props[propIndex].location.juggler == this.jugglers[jugglerIndex].id &&
                    this.props[propIndex].location.hand === currentHand;
                ++propIndex;
            }
            if (isComplete) {
                currentHand = LEFT_HAND;
            }
        }
        currentHand = RIGHT_HAND;
        for (let jugglerIndex = 0; jugglerIndex < this.jugglers.length && propIndex < this.props.length && isComplete; ++jugglerIndex) {
            isComplete = this.props[propIndex].isInFlight() &&
                this.props[propIndex].location.juggler == this.jugglers[jugglerIndex].id &&
                this.props[propIndex].location.hand == currentHand;
        }
    }
}