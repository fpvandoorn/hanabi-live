/*
    Arrows are used to show which cards are touched by a clue
    (and to highlight things in shared replays)
*/

// Imports
const globals = require('./globals');
const graphics = require('./graphics');

class Arrow extends graphics.Group {
    constructor() {
        // Constants
        const winW = globals.stage.getWidth();
        const winH = globals.stage.getHeight();

        const x = 0.1 * winW;
        const y = 0.1 * winH;
        super({
            x,
            y,
            offset: {
                x,
                y,
            },
            visible: false,
        });

        // Class variables
        this.pointingTo = null;
        this.tween = null;

        const pointerLength = 0.006 * winW;

        // We want there to be a black outline around the arrow,
        // so we draw a second arrow that is slightly bigger than the first
        const border = new graphics.Arrow({
            points: [
                x,
                0,
                x,
                y * 0.8,
            ],
            pointerLength,
            pointerWidth: pointerLength,
            fill: 'black',
            stroke: 'black',
            strokeWidth: pointerLength * 2,
            shadowBlur: pointerLength * 4,
            shadowOpacity: 1,
        });
        this.add(border);

        // The border arrow will be missing a bottom edge,
        // so draw that manually at the bottom of the arrow
        const edge = new graphics.Line({
            points: [
                x - pointerLength,
                0,
                x + pointerLength,
                0,
            ],
            fill: 'black',
            stroke: 'black',
            strokeWidth: pointerLength * 0.75,
        });
        this.add(edge);

        // The main (inside) arrow is exported so that we can change the color later
        this.base = new graphics.Arrow({
            points: [
                x,
                0,
                x,
                y * 0.8,
            ],
            pointerLength,
            pointerWidth: pointerLength,
            fill: 'white',
            stroke: 'white',
            strokeWidth: pointerLength * 1.25,
        });
        this.add(this.base);

        // A circle will appear on the body of the arrow to indicate the type of clue given
        this.circle = new graphics.Circle({
            x,
            y: y * 0.3,
            radius: pointerLength * 2.25,
            fill: 'black',
            stroke: 'white',
            strokeWidth: pointerLength * 0.25,
            visible: false,
            listening: false,
        });
        this.add(this.circle);

        // The circle will have text inside of it to indicate the number of the clue given
        this.text = new graphics.Text({
            x,
            y: y * 0.3,
            offset: {
                x: this.circle.getWidth() / 2,
                y: this.circle.getHeight() / 2,
            },
            width: this.circle.getWidth(),
            // For some reason the text is offset if we place it exactly in the middle of the
            // circle, so nudge it downwards
            height: this.circle.getHeight() * 1.09,
            fontSize: y * 0.38,
            fontFamily: 'Verdana',
            fill: 'white',
            align: 'center',
            verticalAlign: 'middle',
            visible: false,
            listening: false,
        });
        this.add(this.text);
    }
}

module.exports = Arrow;
