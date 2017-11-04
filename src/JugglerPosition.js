
// class holding the position of the juggler and the angle it is facing
// param: x_ - the x coordinate of the position
// param: y_ - the y coordinate of the position
// param: angle_ - the angle of the front of the juggler
export class JugglerPosition{
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
