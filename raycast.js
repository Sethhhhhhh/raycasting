const TILE_SIZE = 128;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;
const MINIMAP_SCALE_FACTOR = 0.25;

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
                rect(
                    MINIMAP_SCALE_FACTOR * tileX, 
                    MINIMAP_SCALE_FACTOR * tileY, 
                    MINIMAP_SCALE_FACTOR * TILE_SIZE, 
                    MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = 5 * TILE_SIZE - TILE_SIZE / 2;
        this.y = 6 * TILE_SIZE - TILE_SIZE / 2;
        this.radius = TILE_SIZE / 10;
        this.turnDirection = 0;
        this.walkDirection = 0;
        this.rotationAngle = 0;
        this.moveSpeed = 7
        this.rotationSpeed = 3 * (Math.PI / 180);
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
        circle(
            MINIMAP_SCALE_FACTOR * this.x, 
            MINIMAP_SCALE_FACTOR * this.y, 
            MINIMAP_SCALE_FACTOR * this.radius
        );
        stroke("red");
        line(
            MINIMAP_SCALE_FACTOR * this.x, 
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * (this.x + cos(this.rotationAngle) * 50),
            MINIMAP_SCALE_FACTOR * (this.y + sin(this.rotationAngle) * 50) 
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
        this.isRayFacingRight = this.rayAngle < (Math.PI * 0.5) || this.rayAngle > (1.5 * Math.PI);
    }
    cast() {
        let xintercept, yintercept;
        let xstep, ystep;

        let foundHorzWallHit = 0;
        let horzWallHitX = 0;
        let horzWallHitY = 0;

        yintercept = floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        xintercept = player.x + ((yintercept - player.y) / tan(this.rayAngle));
        
        ystep = TILE_SIZE;
        ystep *= (!this.isRayFacingDown ? -1 : 1);

        xstep = TILE_SIZE / tan(this.rayAngle);
        xstep *= (!this.isRayFacingRight && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        let nextHorzTouchX = xintercept;
        let nextHorzTouchY = yintercept;
        
        while (!foundHorzWallHit) {
            if (grid.hasWallAt(nextHorzTouchX, !this.isRayFacingDown ? nextHorzTouchY - 1 : nextHorzTouchY)) {
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
        xstep *= (!this.isRayFacingRight ? -1 : 1);

        ystep = TILE_SIZE * tan(this.rayAngle);
        ystep *= (!this.isRayFacingDown && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        let nextVertTouchX = xintercept;
        let nextVertTouchY = yintercept;

        while (!foundVertWallHit) {
            if (grid.hasWallAt(!this.isRayFacingRight ? nextVertTouchX - 1 : nextVertTouchX, nextVertTouchY)) {
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
        
        
        if (this.wasHitVertical = (vertHitDistance < horzHitDistance)) {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = vertHitDistance;
        }
        else { 
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horzHitDistance;
        }
    }
    render() {
        stroke("rgb(255, 87, 51)");
        line(
            MINIMAP_SCALE_FACTOR * player.x, 
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY      
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
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];

    for (let col = 0; col < NUM_RAYS; col++) {
        let ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);

        rayAngle += FOV_ANGLE / NUM_RAYS;
    }
}

function render3DProjectedWalls() {
    for (let i = 0; i < NUM_RAYS; i++) {
        let ray = rays[i];

        let correctWallDistance = ray.distance * cos(ray.rayAngle - player.rotationAngle);
        let distanceProjectionPlan = (WINDOW_WIDTH / 2) / tan(FOV_ANGLE / 2);
        let wallStipHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlan;
        
        let alpha = 1.0;
        let color = ray.wasHitVertical ? 255 : 200;

        fill("rgba("+ color + ", " + color + ", " + color + ", " + alpha + ")");
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStipHeight / 2),
            WALL_STRIP_WIDTH,
            wallStipHeight
        );
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return (sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
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
    clear("#21212121");
    update();

    render3DProjectedWalls();
    
    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
