const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// Global Variables
const cellSize = 100;
const cellGap = 1;
let defenderCost = 100;
let frame = 0;
let numberOfResources = 500;
let enemiesInterval = 600;
let score = 0;
let gameOver = false;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];


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

//game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw() { // Setting up the highlighting of cells
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

// projectiles
class Projectiles {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = 20;
        this.speed = 10;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

const handleProjectiles = () => {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && isCollision(projectiles[i], enemies[j])) {
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// defenders
class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shoot = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'gold';
        ctx.font = '20px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 25);
    }
    update() {
        this.timer++;
        if (this.shoot === true) {
            if (this.timer % 100 === 0) {
                projectiles.push(new Projectiles(this.x + 70, this.y + 50));
            }
        } else {
            this.timer = 0;
        }
    }
}

canvas.addEventListener('click', e => {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) { // Error handler if user clicks on HUD
        return;
    }
    for (let i = 0; i < defenders.length; i++) { // Check that clicked spot do not have an existing defender
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
            return;
        }
    }
    let defenderCost = 100;
    if (numberOfResources >= defenderCost) {
        defenders.push(new Defender(gridPositionX, gridPositionY))
        numberOfResources -= defenderCost;
    }
})

const handleDefenders = () => {
    for (let i = 0; i < defenders.length; i++) {
        defenders[i].draw();
        defenders[i].update();

        if (enemyPositions.indexOf(defenders[i].y) !== -1) {
            defenders[i].shoot = true;
        } else {
            defenders[i].shoot = false;
        }

        for (let j = 0; j < enemies.length; j++) {
            if (defenders[i] && isCollision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.5;
            }
            if (defenders[i] && defenders[i].health <= 0) {
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}


// enemies
class Enemy {
    constructor(verticalPosition) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = Math.random() * 2 + 0.4;
        this.movement = this.speed;
        this.health = 100;
        this.maxHealth = this.health;
    }
    update() {
        this.x -= this.movement;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}

const handleEnemies = () => {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 2;
            score += gainedResources;
            numberOfResources += gainedResources;
            const getIndex = enemyPositions.indexOf(enemies[i].y);
            enemyPositions.splice(getIndex, 1)
            enemies.splice(i, 1);
            i--;
        }
    }
    if (frame % enemiesInterval === 0) {
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap; // Enemy Spawn Location
        enemies.push(new Enemy(verticalPosition))
        enemyPositions.push(verticalPosition);
        if (enemiesInterval > 120) enemiesInterval -= 100;
        }
}

// Utilities
const handleGameStatus = () => {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText("Resources: " + numberOfResources, 20, 80);
    ctx.fillText("Score: " + score, 20, 40);
    if (gameOver === true) {
        alert("GAME OVER!");
        alert(`Your Score is ${score}`)
    }
}

window.addEventListener('resize', () => {
    canvasPosition = canvas.getBoundingClientRect();
})

// Collision Function //
const isCollision = (first, second) => {
    if (!(first.x > second.x + second.width ||
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
    ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleProjectiles();
    handleEnemies();
    handleGameStatus();
    frame++;
    if (gameOver === false) {
        requestAnimationFrame(animate)
    };
}

animate();