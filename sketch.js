let canvasDimensions = 500;
let boxes = 50;
let generationPasses = 5;
let onChance = 0.2;
let neighborModifier = 0.05;
let offColor;
let onColor;
let grid;

function setup(){
    offColor = color(0, 0, 0);
    onColor = color(255, 255, 255);
    createCanvas(canvasDimensions, canvasDimensions);
    background(0);
    noStroke();
    grid = generateGridColors(new Grid(boxes), generationPasses);
}

function draw(){
    grid.display();
}

function generateGridColors(gridToModify, passes) {
    let modifiedGrid = gridToModify;
    // Pass 0
    for(let x = 0; x < modifiedGrid.boxArray.length; x++){
        for(let y = 0; y < modifiedGrid.boxArray[0].length; y++){
            if(Math.random() < onChance){
                modifiedGrid.boxArray[x][y].fillColor = onColor;
            }
        }
    }
    // Grow the activated boxes by {passes} generations
    for(let g = 0; g < passes; g++){
        modifiedGrid = advanceGeneration(modifiedGrid);
    }
    return modifiedGrid;
}

function advanceGeneration(gridToAdvance) {
    modifiedGrid = gridToAdvance;
    for(let x = 0; x < modifiedGrid.boxArray.length; x++){
        for(let y = 0; y < modifiedGrid.boxArray[0].length; y++){
            if(modifiedGrid.boxArray[x][y].fillColor === onColor){
            } else {
                let flipChance = 0;
                let neighbors = checkNeighbors(gridToAdvance, x, y);
                flipChance += neighborModifier * neighbors;
                if(Math.random() < flipChance){
                    modifiedGrid.boxArray[x][y].fillColor = onColor;
                }
            }
        }
    }
    return modifiedGrid;
}

/**
 * 
 * @param {Grid} gridToCheck The grid to evaluate neighbors in
 * @param {number} x The x-position of the cell in question
 * @param {number} y The y-position of the cell in question
 * 
 * @return {number} The number of active neighbors
 */
function checkNeighbors(gridToCheck, x, y){
    let neighbors = 0;
    for(let a = -1; a < 2; a++){
        if(x + a < 0 || x + a >= gridToCheck.boxArray.length){
        } else {
            for(let b = -1; b < 2; b++){ 
                if(y + b < 0 || y + b >= gridToCheck.boxArray.length){
                } else if(a === 0 && b === 0){
                } else {
                    if(gridToCheck.boxArray[x + a][y + b].fillColor === onColor){
                        if(Math.abs(a) === Math.abs(b)) {
                            neighbors += 0.5;
                        } else {
                            neighbors++;
                        }
                    }
                }
            }
        }
    }
    return neighbors;
}

class Grid {
    /**
     * 
     * @param {number} boxesPerRow The desired number of boxes per row/column of the grid 
     */
    constructor(boxesPerRow){
        this.boxArray = [];
        for(let a = 0; a < boxesPerRow; a++){
            let temp = [];
            let dim = canvasDimensions/boxesPerRow;
            for(let b = 0; b < boxesPerRow; b++){
                temp.push(new Box(dim * a, dim * b, dim));
            }
            this.boxArray.push(temp);
        }
    }

    display() {
        for(let x = 0; x < this.boxArray.length; x++) {
            for(let y = 0; y < this.boxArray[0].length; y++) {
                this.boxArray[x][y].drawBox();
            }
        }
    }
}

class Box {
    /**
     * 
     * @param {number} xPos The horizontal position of the box's upper left corner
     * @param {number} yPos The vertical position of the box's upper left corner
     * @param {number} width The box's width
     * @param {color} color The box's starting color
     */
    constructor(xPos, yPos, width, fColor) {
        this.cornerX = xPos;
        this.cornerY = yPos;
        this.dimensions = width;
        this.fillColor = fColor === undefined ? offColor : fColor;
    }

    drawBox() {
        fill(this.fillColor);
        rect(this.cornerX, this.cornerY, this.dimensions, this.dimensions);
    }
}