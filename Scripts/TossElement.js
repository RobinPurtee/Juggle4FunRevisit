function TossElement(svgPath) {
    this.pathElement = svgPath;
}

TossElement.prototype.SetDisplay = function(show) {
    let state = "none";
    if (show === true) {
        state = "inline";
    }
    this.pathElement.setAttribute("display", state);
}

TossElement.prototype.Show = function() {
    this.SetDisplay(true);
}
TossElement.prototype.Hide = function() {
    this.SetDisplay(false);
}