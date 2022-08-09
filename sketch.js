// Use a variable to define our canvas width and height
// This makes it easier to adjust and reference dimensions in code
let canvasDimensions = 500;
// A reference to the main canvas
let canvas;
// The number of rows and columns we want our grid to have
let boxes = 50;
// The number of water boxes we want around the outside of whatever we generate
let margin = 2;
// A Grid we'll initialize in setup()
let grid;
// Properties to apply to the island generator
let islandProperties = {
    minDim: 5,
    maxDim: 20,
    minCount: 6,
    maxCount: 15
};
// The starting chance to break a generation loop early
let breakChance = 0.1;

let onChance = 0.2;

function setup(){
    // These three colors are declared in grid.js and initialized here
    waterColor = color(0, 112, 236);
    landColor = color(128, 208, 16);
    treeColor = color(0, 168, 0);

    // Standard p5 setup
    canvas = createCanvas(canvasDimensions, canvasDimensions);
    background(0);
    noStroke();

    // Create a new boxes x boxes grid
    // We use canvasDimensions to determine the size of each box
    grid = new Grid(boxes, canvasDimensions, margin);
    // Add islands to the grid
    grid = generateIslands(
        grid, 
        islandProperties.minCount, 
        islandProperties.maxCount, 
        islandProperties.minDim, 
        islandProperties.maxDim, 
        breakChance
        );
}

function draw(){
    grid.display();
}

// Save a screenshot by pressing space
// function keyReleased() {
//     if(keyCode === 32) {
//         save(canvas, `images/myCanvas${Date.now()}`);
//     }
// }

/**
 * Generates islands (rectangular chunks of boxes in the "land" state) in the given grid
 * Uses a random chance to stop early, so it won't always generate the maximum number
 * Note that these islands *will* overlap!
 * If we wanted to prevent this, we could save a list of islands and 
 * compare new ones to the existing ones as well as the main grid
 * 
 * @param {Grid} gridToModify The grid to generate islands in
 * @param {number} maxIslands The maximum number of islands to generate
 * @param {number} minDim The minimum width or height of an island
 * @param {number} maxDim The maximum width or height of an island
 * @param {number} stopChance The chance to stop after each island. Increases with each successive island
 * 
 * @returns The grid, now with islands
 */
function generateIslands(gridToModify, minIslands, maxIslands, minDim, maxDim, stopChance) {
    // Loop until we have the maximum number of islands (or we break out early)
    for(let islands = 0; islands < maxIslands; islands++) {
        // Define a new island object with upper left corner point and dimensions
        let newIsland = {
            cornerX: 0,
            cornerY: 0,
            width: 0,
            height: 0
        };

        // Generate random coordinates within the grid margins
        // Make sure there's room for at least a minimally sized island
        newIsland.cornerX = randomNumberGenerator(gridToModify.lowMargin, gridToModify.highXMargin - minDim);
        newIsland.cornerY = randomNumberGenerator(gridToModify.lowMargin, gridToModify.highYMargin - minDim);

        // Generate random dimenstions within the min/max
        // Since the RNG max is exclusive, we add 1 to maxDim here
        newIsland.width = randomNumberGenerator(minDim, maxDim + 1);
        newIsland.height = randomNumberGenerator(minDim, maxDim + 1);

        // Make sure the island fits within the margins and resize if necessary
        if(newIsland.cornerX + newIsland.width > gridToModify.highXMargin) {
            newIsland.width = gridToModify.highXMargin - newIsland.cornerX;
        }
        if(newIsland.cornerY + newIsland.height > gridToModify.highYMargin) {
            newIsland.height = gridToModify.highYMargin - newIsland.cornerY;
        }

        // Loop through all the boxes within the newly-created island and set their states to "land"
        for(let x = newIsland.cornerX; x < newIsland.cornerX + newIsland.width; x++) {
            for(let y = newIsland.cornerY; y < newIsland.cornerY + newIsland.height; y++) {
                gridToModify.boxArray[x][y].setState("land");
            }
        }
        
        // Set the current chance to break the loop based on how close the number of islands is to the max
        // This looks scary, but we're scaling it so the chance only reaches 1 (100%) when we reach the max
        if(islands > minIslands && islands < maxIslands) {
            let currentStopChance = stopChance + ((1 - stopChance) / ((maxIslands - minIslands) - (islands - minIslands)));
            // Math.random() generates a decimal between [0, 1), so we can compare it to another decimal for a % chance event
            if(Math.random() < currentStopChance) {
                console.log(`Stopped after ${islands + 1} islands`);
                break;
            }
        }
    }

    return gridToModify;
}

/**
 * Loops through the given grid and randomly sets boxes to land
 * If we run this, we can see that there's not a lot of "procedure" here--it's just rolling a die a lot
 * 
 * @param {Grid} gridToModify The grid to randomly populate
 * 
 * @returns The randomly populated grid
 */
function randomizeGrid(gridToModify) {
    let modifiedGrid = gridToModify;
    // Loop through each Box in the Grid and randomly assign some of the boxes as land
    for(let x = gridToModify.lowMargin; x < modifiedGrid.highXMargin; x++){
        for(let y = gridToModify.lowMargin; y < modifiedGrid.highYMargin; y++){
            if(Math.random() < onChance){
                modifiedGrid.boxArray[x][y].setState("land");
            }
        }
    }
    return modifiedGrid;
}

/**
 * Checks the cells immediately adjacent to one particular cell in the given grid
 * Totals the number of neighbors with the given state (diagonal neighbors count as half)
 * 
 * @param {Grid} gridToCheck The grid to evaluate neighbors in
 * @param {number} x The x-position of the cell in question
 * @param {number} y The y-position of the cell in question
 * @param {string} checkState The state we're looking for in neighbors 
 * 
 * @return {number} The number of matching neighbors
 */
function checkNeighbors(gridToCheck, x, y, checkState){
    let neighbors = 0;
    // Loop through the three columns centered on our cell
    for(let a = -1; a < 2; a++){
        // Make sure we're checking columns within the grid
        if(x + a < 0 || x + a >= gridToCheck.width){
        } else {
            // Loop through the three rows centered on our cell
            for(let b = -1; b < 2; b++){ 
                // Again, make sure we're staying within the grid
                // Also make sure we don't count our starting tile
                if(y + b < 0 || y + b >= gridToCheck.height){
                } else if(a === 0 && b === 0){
                } else {
                    // Check the current state of the neighboring cell
                    if(gridToCheck.boxArray[x + a][y + b].currentState === checkState){
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
 * @param {number} min 
 * @param {number} max 
 */
function randomNumberGenerator(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}