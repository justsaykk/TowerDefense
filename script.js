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
let enemiesInterval = 1000;
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
    draw() {                                                                                    // Setting up the highlighting of cells
        if (mouse.x && mouse.y && collision(this, mouse)) {
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
const defenderBullet = new Image();
defenderBullet.src = "pixelalien/bullet.png";

class Projectiles {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.power = 20;
        this.speed = 10;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 12;
        this.spriteHeight = 64;
        this.spriteWidth = 64;
    }
    update() {
        this.x += this.speed;
    }
    draw() {
        ctx.beginPath();
        ctx.drawImage(defenderBullet, this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

const handleProjectiles = () => {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
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
const defenderIdle = new Image();
defenderIdle.src = "pixelalien/defender.png";        // 13 frames

class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shoot = false;
        this.shootNow = false;
        this.health = 100;
        this.projectiles = [];
        this.timer = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 12;
        this.spriteHeight = 192;
        this.spriteWidth = 192;
    }

    draw() {
        ctx.drawImage(defenderIdle,
            this.frameX * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x, this.y,
            this.width, this.height)

        if (this.health === 100) {                                                      // Hide health if its full (reduce screen clutter)
            return;
        } else {
            ctx.fillStyle = 'gold';
            ctx.font = '20px Arial';
            ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 25);
        }

    }
    update() {
        this.timer++;
        let defPopulation = defenders.length;
        if (frame % 4 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = this.minFrame;
            }
        }
        if (this.shoot === true) {
            if (this.timer % Math.floor((100 + (defPopulation ** 1.5))) === 0) {      // More defender = slower shooting
                projectiles.push(new Projectiles(this.x + 70, this.y + 30));
            }
        } else {
            this.timer = 0;
        }
    }
}

canvas.addEventListener('click', e => {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) {                                                 // Error handler if user clicks on HUD
        return;
    }
    for (let i = 0; i < defenders.length; i++) {                                    // Check that clicked spot do not have an existing defender
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
            if (defenders[i] && collision(defenders[i], enemies[j])) {
                enemies[j].movement = 0;
                defenders[i].health -= 0.1;
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
const enemyRun = new Image();
enemyRun.src = "pixelalien/enemy.png";

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
        this.frameX = 0;
        this.frameY = 0;
        this.minFrame = 0;
        this.maxFrame = 7;
        this.spriteHeight = 192;
        this.spriteWidth = 192;
    }
    update() {
        this.x -= this.movement;                                                        // Enemies going to move from right to left
        ctx.drawImage(enemyRun, this.frameX * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
    draw() {
        if (frame % 4 === 0) {
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = this.minFrame;
            }
        }
        if (this.health === 100) {                                                     // Hide health if its full (reduce screen clutter)
            return;
        } else {
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
        }
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
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;  // Enemy Spawn Location
        enemies.push(new Enemy(verticalPosition));
        enemyPositions.push(verticalPosition);
        if (enemiesInterval >= 100) {
            enemiesInterval -= 50;
        }
    }
}

// Utilities
const handleGameStatus = () => {
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial';
    ctx.fillText("Resources: " + numberOfResources, 20, 80);
    ctx.fillText("Score: " + score, 20, 40);
    if (gameOver === true) {
        alert(`GAME OVER! Your Score is ${score}`);
    }
}

window.addEventListener('resize', () => {
    canvasPosition = canvas.getBoundingClientRect();
})

// collision Function
const collision = (first, second) => {
    if (!(first.x > second.x + second.width ||  // first element is on the right side of the second element
        first.x + first.width < second.x ||     // first element is on the left of the second element
        first.y > second.y + second.height ||   // first element is on top of the second element
        first.y + first.height < second.y)      // first element is below second element
    ) {
        return true;                            // with the "!" operator at the front, return true if the conditions (on top) are all not met
    }
}
/////


const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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