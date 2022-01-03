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
    draw(){ // Setting up the highlighting of cells
        if (mouse.x && mouse.y && isCollision(this, mouse)) {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}

const createGrid = () => {
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for (let x = 0; x < canvas.width; x += cellSize) {
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();

const handleGameGrid = () => {
    for (let i = 0; i < gameGrid.length; i++) {
        gameGrid[i].draw();
    }
}

// mouse
const mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1,
}

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', e => {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', () => {
    mouse.x = undefined;
    mouse.y = undefined;
})




// projectiles
// defenders
// enemies
//resources
/* Utilities */

// Collision Function //
const isCollision = (first, second) => {
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    }
}
/////


const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0,controlsBar.width,controlsBar.height);
    handleGameGrid();
    requestAnimationFrame(animate);
}
animate(); 