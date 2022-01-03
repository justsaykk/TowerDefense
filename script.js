const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

/* Global Variables */
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}

class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        ctx.strokeStyle = 'black';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

const createGrid = () => {
    for (let i = cellSize; i < canvas.height; i += cellSize) {
        for (let j = 0; j < canvas.width; j += cellSize) {
            gameGrid.push(new Cell(j, i));
        }
    }
}
createGrid();

const handleGameGrid = () => {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}


// projectiles
// defenders
// enemies
//resources
// utilities
const animate = () => {
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width,controlsBar.height);
    handleGameGrid();
    requestAnimationFrame(animate);
}

animate(); 