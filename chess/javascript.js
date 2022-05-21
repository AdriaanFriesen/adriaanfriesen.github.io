function $(id) {
    return document.getElementById(id);
}

function coordsString(coords) {
    return coords[0] + "-" + coords[1];
}

function coordsList(concat) {
    let coords = concat.split("-");
    for (let coord in coords) {
        coords[coord] = parseInt(coords[coord]);
    }
    return coords;
}

function moveRange(start, end) {
    let range = []
    if (start < end) {
        for (let i = start + 1; i <= end; i++) {
            range.push(i);
        }
    }
    else if (start > end) {
        for (let i = start - 1; i >= end; i--) {
            range.push(i);
        }
    }
    return range;
}

class Piece {
    constructor(piece, color, coords, board, square) {
        this.piece = piece;
        this.color = color;
        this.coords = coords;
        this.board = board;
        this.moved = false;
        this.DOMObject = document.createElement("div");
        this.DOMObject.classList.add("piece");
        this.DOMObject.classList.add(color + "-" + piece);
        square.appendChild(this.DOMObject);
        board.pieceList.push(this);
    }

    remove() {
        this.board.pieceList.splice((this.board.pieceList.findIndex((x) => x === this)), 1);
        $(coordsString(this.coords)).removeChild($(coordsString(this.coords)).firstElementChild);
    }
}

class Board {
    constructor() {
        this.pieceList = [];
        this.moveSquares = [];
        this.movePiece = null;
        this.moving = false;
        this.turn = "white";
    }

    highlight(coords) {
        if (0 <= coords[0] && coords[0] <= 7 &&  0 <= coords[1] && coords[1] <= 7) {
            square = $(coordsString(coords));
            if (square.classList.contains("white")) {
                square.classList.remove("white");
                square.classList.add("highlight-white");
            }
            
            else if (square.classList.contains("blue")) {
                square.classList.remove("blue");
                square.classList.add("highlight-blue");
            }
    
            else if (square.classList.contains("pink")) {
                square.classList.remove("pink");
                square.classList.add("highlight-pink");
            }
        }
    }

    clearHighlight() {
        for (let y = 0; y <= 7; y++) {
            for (let x = 0; x <= 7; x++) {
                square = $(coordsString([x, y]));
                if (square.classList.contains("highlight-white")) {
                    square.classList.remove("highlight-white");
                    square.classList.add("white");
                }
                
                else if (square.classList.contains("highlight-blue")) {
                    square.classList.remove("highlight-blue");
                    square.classList.add("blue");
                }

                else if (square.classList.contains("highlight-pink")) {
                    square.classList.remove("highlight-pink");
                    square.classList.add("pink");
                }
            }
        }
    }

    getPiece(coords) {
        for (let piece of this.pieceList) {
            if (piece.coords[0] == coords[0] && piece.coords[1] == coords[1]) {
                return piece;
            }
        }
        return null;
    }

    getMoves(piece) {
        let moves = [];

        if (piece.piece == "pawn" && piece.color == "black") {
            if (!this.getPiece([piece.coords[0], piece.coords[1] + 1])) moves.push([piece.coords[0], piece.coords[1] + 1]);
            if (!this.getPiece([piece.coords[0], piece.coords[1] + 1]) && !this.getPiece([piece.coords[0], piece.coords[1] + 2]) && !piece.moved) moves.push([piece.coords[0], piece.coords[1] + 2]);
            if (this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1]) && this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1]).color != "black") moves.push([piece.coords[0] + 1, piece.coords[1] + 1]);
            if (this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1]) && this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1]).color != "black") moves.push([piece.coords[0] - 1, piece.coords[1] + 1]);
        }

        else if (piece.piece == "pawn" && piece.color == "white") {
            if (!this.getPiece([piece.coords[0], piece.coords[1] - 1])) moves.push([piece.coords[0], piece.coords[1] - 1]);
            if (!this.getPiece([piece.coords[0], piece.coords[1] - 1]) && !this.getPiece([piece.coords[0], piece.coords[1] - 2]) && !piece.moved) moves.push([piece.coords[0], piece.coords[1] - 2]);
            if (this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1]) && this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1]).color != "white") moves.push([piece.coords[0] + 1, piece.coords[1] - 1]);
            if (this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1]) && this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1]).color != "white") moves.push([piece.coords[0] - 1, piece.coords[1] - 1]);
        }

        else if (piece.piece == "rook") {
            for (let x of moveRange(piece.coords[0], 7)) {
                if (!this.getPiece([x, piece.coords[1]])) moves.push([x, piece.coords[1]]);
                else if (this.getPiece([x, piece.coords[1]]).color != piece.color) moves.push([x, piece.coords[1]]);
                if (this.getPiece([x, piece.coords[1]])) break;
            }

            for (let x of moveRange(piece.coords[0], 0)) {
                if (!this.getPiece([x, piece.coords[1]])) moves.push([x, piece.coords[1]]);
                else if (this.getPiece([x, piece.coords[1]]).color != piece.color) moves.push([x, piece.coords[1]]);
                if (this.getPiece([x, piece.coords[1]])) break;
            }

            for (let y of moveRange(piece.coords[1], 7)) {
                if (!this.getPiece([piece.coords[0], y])) moves.push([piece.coords[0], y]);
                else if (this.getPiece([piece.coords[0], y]).color != piece.color) moves.push([piece.coords[0], y]);
                if (this.getPiece([piece.coords[0], y])) break;
            }

            for (let y of moveRange(piece.coords[1], 0)) {
                if (!this.getPiece([piece.coords[0], y])) moves.push([piece.coords[0], y]);
                else if (this.getPiece([piece.coords[0], y]).color != piece.color) moves.push([piece.coords[0], y]);
                if (this.getPiece([piece.coords[0], y])) break;
            }
        }

        else if (piece.piece == "bishop") {
            let xList = moveRange(piece.coords[0], 7);
            let yList = moveRange(piece.coords[1], 7);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 0);
            yList = moveRange(piece.coords[1], 7);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 0);
            yList = moveRange(piece.coords[1], 0);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 7);
            yList = moveRange(piece.coords[1], 0);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }
        }

        else if (piece.piece == "knight") {
            if (!this.getPiece([piece.coords[0] + 2, piece.coords[1] + 1])) moves.push([piece.coords[0] + 2, piece.coords[1] + 1]);
            else if (this.getPiece([piece.coords[0] + 2, piece.coords[1] + 1]).color != piece.color) moves.push([piece.coords[0] + 2, piece.coords[1] + 1]);

            if (!this.getPiece([piece.coords[0] + 1, piece.coords[1] + 2])) moves.push([piece.coords[0] + 1, piece.coords[1] + 2]);
            else if (this.getPiece([piece.coords[0] + 1, piece.coords[1] + 2]).color != piece.color) moves.push([piece.coords[0] + 1, piece.coords[1] + 2]);

            if (!this.getPiece([piece.coords[0] - 1, piece.coords[1] + 2])) moves.push([piece.coords[0] - 1, piece.coords[1] + 2]);
            else if (this.getPiece([piece.coords[0] - 1, piece.coords[1] + 2]).color != piece.color) moves.push([piece.coords[0] - 1, piece.coords[1] + 2]);

            if (!this.getPiece([piece.coords[0] - 2, piece.coords[1] + 1])) moves.push([piece.coords[0] - 2, piece.coords[1] + 1]);
            else if (this.getPiece([piece.coords[0] - 2, piece.coords[1] + 1]).color != piece.color) moves.push([piece.coords[0] - 2, piece.coords[1] + 1]);

            if (!this.getPiece([piece.coords[0] - 2, piece.coords[1] - 1])) moves.push([piece.coords[0] - 2, piece.coords[1] - 1]);
            else if (this.getPiece([piece.coords[0] - 2, piece.coords[1] - 1]).color != piece.color) moves.push([piece.coords[0] - 2, piece.coords[1] - 1]);

            if (!this.getPiece([piece.coords[0] - 1, piece.coords[1] - 2])) moves.push([piece.coords[0] - 1, piece.coords[1] - 2]);
            else if (this.getPiece([piece.coords[0] - 1, piece.coords[1] - 2]).color != piece.color) moves.push([piece.coords[0] - 1, piece.coords[1] - 2]);

            if (!this.getPiece([piece.coords[0] + 1, piece.coords[1] - 2])) moves.push([piece.coords[0] + 1, piece.coords[1] - 2]);
            else if (this.getPiece([piece.coords[0] + 1, piece.coords[1] - 2]).color != piece.color) moves.push([piece.coords[0] + 1, piece.coords[1] - 2]);

            if (!this.getPiece([piece.coords[0] + 2, piece.coords[1] - 1])) moves.push([piece.coords[0] + 2, piece.coords[1] - 1]);
            else if (this.getPiece([piece.coords[0] + 2, piece.coords[1] - 1]).color != piece.color) moves.push([piece.coords[0] + 2, piece.coords[1] - 1]);
        }

        else if (piece.piece == "queen") {
            for (let x of moveRange(piece.coords[0], 7)) {
                if (!this.getPiece([x, piece.coords[1]])) moves.push([x, piece.coords[1]]);
                else if (this.getPiece([x, piece.coords[1]]).color != piece.color) moves.push([x, piece.coords[1]]);
                if (this.getPiece([x, piece.coords[1]])) break;
            }

            for (let x of moveRange(piece.coords[0], 0)) {
                if (!this.getPiece([x, piece.coords[1]])) moves.push([x, piece.coords[1]]);
                else if (this.getPiece([x, piece.coords[1]]).color != piece.color) moves.push([x, piece.coords[1]]);
                if (this.getPiece([x, piece.coords[1]])) break;
            }

            for (let y of moveRange(piece.coords[1], 7)) {
                if (!this.getPiece([piece.coords[0], y])) moves.push([piece.coords[0], y]);
                else if (this.getPiece([piece.coords[0], y]).color != piece.color) moves.push([piece.coords[0], y]);
                if (this.getPiece([piece.coords[0], y])) break;
            }

            for (let y of moveRange(piece.coords[1], 0)) {
                if (!this.getPiece([piece.coords[0], y])) moves.push([piece.coords[0], y]);
                else if (this.getPiece([piece.coords[0], y]).color != piece.color) moves.push([piece.coords[0], y]);
                if (this.getPiece([piece.coords[0], y])) break;
            }

            let xList = moveRange(piece.coords[0], 7);
            let yList = moveRange(piece.coords[1], 7);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 0);
            yList = moveRange(piece.coords[1], 7);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 0);
            yList = moveRange(piece.coords[1], 0);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }

            xList = moveRange(piece.coords[0], 7);
            yList = moveRange(piece.coords[1], 0);
            for (let i = 0; i < Math.min(xList.length, yList.length); i++) {
                if (!this.getPiece([xList[i], yList[i]])) moves.push([xList[i], yList[i]]);
                else if (this.getPiece([xList[i], yList[i]]).color != piece.color) moves.push([xList[i], yList[i]]);
                if (this.getPiece([xList[i], yList[i]])) break;
            }
        }

        else if (piece.piece == "king") {
            if (!this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1])) moves.push([piece.coords[0] + 1, piece.coords[1] + 1]);
            else if (this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1]).color != piece.color) moves.push([piece.coords[0] + 1, piece.coords[1] + 1]);

            if (!this.getPiece([piece.coords[0] + 1, piece.coords[1]])) moves.push([piece.coords[0] + 1, piece.coords[1]]);
            else if (this.getPiece([piece.coords[0] + 1, piece.coords[1]]).color != piece.color) moves.push([piece.coords[0] + 1, piece.coords[1]]);

            if (!this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1])) moves.push([piece.coords[0] + 1, piece.coords[1] - 1]);
            else if (this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1]).color != piece.color) moves.push([piece.coords[0] + 1, piece.coords[1] - 1]);

            if (!this.getPiece([piece.coords[0], piece.coords[1] - 1])) moves.push([piece.coords[0], piece.coords[1] - 1]);
            else if (this.getPiece([piece.coords[0], piece.coords[1] - 1]).color != piece.color) moves.push([piece.coords[0], piece.coords[1] - 1]);

            if (!this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1])) moves.push([piece.coords[0] - 1, piece.coords[1] - 1]);
            else if (this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1]).color != piece.color) moves.push([piece.coords[0] - 1, piece.coords[1] - 1]);

            if (!this.getPiece([piece.coords[0] - 1, piece.coords[1]])) moves.push([piece.coords[0] - 1, piece.coords[1]]);
            else if (this.getPiece([piece.coords[0] - 1, piece.coords[1]]).color != piece.color) moves.push([piece.coords[0] - 1, piece.coords[1]]);

            if (!this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1])) moves.push([piece.coords[0] - 1, piece.coords[1] + 1]);
            else if (this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1]).color != piece.color) moves.push([piece.coords[0] - 1, piece.coords[1] + 1]);

            if (!this.getPiece([piece.coords[0], piece.coords[1] + 1])) moves.push([piece.coords[0], piece.coords[1] + 1]);
            else if (this.getPiece([piece.coords[0], piece.coords[1] + 1]).color != piece.color) moves.push([piece.coords[0], piece.coords[1] + 1]);
        }   

        let movesFinal = [];
        for (let move of moves) {
            if (7 >= move[0] && move[0] >= 0 && 7 >= move[1] && move[1] >= 0) movesFinal.push(move);
        }
        return movesFinal;
    }

    highlightMoves(piece) {
        let moves = this.getMoves(piece);
        for (let move of moves) {
            this.highlight(move);
        }
        return moves;
    }

    move(piece, coords) {
        for (let move of this.getMoves(piece)) {
            if (coords[0] == move[0] && coords[1] == move[1]) {
                $(coordsString(coords)).appendChild(piece.DOMObject);
                if (board.getPiece(coords)) {
                    board.getPiece(coords).remove();
                }
                piece.coords = coords;
                piece.moved = true;
            }
        }
    }
}

var board = new Board();

color = 0;
for (let y = 0; y <= 7; y++) {
    row = document.createElement("div");
    row.classList.add("flex");
    row.classList.add("row");
    $("board").appendChild(row);

    for (let x = 0; x <= 7; x++) {
        square = document.createElement("div");
        square.classList.add("square");
        square.classList.add("center");
        square.id = x + "-" + y;
        if (color == 0 || color == 2) square.classList.add("white");
        else if (color == 1) square.classList.add("pink");
        else if (color == 3) square.classList.add("blue");
        square.addEventListener("click", event => {
            if (event.target.classList.contains("piece")) {
                let piece = board.getPiece(coordsList(event.target.parentElement.id));
                if (piece.color == board.turn) {
                    board.clearHighlight();
                    let moves = board.highlightMoves(piece);
                    board.movePiece = piece;
                    board.moving = true;
                    for (let move of moves) {
                        board.moveSquares.push($(coordsString(move)));
                    }
                }
                else {
                    board.clearHighlight();
                    board.moving = false;
                    if (board.moveSquares.includes(event.target.parentElement)) {
                        board.move(board.movePiece, coordsList(event.target.parentElement.id));
                        board.moveSquares = [];
                        if (board.turn == "white") board.turn = "black"
                        else if (board.turn == "black") board.turn = "white";
                    }
                }
            }
            else if (event.target.classList.contains("square")) {
                board.clearHighlight();
                if (board.moveSquares.includes(event.target) && board.moving) {
                    board.move(board.movePiece, coordsList(event.target.id));
                    board.moveSquares = [];
                    if (board.turn == "white") board.turn = "black"
                    else if (board.turn == "black") board.turn = "white";
                }
                board.moving = false;
            }
        })
        row.appendChild(square);
        if (x < 7) color++;
        color %= 4;

        switch(y) {
            case 0:
                switch(x) {
                    case 0:
                        new Piece("rook", "black", [x, y], board, square);
                        break;
                    case 1:
                        new Piece("knight", "black", [x, y], board, square);
                        break;
                    case 2:
                        new Piece("bishop", "black", [x, y], board, square);
                        break;
                    case 3:
                        new Piece("queen", "black", [x, y], board, square);
                        break;
                    case 4:
                        new Piece("king", "black", [x, y], board, square);
                        break;
                    case 5:
                        new Piece("bishop", "black", [x, y], board, square);
                        break;
                    case 6:
                        new Piece("knight", "black", [x, y], board, square);
                        break;
                    case 7:
                        new Piece("rook", "black", [x, y], board, square);
                        break;
                }
                break;
            case 1:
                new Piece("pawn", "black", [x, y], board, square);
                break;
            case 6:
                new Piece("pawn", "white", [x, y], board, square);
                break;
            case 7:
                switch(x) {
                    case 0:
                        new Piece("rook", "white", [x, y], board, square);
                        break;
                    case 1:
                        new Piece("knight", "white", [x, y], board, square);
                        break;
                    case 2:
                        new Piece("bishop", "white", [x, y], board, square);
                        break;
                    case 3:
                        new Piece("queen", "white", [x, y], board, square);
                        break;
                    case 4:
                        new Piece("king", "white", [x, y], board, square);
                        break;
                    case 5:
                        new Piece("bishop", "white", [x, y], board, square);
                        break;
                    case 6:
                        new Piece("knight", "white", [x, y], board, square);
                        break;
                    case 7:
                        new Piece("rook", "white", [x, y], board, square);
                        break;
                }
                break;
        }
    }
}