var Mouse = function(x, y) {
    this.x = x;
    this.y = y;

    this.ox = x;
    this.oy = y;

    this.isDown = false;

    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
};

Mouse.prototype = {
    onMouseMove: function(e) {
        this.ox = this.x;
        this.oy = this.y;
        this.x = e.clientX;
        this.y = e.clientY;
    },

    onMouseUp: function(e) {
        this.isDown = false;
    },

    onMouseDown: function(e) {
        this.isDown = true;
    }
};