"use strict"
import {Toss, RIGHT_HAND, LEFT_HAND} from 'Toss'
//import {Hand} from 'Hand'
//-----------------------------------------------------------------------------
// The Prop class represents a prop in the pattern
// Properties:
//  id - the id of the prop
//  location - If not null it references the toss the prop is current executing. If null then the prop is in a hand or on the floor
export class Prop{
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
export class PropList {
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
        this.list.forEach(function(prop_) {
            if (prop_.isInFlight()) {
                ++numberPropsInFlight;
            }
        }, this);
        return numberPropsInFlight;
    }
}

