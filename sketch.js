// Use a variable to define our canvas width and height
// This makes it easier to adjust and reference dimensions in code
let canvasDimensions = 500;
// A reference to the main canvas
let canvas;
// The number of water boxes we want around the outside of whatever we generate
let margin = 2;

// The number of weathering passes to make
let weatheringPasses = 10;

let generations = 1;

function setup(){
    // These three colors are declared in grid.js and initialized here
    waterColor = color(0, 112, 236);
    landColor = color(128, 208, 16);
    treeColor = color(0, 168, 0);

    // Standard p5 setup
    canvas = createCanvas(canvasDimensions, canvasDimensions);
    background(0);
    noStroke();

    /**
     *  @NOTE The initializeGrid() function, along with the functions it calls,
     *  are all defined in islands.js. We'll put our new work in here!
     */
    initializeGrid(canvasDimensions, margin);
    placeTrees(4, 15);
    textSize(20);
}

function draw(){
    myGrid.display();
    fill(0);
    text(`Generation ${generations}`, 10, 25);
}

/**
 *  @TODO Write a function that places random trees on the grid
 *      1. The function should take two parameters:
 *          a) minTrees - The minimum number of trees to place
 *          b) maxTrees - The maximum number of trees to place
 *      2. Pick a random (X, y) coordinate within the grid
 *          a) If the box at that location in the grid is water or a tree, pick again
 *          b) If it's land, make it a tree
 *      3. Put step 3 in a loop that ends after it runs maxTrees times
 *      4. For extra variety, add a random check after placing at least the
 *          minimum number of trees to exit the loop early
 *      5. Call the function in setup() to add trees to the grid!
 */

function placeTrees(minTrees, maxTrees) {
    let treeBox;
    for(let i = 0; i < maxTrees; i++) {
        let valid = false;
        while(!valid){
            treeX = randomNumberGenerator(myGrid.lowMargin, myGrid.highXMargin);
            treeY = randomNumberGenerator(myGrid.lowMargin, myGrid.highYMargin);
            treeBox = myGrid.boxArray[treeX][treeY];
            valid = treeBox.currentState === BoxStates.land;
        }
        treeBox.setState(BoxStates.tree);
        if(i >= minTrees) {
            let currentStopChance = breakChance + 
                ((1 - breakChance) / ((maxTrees - minTrees) - (i - minTrees)));
            if(Math.random() < currentStopChance) {
                break;
            }
        }
    }
}

/**
 *  @TODO Write a function that spreads more trees on the grid each time it runs
 *      1. This function should take a single parameter:
 *          a) spreadChance - The chance for a land box to switch to a tree.
 *              This chance will be compounded for each neighboring tree (up to 6x),
 *              so it should be a fairly low decimal
 *      2. Loop through each box on the grid
 *      3. On land boxes, check the number of neighboring trees
 *          HINT: There's a function in islands.js that will help!
 *      4. Switch the land tile to a tree depending on spreadChance and
 *          the number of neighboring trees
 */

function spreadTrees(spreadChance) {
    for(let x = myGrid.lowMargin; x < myGrid.highXMargin; x++) {
        for(let y = myGrid.lowMargin; y < myGrid.highYMargin; y++) {
            let currentBox = myGrid.boxArray[x][y];
            if(currentBox.currentState === BoxStates.land) {
                let neighbors = checkNeighbors(myGrid.statesArray(), x, y, BoxStates.tree);
                if(Math.random() < neighbors * spreadChance) {
                    currentBox.setState(BoxStates.tree);
                }
            }
        }
    }
}

/**
 *  @TODO Call the function to spread trees on the press of a key
 *      Note that our previous method of checking a pressed key runs
 *      every frame that the key is pressed, which isn't what we want!
 */

function keyReleased() {
    if(keyCode === 32) {
        spreadTrees(0.15);
        generations++;
    }
}