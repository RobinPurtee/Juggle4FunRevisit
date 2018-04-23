import {RIGHT_HAND, LEFT_HAND} from './Toss.js'
import {Juggler} from './Juggler.js'
import {PropList} from './Prop.js'

export class Pattern{
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