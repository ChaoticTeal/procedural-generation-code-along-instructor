/**
 *  @NOTE The code in this file pertains to generating islands in the grid
 *  These functions are called in sketch.js, and we don't need to change anything here!
 */

// The number of rows and columns we want our grid to have
let boxes = 50;

// Properties to apply to the island generator
let islandProperties = {
    minDim: boxes/10,
    maxDim: boxes/2,
    minCount: 6,
    maxCount: 15
};
// The starting chance to break a generation loop early
let breakChance = 0.1;
// The chance per neighbor to change states
let neighborChance = 0.05;
// The minimum number of neighbors to allow
let minNeighbors = 1.5;
// Used for the pure randomization function
let onChance = 0.2;
// The grid we're working with
let myGrid;

/**
 * Runs all the necessary setup functions on the grid.
 * Generates islands, weathers the grid with both land and water,
 * and cleans up stray boxes
 * 
 * @param {number} canvasDimensions The width and height of the canvas, in pixels
 * @param {number} margin The numbwr of boxes around the edge to keep in the water state
 * 
 * @returns {Grid} The finished grid
 */
function initializeGrid(canvasDimensions, margin) {
    myGrid = new Grid(boxes, canvasDimensions, margin);

    // Add islands to the grid
    generateIslands();

    // Weather the islands
    weatherGrid(
        weatheringPasses,
        BoxStates.water,
        BoxStates.land
    );
    weatherGrid(
        weatheringPasses,
        BoxStates.land,
        BoxStates.water
    );

    // Clean up stray boxes
    cleanGrid();
}

/**
 * Generates islands (rectangular chunks of boxes in the land state) in the given grid
 * Uses a random chance to stop early, so it won't always generate the maximum number
 * Note that these islands *will* overlap!
 * If we wanted to prevent this, we could save a list of islands and 
 * compare new ones to the existing ones as well as the main grid
 */
 function generateIslands() {
    // Loop until we have the maximum number of islands (or we break out early)
    for(let islands = 0; islands < islandProperties.maxCount; islands++) {
        // Define a new island object with upper left corner point and dimensions
        let newIsland = {
            cornerX: 0,
            cornerY: 0,
            width: 0,
            height: 0
        };

        // Generate random coordinates within the grid margins
        // Make sure there's room for at least a minimally sized island
        newIsland.cornerX = randomNumberGenerator(
            myGrid.lowMargin, 
            myGrid.highXMargin - islandProperties.minDim);
        newIsland.cornerY = randomNumberGenerator(
            myGrid.lowMargin, 
            myGrid.highYMargin - islandProperties.minDim);

        // Generate random dimenstions within the min/max
        // Since the RNG max is exclusive, we add 1 to maxDim here
        newIsland.width = randomNumberGenerator(
            islandProperties.minDim, 
            islandProperties.maxDim + 1);
        newIsland.height = randomNumberGenerator(
            islandProperties.minDim, 
            islandProperties.maxDim + 1);

        // Make sure the island fits within the margins and resize if necessary
        if(newIsland.cornerX + newIsland.width > myGrid.highXMargin) {
            newIsland.width = myGrid.highXMargin - newIsland.cornerX;
        }
        if(newIsland.cornerY + newIsland.height > myGrid.highYMargin) {
            newIsland.height = myGrid.highYMargin - newIsland.cornerY;
        }

        // Loop through all the boxes within the newly-created island and set their states to land
        for(let x = newIsland.cornerX; x < newIsland.cornerX + newIsland.width; x++) {
            for(let y = newIsland.cornerY; y < newIsland.cornerY + newIsland.height; y++) {
                myGrid.boxArray[x][y].setState(BoxStates.land);
            }
        }
        
        // Set the current chance to break the loop based on how close the number of islands is to the max
        // This looks scary, but we're scaling it so the chance only reaches 1 (100%) when we reach the max
        if(islands > islandProperties.minCount && islands < islandProperties.maxCount) {
            let currentStopChance = breakChance + 
                ((1 - breakChance) / 
                ((islandProperties.maxCount - islandProperties.minCount) - 
                (islands - islandProperties.minCount)));

            // Math.random() generates a decimal between [0, 1), so we can compare it to another decimal for a % chance event
            if(Math.random() < currentStopChance) {
                console.log(`Stopped after ${islands + 1} islands`);
                break;
            }
        }
    }
}

/**
 * Shifts box states based on neighboring tile states
 * 
 * @param {number} passes The number of times to run inner and outer weathering loops
 * @param {string} checkedState The current state of the boxes we're looking for
 * @param {string} newState The state to compare and change boxes to
 */
function weatherGrid(passes, checkedState, newState) {
    // Push more land out along the edges of the islands
    for(let i = 0; i < passes; i++) {
        // Save the current grid so the step is fully working from the original grid state
        let formerGrid = myGrid.statesArray();
        // Loop through *formerGrid*
        for(let x = myGrid.lowMargin; x < myGrid.highXMargin; x++) {
            for(let y = myGrid.lowMargin; y < myGrid.highYMargin; y++) {
                // If the current box in the formerGrid has the state we're looking for...
                if(formerGrid[x][y] === checkedState) {
                    // ...Check how many neighbors have the target state...
                    let neighbors = checkNeighbors(formerGrid, x, y, newState);
                    // ...and randomly change them to the target state
                    if(Math.random() < neighborChance * neighbors) {
                        myGrid.boxArray[x][y].setState(newState);
                    }
                }
            }
        }
    }
}

/**
 * Loops through a grid to eliminate stray blocks
 */
function cleanGrid() {
    for(let x = myGrid.lowMargin; x < myGrid.highXMargin; x++) {
        for(let y = myGrid.lowMargin; y < myGrid.highYMargin; y++) {
            let currentBox = myGrid.boxArray[x][y];
            let neighbors = checkNeighbors(myGrid.statesArray(), x, y, currentBox.currentState);
            if(neighbors < minNeighbors) {
                switch(currentBox.currentState) {
                    case BoxStates.land:
                        currentBox.setState(BoxStates.water);
                        break;
                    case BoxStates.water:
                        currentBox.setState(BoxStates.land);
                        break;
                }
            }
        }
    }
}

/**
 * Loops through the given grid and randomly sets boxes to land
 * If we run this, we can see that there's not a lot of "procedure" here--it's just rolling a die a lot
 */
function randomizeGrid() {
    // Loop through each Box in the Grid and randomly assign some of the boxes as land
    for(let x = myGrid.lowMargin; x < myGrid.highXMargin; x++){
        for(let y = myGrid.lowMargin; y < myGrid.highYMargin; y++){
            if(Math.random() < onChance){
                myGrid.boxArray[x][y].setState(BoxStates.land);
            }
        }
    }
}

/**
 * Checks the cells immediately adjacent to one particular cell in the given grid
 * Totals the number of neighbors with the given state (diagonal neighbors count as half)
 * 
 * @param {Grid} arrayToCheck The grid to evaluate neighbors in
 * @param {number} x The x-position of the cell in question
 * @param {number} y The y-position of the cell in question
 * @param {string} checkState The state we're looking for in neighbors 
 * 
 * @returns {number} The number of matching neighbors
 */
function checkNeighbors(arrayToCheck, x, y, checkState){
    let neighbors = 0;
    // Loop through the three columns centered on our cell
    for(let a = -1; a < 2; a++){
        // Make sure we're checking columns within the grid
        if(x + a < 0 || x + a >= myGrid.width){
        } else {
            // Loop through the three rows centered on our cell
            for(let b = -1; b < 2; b++){ 
                // Again, make sure we're staying within the grid
                // Also make sure we don't count our starting tile
                if(y + b < 0 || y + b >= myGrid.height){
                } else if(a === 0 && b === 0){
                } else {
                    // Check the current state of the neighboring cell
                    if(arrayToCheck[x + a][y + b] === checkState){
                        // If the absolute values match, we're looking at a diagonal neighbor, which should have less influence
                        if(Math.abs(a) === Math.abs(b)) {
                            neighbors += 0.5;
                        } else {
                            // Fully increment neighbors if a non-diagonal neighbor matches
                            neighbors++;
                            // An ungodly amount of closing brackets
                        }
                    }
                }
            }
        }
    }
    return neighbors;
}

/**
 * Generates a random number in the range [min, max)
 * 
 * @param {number} min The inclusive lower bound of the range
 * @param {number} max The exclusive upper bound of the range
 * 
 * @returns {number} The randomly generated number
 */
function randomNumberGenerator(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}