const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 15;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT)
            return (1);
        let mapGridIndexX = floor(x / TILE_SIZE);
        let mapGridIndexY = floor(y / TILE_SIZE);
        return (this.grid[mapGridIndexY][mapGridIndexX] != 0);
    }
    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for(let j = 0; j < MAP_NUM_COLS; j++) {
                let tileX = j * TILE_SIZE;
                let tileY = i * TILE_SIZE;
                let tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 5;
        this.turnDirection = 0;
        this.walkDirection = 0;
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2.0 * (Math.PI / 180);
    }
    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        
        let moveStep = this.walkDirection * this.moveSpeed;
        
        let newPlayerX = this.x + cos(this.rotationAngle) * moveStep;
        let newPlayerY = this.y + sin(this.rotationAngle) * moveStep;

        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render() {
        noStroke();
        fill("red");
        circle(this.x, this.y, this.radius);
        stroke("red");
        line(
            this.x, 
            this.y,
            this.x + cos(this.rotationAngle) * 50,
            this.y + sin(this.rotationAngle) * 50 
        )
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < (Math.PI * 0.5) || this.rayAngle > (1.5 * Math.PI);
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast(columnId) {
        let xintercept, yintercept;
        let xstep, ystep;

        let foundHorzWallHit = 0;
        let horzWallHitX = 0;
        let horzWallHitY = 0;

        yintercept = floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        xintercept = player.x + ((yintercept - player.y) / tan(this.rayAngle));
        
        ystep = TILE_SIZE;
        ystep *= (this.isRayFacingUp ? -1 : 1);

        xstep = ystep / tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        let nextHorzTouchX = xintercept;
        let nextHorzTouchY = yintercept;

        if (this.isRayFacingUp)
            nextHorzTouchY--;
        
        while (!foundHorzWallHit) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
                foundHorzWallHit = 1;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
            }
            else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            } 
        }

        let foundVertWallHit = 0;
        let vertWallHitX = 0;
        let vertWallHitY = 0;

        xintercept = floor(player.x / TILE_SIZE) * TILE_SIZE
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        yintercept = player.y + (xintercept - player.x) * tan(this.rayAngle);
        
        xstep = TILE_SIZE;
        xstep *= (this.isRayFacingLeft ? -1 : 1);

        ystep = xstep * tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        let nextVertTouchX = xintercept;
        let nextVertTouchY = yintercept;

        if (this.isRayFacingLeft)
            nextVertTouchX--;
        
        while (!foundVertWallHit) {
            if (grid.hasWallAt(nextVertTouchX, nextVertTouchY)) {
                foundVertWallHit = 1;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
            }
            else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            } 
        }

        
        let horzHitDistance = (foundHorzWallHit) 
            ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) 
            : Number.MAX_VALUE;
        let vertHitDistance = (foundVertWallHit) 
            ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;
        this.wallHitX = (horzHitDistance < vertHitDistance) ? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance) ? horzHitDistance : vertHitDistance;
        this.wasHitVertical = (vertHitDistance < horzHitDistance);
    }
    render() {
        stroke("blue");
        line(
            player.x, 
            player.y,
            this.wallHitX,
            this.wallHitY      
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 1;
    }
    else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    }
    if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    }
    else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    }
    if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function castAllRays() {
    let columnId = 0;

    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];

    for (let i = 0; i < NUM_RAYS; i++) {
        let ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;

        columnId++;
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return (sqrt((x2 - x1) * (x2 - x1) + (y2, y1) * (y2, y1)));
}


function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0)
        angle += (Math.PI * 2);
    return (angle);
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    update();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}