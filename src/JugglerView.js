import {JugglerPosition} from "./JugglerPosition.js"

// The object to manage the display of a Juggler
export class JugglerView{
    constructor(svgRoot_, name_, position_) {
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
