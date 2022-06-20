// import {Module} from "./engine.js";

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

function addCoords(coords0, coords1) {
    return [coords0[0] + coords1[0], coords0[1] + coords1[1]];
}

function flipColor(color) {
    if (color == "white") return "black";
    else if (color == "black") return "white";
}

function graph(board) {
    for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
           if ($(coordsString([x, y])).firstChild) $(coordsString([x, y])).removeChild($(coordsString([x, y])).firstElementChild);
        }
    }
    for (let piece of board.pieceList) {
        piece.realise();
    }
}

class Piece {
    constructor(piece, color, coords, board, square, real) {
        this.piece = piece;
        this.color = color;
        this.coords = coords;
        this.board = board;
        this.moved = false;
        this.enPassentCoords = null;
        if (real) {
            this.DOMObject = document.createElement("div");
            this.DOMObject.classList.add("piece");
            this.DOMObject.classList.add(color + "-" + piece);
            square.appendChild(this.DOMObject);
        }
        this.board.pieceList.push(this);
    }

    realise() {
        this.DOMObject = document.createElement("div");
        this.DOMObject.classList.add("piece");
        this.DOMObject.classList.add(this.color + "-" + this.piece);
        $(coordsString(this.coords)).appendChild(this.DOMObject);
    }

    copy(board) {
        let duplicate = new Piece(this.piece, this.color, this.coords, board, this.square, false);
        duplicate.moved = this.moved;
        duplicate.enPassentCoords = this.enPassentCoords;
        return duplicate;
    }

    remove(real) {
        this.board.pieceList.splice((this.board.pieceList.findIndex((x) => x === this)), 1);
        if (real) $(coordsString(this.coords)).removeChild($(coordsString(this.coords)).firstElementChild);
    }
}

class Board {
    constructor() {
        this.pieceList = [];
        this.turn = "white";
        this.moveHistory = []
        this.winner = null;
        this.promoting = false;
        this.promotePiece = null;
        this.moveSquares = [];
        this.moving = false;
        this.movePiece = null;
        // this.castling = false;
        // this.castlingSide = null;
        this.engines = {"white": "n/a", "black": "n/a"};
    }

    copy() {
        let duplicate = new Board();
        for (let piece of this.pieceList) {
            piece.copy(duplicate);
        }
        duplicate.turn = this.turn;
        // duplicate.moveHistory = this.moveHistory;
        for (let move of this.moveHistory) {
            let newMove = [];
            for (let coord of move) {
                newMove.push(coord);
            }
            duplicate.moveHistory.push(newMove);
        }
        duplicate.winner = this.winner;
        duplicate.promoting = this.promoting;
        if (this.promotePiece === null) {
            duplicate.promotePiece = null;
        }
        else {
            duplicate.promotePiece = this.promotePiece.copy(duplicate);
        }
        duplicate.engines = {"white": this.engines["white"], "black": this.engines["black"]};
        return duplicate;
    }

    highlight(coords) {
        if (0 <= coords[0] && coords[0] <= 7 &&  0 <= coords[1] && coords[1] <= 7) {
            let square = $(coordsString(coords));
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
                let square = $(coordsString([x, y]));
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

    getKing(color) {
        for (let piece of this.pieceList) {
            if (piece.color == color && piece.piece == "king") {
                return piece;
            }
        }
        return null;
    }

    checkEnPassent(coords, color) {
        for (let piece of this.pieceList) {
            if (piece.enPassentCoords !== null) {
                if (piece.enPassentCoords[0] == coords[0] && piece.enPassentCoords[1] == coords[1] && piece.color == color) {
                    return true
                };
            }
        }
    }

    getMoves(piece, doCheckCheck) {
        let moves = [];

        if (piece.piece == "pawn" && piece.color == "black") {
            if (!this.getPiece([piece.coords[0], piece.coords[1] + 1])) moves.push([piece.coords[0], piece.coords[1] + 1]);
            if (!this.getPiece([piece.coords[0], piece.coords[1] + 1]) && !this.getPiece([piece.coords[0], piece.coords[1] + 2]) && !piece.moved) moves.push([piece.coords[0], piece.coords[1] + 2]);
            if ((this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1]) && this.getPiece([piece.coords[0] + 1, piece.coords[1] + 1]).color != "black") || this.checkEnPassent([piece.coords[0] + 1, piece.coords[1] + 1], "white")) moves.push([piece.coords[0] + 1, piece.coords[1] + 1]);
            if ((this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1]) && this.getPiece([piece.coords[0] - 1, piece.coords[1] + 1]).color != "black") || this.checkEnPassent([piece.coords[0] - 1, piece.coords[1] + 1], "white")) moves.push([piece.coords[0] - 1, piece.coords[1] + 1]);
        }

        else if (piece.piece == "pawn" && piece.color == "white") {
            if (!this.getPiece([piece.coords[0], piece.coords[1] - 1])) moves.push([piece.coords[0], piece.coords[1] - 1]);
            if (!this.getPiece([piece.coords[0], piece.coords[1] - 1]) && !this.getPiece([piece.coords[0], piece.coords[1] - 2]) && !piece.moved) moves.push([piece.coords[0], piece.coords[1] - 2]);
            if ((this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1]) && this.getPiece([piece.coords[0] + 1, piece.coords[1] - 1]).color != "white") || this.checkEnPassent([piece.coords[0] + 1, piece.coords[1] - 1], "black")) moves.push([piece.coords[0] + 1, piece.coords[1] - 1]);
            if ((this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1]) && this.getPiece([piece.coords[0] - 1, piece.coords[1] - 1]).color != "white") || this.checkEnPassent([piece.coords[0] - 1, piece.coords[1] - 1], "black")) moves.push([piece.coords[0] - 1, piece.coords[1] - 1]);
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
            let moveSpace = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];

            for (let potentialMove of moveSpace) {
                let potentialMoveCoords = addCoords(piece.coords, potentialMove);

                if (!this.getPiece(potentialMoveCoords)) moves.push(potentialMoveCoords);
                else if (this.getPiece(potentialMoveCoords).color != piece.color) moves.push(potentialMoveCoords);
            }
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
            // let moves = [];
            let moveSpace = [[1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]];

            for (let potentialMove of moveSpace) {
                let potentialMoveCoords = addCoords(piece.coords, potentialMove);

                if (7 >= potentialMoveCoords[0] && potentialMoveCoords[0] >= 0 && 7 >= potentialMoveCoords[1] && potentialMoveCoords[1] >= 0) {
                    if (!this.getPiece(potentialMoveCoords)) moves.push(potentialMoveCoords);
                    else if (this.getPiece(potentialMoveCoords).color != piece.color) moves.push(potentialMoveCoords);
                }
            }

            // castling
            if (!piece.moved) {
                // kingside
                if (this.getPiece([piece.coords[0] + 3, piece.coords[1]])) {
                    if (!this.getPiece([piece.coords[0] + 1, piece.coords[1]]) && !this.getPiece([piece.coords[0] + 2, piece.coords[1]]) && !this.getPiece([piece.coords[0] + 3, piece.coords[1]]).moved && this.getPiece([piece.coords[0] + 3, piece.coords[1]]).piece == "rook") {
                        moves.push([piece.coords[0] + 2, piece.coords[1]]);
                    }
                }

                // queenside
                if (this.getPiece([piece.coords[0] - 4, piece.coords[1]])) {
                    if (!this.getPiece([piece.coords[0] - 1, piece.coords[1]]) && !this.getPiece([piece.coords[0] - 2, piece.coords[1]]) && !this.getPiece([piece.coords[0] - 3, piece.coords[1]]) && !this.getPiece([piece.coords[0] - 4, piece.coords[1]]).moved && this.getPiece([piece.coords[0] - 4, piece.coords[1]]).piece == "rook") {
                        moves.push([piece.coords[0] - 2, piece.coords[1]]);
                    }
                }
            }
        }   

        // check for invalid moves
        let movesFilter = [];
        for (let move of moves) {
            if (7 >= move[0] && move[0] >= 0 && 7 >= move[1] && move[1] >= 0) movesFilter.push(move);
        }

        moves = [];
        
        for (let move of movesFilter) {
            moves.push(move);
        }

        if (doCheckCheck) {
            let invalidMoves = [];

            for (let move of moves) {
                let moveBoard = this.copy();
                moveBoard.move(moveBoard.getPiece(piece.coords), move, false, true);
                if (moveBoard.checkCheck(piece.color)) invalidMoves.push(move);
            }

            let movesFinal = []
    
            for (let move of moves) {
                let valid = true;
                for (let invalidMove of invalidMoves) {
                    if (move[0] == invalidMove[0] && move[1] == invalidMove[1]) valid = false;
                }
                if (valid)  movesFinal.push(move);
            }

            return movesFinal;
        }
        else {
            return moves;
        }
    }

    checkCheck(color) {
        let opponentMoves = [];

        for (let opponentPiece of this.pieceList) {
            if (opponentPiece.color != color && opponentPiece.piece != "king") {
                for (let opponentMoveCoords of this.getMoves(opponentPiece, false)) {
                    let opponentMove = this.copy();
                    opponentMove.move(opponentMove.getPiece(opponentPiece.coords), opponentMoveCoords, false, true);
                    opponentMoves.push(opponentMove);
                }
            }
        }

        let check = false;

        for (let opponentMove of opponentMoves) {
            if (!opponentMove.getKing(color)) check = true;
        }

        return check;
    }

    checkCheckMate(color) {
        let checkMate = true;
        for (let piece of this.pieceList) {
            if (piece.color == color) {
                if (this.getMoves(piece, true).length != 0) {
                    checkMate = false;
                }
            }
        }
        return checkMate;
    }

    highlightMoves(piece) {
        let moves = this.getMoves(piece, true);
        for (let move of moves) {
            this.highlight(move);
        }
        return moves;
    }

    move(piece, coords, real, force) {
        this.moveHistory.push([[piece.coords[0], piece.coords[1]], [coords[0], coords[1]]]);
        if (force) {
            if (real) $(coordsString(coords)).appendChild(piece.DOMObject);

            // capturing
            if (this.getPiece(coords)) {
                this.getPiece(coords).remove(real);
            }

            // en passent capturing
            else if (piece.piece == "pawn") {
                if (piece.color == "white" && (coords[0] == (piece.coords[0] + 1) && coords[1] == (piece.coords[1] - 1) || coords[0] == (piece.coords[0] - 1) && coords[1] == (piece.coords[1] - 1))) {
                    this.getPiece([coords[0], coords[1] + 1]).remove(real);
                }
                if (piece.color == "black" && (coords[0] == (piece.coords[0] + 1) && coords[1] == (piece.coords[1] + 1) || coords[0] == (piece.coords[0] - 1) && coords[1] == (piece.coords[1] + 1))) {
                    this.getPiece([coords[0], coords[1] - 1]).remove(real);
                }
            }

            // clear previous en passents
            for (let checkPiece of this.pieceList) {
                checkPiece.enPassentCoords = null;
            }

            // add en passent vulnerability
            if (piece.piece == "pawn") {
                if (piece.color == "white" && coords[0] == piece.coords[0] && coords[1] == (piece.coords[1] - 2)) {
                    piece.enPassentCoords = [piece.coords[0], piece.coords[1] - 1];
                }
                if (piece.color == "black" && coords[0] == piece.coords[0] && coords[1] == (piece.coords[1] + 2)) {
                    piece.enPassentCoords = [piece.coords[0], piece.coords[1] + 1];
                }
            }

            // kingside castling
            if (this.getPiece([piece.coords[0] + 3, piece.coords[1]])) {
                if (piece.piece == "king" && coords[0] == (piece.coords[0] + 2) && coords[1] == piece.coords[1]) {
                    let castlePiece = this.getPiece([piece.coords[0] + 3, piece.coords[1]]);
                    if (real) {
                        $(coordsString([piece.coords[0] + 1, piece.coords[1]])).appendChild(castlePiece.DOMObject);
                    }
                    castlePiece.coords = [piece.coords[0] + 1, piece.coords[1]];
                }
            }

            // queenside castling
            if (this.getPiece([piece.coords[0] - 4, piece.coords[1]])) {
                if (piece.piece == "king" && coords[0] == (piece.coords[0] - 2) && coords[1] == piece.coords[1]) {
                    let castlePiece = this.getPiece([piece.coords[0] - 4, piece.coords[1]]);
                    if (real) {
                        $(coordsString([piece.coords[0] - 1, piece.coords[1]])).appendChild(castlePiece.DOMObject);
                    }
                    castlePiece.coords = [piece.coords[0] - 1, piece.coords[1]];
                }
            }

            piece.coords = coords;
            
            // pawn promotion
            if (piece.piece == "pawn" && real) {
                if (piece.color == "white" && piece.coords[1] == 0) {
                    this.promoting = true;
                    this.promotePiece = piece;
                    this.showPromotionUI(piece);
                }
                else if (piece.color == "black" && piece.coords[1] == 7) {
                    this.promoting = true;
                    this.promotePiece = piece;
                    this.showPromotionUI(piece);
                }
            }

            piece.moved = true;
        }
        
        else {
            for (let move of this.getMoves(piece, true)) {
                if (coords[0] == move[0] && coords[1] == move[1]) {
                    if (real) $(coordsString(coords)).appendChild(piece.DOMObject);
                    
                    // capturing
                    if (this.getPiece(coords)) {
                        this.getPiece(coords).remove(real);
                    }
    
                    // en passent capturing
                    else if (piece.piece == "pawn") {
                        if (piece.color == "white" && (coords[0] == (piece.coords[0] + 1) && coords[1] == (piece.coords[1] - 1) || coords[0] == (piece.coords[0] - 1) && coords[1] == (piece.coords[1] - 1))) {
                            this.getPiece([coords[0], coords[1] + 1]).remove(real);
                        }
                        if (piece.color == "black" && (coords[0] == (piece.coords[0] + 1) && coords[1] == (piece.coords[1] + 1) || coords[0] == (piece.coords[0] - 1) && coords[1] == (piece.coords[1] + 1))) {
                            this.getPiece([coords[0], coords[1] - 1]).remove(real);
                        }
                    }
    
                    // clear previous en passents
                    for (let checkPiece of this.pieceList) {
                        checkPiece.enPassentCoords = null;
                    }
    
                    // add en passent vulnerability
                    if (piece.piece == "pawn") {
                        if (piece.color == "white" && coords[0] == piece.coords[0] && coords[1] == (piece.coords[1] - 2)) {
                            piece.enPassentCoords = [piece.coords[0], piece.coords[1] - 1];
                        }
                        if (piece.color == "black" && coords[0] == piece.coords[0] && coords[1] == (piece.coords[1] + 2)) {
                            piece.enPassentCoords = [piece.coords[0], piece.coords[1] + 1];
                        }
                    }
    
                    // kingside castling
                    if (piece.piece == "king" && coords[0] == (piece.coords[0] + 2) && coords[1] == piece.coords[1]) {
                        let castlePiece = this.getPiece([piece.coords[0] + 3, piece.coords[1]]);
                        $(coordsString([piece.coords[0] + 1, piece.coords[1]])).appendChild(castlePiece.DOMObject);
                        castlePiece.coords = [piece.coords[0] + 1, piece.coords[1]];
                    }
    
                    // queenside castling
                    if (piece.piece == "king" && coords[0] == (piece.coords[0] - 2) && coords[1] == piece.coords[1]) {
                        let castlePiece = this.getPiece([piece.coords[0] - 4, piece.coords[1]]);
                        $(coordsString([piece.coords[0] - 1, piece.coords[1]])).appendChild(castlePiece.DOMObject);
                        castlePiece.coords = [piece.coords[0] - 1, piece.coords[1]];
                    }
    
                    piece.coords = coords;
                    
                    // pawn promotion
                    if (piece.piece == "pawn" && real) {
                        if (piece.color == "white" && piece.coords[1] == 0) {
                            this.promoting = true;
                            this.promotePiece = piece;
                            this.showPromotionUI(piece);
                        }
                        else if (piece.color == "black" && piece.coords[1] == 7) {
                            this.promoting = true;
                            this.promotePiece = piece;
                            this.showPromotionUI(piece);
                        }
                    }
    
                    piece.moved = true;
                }
            }
        }
    }

    showPromotionUI(piece) {
        board.highlight(piece.coords)
        $("promotion").classList.remove("hide");
        if (piece.color == "white") {
            for (let element of document.getElementsByClassName("black-promotion")) {
                element.classList.add("hide");
            }
            for (let element of document.getElementsByClassName("white-promotion")) {
                element.classList.remove("hide");
            }
        }
        else if (piece.color == "black") {
            for (let element of document.getElementsByClassName("white-promotion")) {
                element.classList.add("hide");
            }
            for (let element of document.getElementsByClassName("black-promotion")) {
                element.classList.remove("hide");
            }
        }
    }

    promote(piece, newPiece, real) {
        if (real) {
            piece.DOMObject.classList.remove(piece.color + "-" + piece.piece);
            piece.DOMObject.classList.add(piece.color + "-" + newPiece);
        }
        piece.piece = newPiece;
        this.endTurn();
    }

    endTurn() {
        this.moving = false;
        this.turn = flipColor(this.turn);
        let boardEvaluation = this.evaluateBoard("pieces");
        // $("board-score").innerHTML = String(boardEvaluation);
        if (boardEvaluation == Infinity) {
            this.win("white");
        }
        else if (boardEvaluation == -Infinity) {
            this.win("black");
        }
        else {
            // setTimeout(board.startTurn, 50);
            this.startTurn();
        }
    }
    
    startTurn() {
        if (this.engines[this.turn] != "n/a") {
            let move = this.minimax(2, -Infinity, Infinity, this.turn, "pieces")[1];
            this.move(this.getPiece(move[0]), move[1], true, false);
            this.endTurn();
        }
    }

    evaluateBoard(method) {
        if (this.checkCheckMate("white")) {
            return -Infinity;
        }
        else if (this.checkCheckMate("black")) {
            return Infinity;
        }
        
        let score = 0.0;
        
        switch(method) {
            case "pieces":
                for (let piece of this.pieceList) {
                    let addScore = 0;
                    switch(piece.piece) {
                        case "pawn":
                            addScore += 1;
                            break;

                        case "knight":
                            addScore += 3;
                            break;

                        case "bishop":
                            addScore += 5;
                            break;

                        case "rook":
                            addScore += 5;
                            break;

                        case "queen":
                            addScore += 9;
                    }

                    switch(piece.color) {
                        case "white":
                            addScore *= 1;
                            break;

                        case "black":
                            addScore *= -1;
                            break;
                    }
                    score += addScore;
                }
                break;
        }
        return score;
    }

    minimax(depth, alpha, beta, maximizingColor, evaluationMethod) {
        // console.log("minimax");
        if (depth == 0 || this.checkCheckMate("white") || this.checkCheckMate("black")) {
            return this.evaluateBoard(evaluationMethod);
        }
        if (maximizingColor == "white") {
            let maxEvaluation = -Infinity;
            let maxMove = null;
            for (let futureBoard of this.getFutureBoards()) {
                let evaluation = futureBoard.minimax(depth - 1, alpha, beta, "black", evaluationMethod)[0];
                if (evaluation >= maxEvaluation) {
                    maxEvaluation = evaluation
                    maxMove = futureBoard.moveHistory[futureBoard.moveHistory.length - 1];
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
            return [maxEvaluation, maxMove];
        }
        else if (maximizingColor == "black") {
            let minEvaluation = Infinity;
            let minMove = null;
            for (let futureBoard of this.getFutureBoards()) {
                let evaluation = futureBoard.minimax(depth - 1, alpha, beta, "white", evaluationMethod)[0];
                if (evaluation <= minEvaluation) {
                    minEvaluation = evaluation
                    minMove = futureBoard.moveHistory[futureBoard.moveHistory.length - 1];
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) {
                    break;
                }
            }
            return [minEvaluation, minMove];
        }
    }

    getFutureBoards() {
        let futureBoards = [];
        for (let piece of this.pieceList) {
            if (piece.color == this.turn) {
                for (let move of this.getMoves(piece, true)) {
                    let moveBoard = this.copy();
                    moveBoard.move(moveBoard.getPiece(piece.coords), move, false, true);
                    if (moveBoard.promoting) {
                        for (let promotablePiece of ["queen", "knight", "bishop", "rook"]) {
                            let moveBoardPromote = moveBoard.copy();
                            moveBoardPromote.promote(moveBoardPromote.getPiece(moveBoard.promotePiece.coords), promotablePiece, false);
                            futureBoards.push(moveBoardPromote);
                        }
                    }
                    else {
                        futureBoards.push(moveBoard);
                    }
                }
            }
        }
        return futureBoards;
    }

    win(color) {
        $(color + "-victory").classList.remove("hide")
    }
}

var board = new Board();

var color = 0;
for (let y = 0; y <= 7; y++) {
    let row = document.createElement("div");
    row.classList.add("flex");
    row.classList.add("row");
    row.classList.add("board-row");
    $("board").appendChild(row);

    for (let x = 0; x <= 7; x++) {
        let square = document.createElement("div");
        square.classList.add("square");
        square.classList.add("center");
        square.id = x + "-" + y;
        if (color == 0 || color == 2) square.classList.add("white");
        else if (color == 1) square.classList.add("pink");
        else if (color == 3) square.classList.add("blue");

        square.addEventListener("click", event => {
            if (!board.promoting && board.engines[board.turn] == "n/a") {
                if (event.target.classList.contains("piece")) {
                    let piece = board.getPiece(coordsList(event.target.parentElement.id));
                    if (piece.color == board.turn) {
                        board.clearHighlight();
                        let moves = board.highlightMoves(piece);
                        board.moveSquares = [];
                        board.movePiece = piece;
                        board.moving = true;
                        for (let move of moves) {
                            board.moveSquares.push($(coordsString(move)));
                        }
                    }
                    else {
                        board.clearHighlight();
                        if (board.moveSquares.includes(event.target.parentElement)) {
                            board.move(board.movePiece, coordsList(event.target.parentElement.id), true, false);
                            board.moveSquares = [];
                            if (!board.promoting) {
                                board.endTurn();
                            }
                        }
                    }
                }
                else if (event.target.classList.contains("square")) {
                    board.clearHighlight();
                    if (board.moveSquares.includes(event.target) && board.moving) {
                        board.move(board.movePiece, coordsList(event.target.id), true, false);
                        board.moveSquares = [];
                        if (!board.promoting) {
                            board.endTurn();
                        }
                    }
                }
            }
        })

        row.appendChild(square);
        if (x < 7) color++;
        color %= 4;

        switch(y) {
            case 0:
                switch(x) {
                    case 0:
                        new Piece("rook", "black", [x, y], board, square, true);
                        break;
                    case 1:
                        new Piece("knight", "black", [x, y], board, square, true);
                        break;
                    case 2:
                        new Piece("bishop", "black", [x, y], board, square, true);
                        break;
                    case 3:
                        new Piece("queen", "black", [x, y], board, square, true);
                        break;
                    case 4:
                        new Piece("king", "black", [x, y], board, square, true);
                        break;
                    case 5:
                        new Piece("bishop", "black", [x, y], board, square, true);
                        break;
                    case 6:
                        new Piece("knight", "black", [x, y], board, square, true);
                        break;
                    case 7:
                        new Piece("rook", "black", [x, y], board, square, true);
                        break;
                }
                break;
            case 1:
                new Piece("pawn", "black", [x, y], board, square, true);
                break;
            case 6:
                new Piece("pawn", "white", [x, y], board, square, true);
                break;
            case 7:
                switch(x) {
                    case 0:
                        new Piece("rook", "white", [x, y], board, square, true);
                        break;
                    case 1:
                        new Piece("knight", "white", [x, y], board, square, true);
                        break;
                    case 2:
                        new Piece("bishop", "white", [x, y], board, square, true);
                        break;
                    case 3:
                        new Piece("queen", "white", [x, y], board, square, true);
                        break;
                    case 4:
                        new Piece("king", "white", [x, y], board, square, true);
                        break;
                    case 5:
                        new Piece("bishop", "white", [x, y], board, square, true);
                        break;
                    case 6:
                        new Piece("knight", "white", [x, y], board, square, true);
                        break;
                    case 7:
                        new Piece("rook", "white", [x, y], board, square, true);
                        break;
                }
                break;
        }
    }
}

for (let element of document.getElementsByClassName("promotion-piece")) {
    element.addEventListener("click", event => {
        let piece = event.target.id.split("-")[1];
        board.promote(board.promotePiece, piece, true);
        board.promoting = false;
        board.clearHighlight();
        $("promotion").classList.add("hide");
    })
}