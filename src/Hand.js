import {RIGHT_HAND, LEFT_HAND, PASS, DIAGONAL, SELF, HEFF, TossException, Toss} from 'Toss'


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
export class Hand {
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

export {Hand}