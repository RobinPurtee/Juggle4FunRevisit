"use strict"
// hand strings
export const RIGHT_HAND = "R";
export const LEFT_HAND = "L";
// Toss direction strings
export const PASS = "P";
export const DIAGONAL = "D";
export const SELF = "S";
export const HEFF = "H";


//-----------------------------------------------------------------------------
export class TossException{
    constructor(toss_, message_) {
        this.toss = toss_;
        this.message = message_;
    }
}

//-----------------------------------------------------------------------------
// The object that represents a Toss
// parameters:
//      direction_ - A Toss direction string (maybe a full Toss string)
//      magnitude_ - This siteswap value of the pass (optional: defaults to 3)
//      juggler_   - The name of the destination juggler (optional: defaults to "A")

export class Toss{
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

