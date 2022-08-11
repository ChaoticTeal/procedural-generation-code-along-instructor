let waterColor;
let landColor;
let treeColor;

/**
 *  Define a list of valid states for boxes
 *  Use this instead of manually retyping strings to reduce errors
 */
const BoxStates = {
    water : "water",
    land : "land",
    tree : "tree"
}

/**
 *  Holds a grid of boxes to display on the canvas
 */
 class Grid {
    /**
     *  Initializes an n x n grid of boxes, where n is the boxesPerRow parameter
     *  @param {number} boxesPerRow The desired number of boxes per row/column of the grid 
     *  @param {number} canvasDim The width and height of the p5 canvas
     */
    constructor(boxesPerRow, canvasDim, margin){
        // Initialize boxArray outside of the loop so we can push to it
        this.boxArray = [];

        // Set width and height
        // Right now, these are the same, but using different variables helps future-proof
        this.width = boxesPerRow;
        this.height = boxesPerRow;

        // Save margins as easily accessible variables to reduce later calculations
        // Since both width and height start at 0, the low margins match
        this.lowMargin = margin;
        this.highXMargin = this.width - margin;
        this.highYMargin = this.height - margin;

        // Use a nested for loop to iterate in two dimensions
        // The outer loop moves along columns of the grid
        for(let x = 0; x < this.width; x++){
            // Again, initialize the temporary array outside the loop
            // The temporary array is a single column of the grid
            let temp = [];

            // Calculate the box dimensions from the canvas dimensions and the desired number of boxes
            let dim = canvasDim/boxesPerRow;

            /** The inner loop moves along rows
            *   Because this loop is inside the other, a 5x5 grid fills in this order:
            *   
            *       x ->
            *     y 1   6   11  16  21 
            *     | 2   7   12  17  22
            *     v 3   8   13  18  23
            *       4   8   14  19  24
            *       5   10  15  20  25
            */
            for(let y = 0; y < this.height; y++){
                /**
                 *  Push a new box to the temporary array
                 *  The x and y coordinates of the upper left corner are the box dimensions * x and y, respectively
                 *  (Thus, the first box will have a corner at (0, 0))
                 *  Then the dimensions are what we calculated before
                 *  Note that we don't include an initState, so it defaults to "water" per line 179
                 */
                temp.push(new Box(dim * x, dim * y, dim));
            }
            // Add the completed column to the array
            this.boxArray.push(temp);
        }
    }

    /**
     *  Loop through every Box in the array and call its drawBox() function
     */
    display() {
        // The Box class contains a drawBox() function to handle its own fill color, coordinates, and size
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                this.boxArray[x][y].drawBox();
            }
        }
    }

    /**
     *  Returns an array of equal dimensions to the boxArray with only the states of the respective boxes
     */
    statesArray() {
        let states = [];
        for(let x = 0; x < this.width; x++) {
            let temp = []
            for(let y = 0; y < this.height; y++) {
                temp.push(this.boxArray[x][y].currentState);
            }
            states.push(temp);
        }
        return states;
    }
}

/**
 *  A single box, for use in a Grid
 */
class Box {

    // These three colors should be inherent to boxes, as nothing else needs them

    /**
     * 
     *  @param {number} xPos The horizontal position of the box's upper left corner
     *  @param {number} yPos The vertical position of the box's upper left corner
     *  @param {number} width The box's width
     *  @param {string} initState The box's starting state (optional, defaults to "off")
     */
    constructor(xPos, yPos, width, initState) {
        this.cornerX = xPos;
        this.cornerY = yPos;
        this.dimensions = width;
        this.currentState;
        this.fillColor;
        /** Ternary operator (?) is essentially a condensed if/else statement
        *   This allows us to provide one of two values depending on the condition
        *   Basic syntax: [condition] ? [value if true] : [value if false]
        *   
        *   In this case, if initState is undefined, we setState to "water", otherwise we set it to initState
        *   This prevents currentState from being undefined even if an initState is not provided
        */
        this.setState(initState === undefined ? BoxStates.water : initState);
    }

    /**
     *  Draws the box using its specified coordinates, dimensions, and color
     */
    drawBox() {
        fill(this.fillColor);
        rect(this.cornerX, this.cornerY, this.dimensions, this.dimensions);
    }

    /**
     *  Uses the box's currentState to determine a fill color
     *  @returns A p5 color value
     */
    getColorFromState() {
        switch(this.currentState){
            case BoxStates.water:
                return waterColor;
            case BoxStates.land:
                return landColor;
            case BoxStates.tree:
                return treeColor;
        }
    }

    /**
     *  Set the currentState value and update the fill color to match
     *  @param {string} newState The state to assign to currentState
     */
    setState(newState) {
        this.currentState = newState;
        this.fillColor = this.getColorFromState();
    }
}