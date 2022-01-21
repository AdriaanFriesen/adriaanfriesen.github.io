function $(element) {
    return(document.getElementById(element));
}

// function hasElement(array, target) {
//     for (element of array) {
//         if (element === target) {
//             return(true);
//         }
//     }
//     return(false);
// }

var c = document.getElementById("canvas1");
var ctx = c.getContext("2d");

window.addEventListener('resize',  function() { 
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    blastRender(board, ant);
}, false);

c.width = window.innerWidth;
c.height = window.innerHeight;

var boardScaling = 16;

var renderOffset = {x: Math.round(c.width / 2), y: Math.round(c.height / 2)};

var dragging = false;
var dragStart = {x: null, y: null};
var dragEnd = {x: null, y: null};
var oldBoardScaling = null;

// add ability to 'move' the rendered image around by dragging
c.addEventListener('mousedown', function(event) {
    tick();
    dragging = true;
    dragStart.x = event.offsetX;
    dragStart.y = event.offsetY;
}, false);

c.addEventListener('mousemove', function(event) {
    dragEnd.x = event.offsetX;
    dragEnd.y = event.offsetY;
    if (dragging) {
        renderOffset.x += dragEnd.x - dragStart.x;
        renderOffset.y += dragEnd.y - dragStart.y;
        dragStart.x = dragEnd.x;
        dragStart.y = dragEnd.y;
        blastRender(board, ant);
    }
}, false);

c.addEventListener('mouseup', function() {
    dragging = false;
}, false)
// ;


c.addEventListener('wheel', function(event) {
    oldBoardScaling = boardScaling;
    boardScaling -= Math.round(event.deltaY / 50);
    
    renderOffset.x -= Math.round(((boardScaling / oldBoardScaling) - 1) * (event.clientX - renderOffset.x));
    renderOffset.y -= Math.round(((boardScaling / oldBoardScaling) - 1) * (event.clientY - renderOffset.y));
    // var dx = (event.clientX - renderOffset.x) * ((boardScaling / oldBoardScaling) - 1)

    if (boardScaling < 1) {
        boardScaling = 1;
    }
    blastRender(board, ant);
}, false)


class Ant {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.px = x;
        this.py = y;
        this.direction = direction;
    }
    
    normalizeDirection() {
        switch (this.direction) {
            case -90:
                this.direction = 270;
                break;
            case 360:
                this.direction = 0;
                break;
        }
    }
    
    move(board) {
        this.px = this.x;
        this.py = this.y;

        this.direction += {true: -90, false: 90}[board[this.x][this.y]];
        this.normalizeDirection();
        
        board[this.x][this.y] = !board[this.x][this.y];
        
        switch (this.direction) {
            case 0: // left
                if (this.x == 0) { // if the ant is about to go out of bounds, generate more board.
                    board.unshift([]);
                    for (let i = 0; i < board[1].length; i++) {
                        board[0].push(false);
                    }
                    this.x += 1
                    this.px += 1
                    renderOffset.x -= boardScaling;
                    // blastRender(board, ant);
                } // ;
                this.x -= 1;
                break;
            case 90: // up
                if (this.y == 0) {
                    for (let i = 0; i < board.length; i++) {
                        board[i].unshift(false);
                    }
                    this.y += 1
                    this.py += 1
                    renderOffset.y -= boardScaling;
                    // blastRender();
                }
                this.y -= 1;
                break;
            case 180: // right
                if (this.x == board.length - 1) {
                    board.push([]);
                    for (let i = 0; i < board[1].length; i++) {
                        board[board.length - 1].push(false);
                    }
                }
                this.x += 1;
                break;
            case 270: // down
                if (this.y == board[0].length - 1) {
                    for (let i = 0; i < board.length; i++) {
                        board[i].push(false);
                    }
                }
                this.y += 1;
                break;
        }
    } 
}

function iterativeRender(board, ant) {
    ctx.fillStyle = {true: "#eeeeee", false: "#333333"}[board[ant.px][ant.py]];
    ctx.fillRect(renderOffset.x + ant.px * boardScaling, renderOffset.y + ant.py * boardScaling, boardScaling, boardScaling);

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(renderOffset.x + ant.x * boardScaling, renderOffset.y + ant.y * boardScaling, boardScaling, boardScaling);

    ctx.fillStyle = {true: "#eeeeee", false: "#333333"}[board[ant.x][ant.y]];
    ctx.fillRect(renderOffset.x + (ant.x * boardScaling) + boardScaling - Math.round(boardScaling * 0.8),
        renderOffset.y + (ant.y * boardScaling) + boardScaling - Math.round(boardScaling * 0.8),
        Math.round(boardScaling * 0.8) - (boardScaling - Math.round(boardScaling * 0.8)),
        Math.round(boardScaling * 0.8) - (boardScaling - Math.round(boardScaling * 0.8)));
}

function blastRender(board, ant) {
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, c.width, c.height);

    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[0].length; y++) {
            ctx.fillStyle = {true: "#eeeeee", false: "#333333"}[board[x][y]];
            ctx.fillRect(renderOffset.x + x * boardScaling, renderOffset.y + y * boardScaling, boardScaling, boardScaling);
        }
    }

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(renderOffset.x + ant.x * boardScaling, renderOffset.y + ant.y * boardScaling, boardScaling, boardScaling);

    ctx.fillStyle = {true: "#eeeeee", false: "#333333"}[board[ant.x][ant.y]];
    ctx.fillRect(renderOffset.x + (ant.x * boardScaling) + boardScaling - Math.round(boardScaling * 0.8),
        renderOffset.y + (ant.y * boardScaling) + boardScaling - Math.round(boardScaling * 0.8),
        Math.round(boardScaling * 0.8) - (boardScaling - Math.round(boardScaling * 0.8)),
        Math.round(boardScaling * 0.8) - (boardScaling - Math.round(boardScaling * 0.8)));
}

// var ant = new Ant(Math.round(c.width / (boardScaling * 2)), Math.round(c.height / (boardScaling * 2)), 0);
var ant = new Ant(1, 1, 0);

board = 
[[false, false, false],
[false, false, false],
[false, false, false]];

step = 0;

// for (let x = 0; x < Math.round(c.width / boardScaling); x++) {
//     board.push([]);
//     for (let y = 0; y < Math.round(c.height / boardScaling); y++) {
//         board[x].push(false);
//     }
// }

function tick() {
    iterativeRender(board, ant);
    ant.move(board);
    step++;
    $("step-counter").innerHTML = step;
}

function interval() {
    clearInterval(intervalTimer);
    if ($("step-interval").value) {
        intervalTimer = setInterval(tick, $("step-interval").value);
    }
    else {
        intervalTimer = setInterval(tick, 100);
    }
}

$("step-interval").addEventListener("keyup", interval);

intervalTimer = setInterval(tick, 100);
interval();