"use strict"
import {RIGHT_HAND, LEFT_HAND, PASS, DIAGONAL, SELF, HEFF, TossException, Toss} from './Toss.js'
import {Hand} from './Hand.js'
//-------------------------------------------------------------------------------------
// Object that represents a Juggler
// parameters:
//  id_ - single charater Id of the juggler used
//  tossRow_ - the DOM Table Row element containing the list of tosses for this juggler
//  name_ - optional name for the juggler

// A Juggler waits for a "catch" with a Toss parameter, then executes a toss by incrementing
// the currentToss indexer, then based on the Toss in the catch will toggle the current hand.
export class Juggler{
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
