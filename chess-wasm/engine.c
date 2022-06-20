#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
// #include <sys/time.h>

// #include <emscripten/emscripten.h>

enum piecetype {
    NONE = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6
};

typedef struct piece piece;
typedef struct board board;
typedef struct intlist intlist;
typedef struct movelist movelist;
typedef struct boardtreenode boardtreenode;

struct piece {
    int x;
    int y;
    int piecetype;
    bool iswhite;
    bool moved;
    board *parentboard;
};

struct board {
    piece * pieces[8][8];
    bool iswhitesturn;
};

struct intlist {
    int *array;
    int length;
};

struct movelist {
    int **movearray;
    int length;
};

struct boardtreenode {
    bool hasparent;
    boardtreenode *parent;
    bool haschildren;
    int childcount;
    boardtreenode **children;
    board *board;
    piece *movedeltapiece;
    int *movedeltacoords;
};


void freeintlist(intlist *intlist);
void freemovelist(movelist *movelist);
void freeboardtree(boardtreenode *boardtreenode);
piece *newpiece(int x, int y, int piecetype, bool iswhite, bool moved, board *parentboard);
void copypiece(piece *sourcepiece, piece *targetpiece);
void printpiece(piece *piece);
piece *getpiece(board *board, int x, int y);
void freeboard(board *board);
void printboard(board *board);
void setpiece(piece *piece, int piecetype, bool iswhite);
bool checkenpassent(bool white, int x, int y);
intlist *moverange(int start, int end);
int min(int x, int y);
int max(int x, int y);
int getmovecount(piece *piece, bool docheckcheck);
int **getmovearray(piece *piece, int movecount, bool docheckcheck);
movelist *getmoves(piece *piece, bool docheckcheck);
boardtreenode *getfuturestates(board *board, int depth, bool newtree);
void printintlist(intlist *intlist);
void printmoves(movelist *movelist);
bool movepiece(piece *piece, int x, int y, bool force);
piece *getking(board *board, bool white);
board *newboard(bool initialize);
board *copyboard(board *sourceboard, board *targetboard);

void freeintlist(intlist *intlist) {
    free(intlist->array);
    free(intlist);
}

void freemovelist(movelist *movelist) {
    for (int i = 0; i < movelist->length; i++) {
        free(movelist->movearray[i]);
    }
    free(movelist->movearray);
    free(movelist);
}

void freeboardtree(boardtreenode *freeboardtreenode) {
    // printf("called\n");
    if (freeboardtreenode->haschildren) {
        for (int i = 0; i < freeboardtreenode->childcount; i++) {
            // printf("freeing child #%d\n", i);
            freeboardtree(freeboardtreenode->children[i]);
        }
    }
    // printf("freeing board\n");
    // printboard(freeboardtreenode->board);
    freeboard(freeboardtreenode->board);
    // printf("freeing movedeltacoords\n");
    free(freeboardtreenode->movedeltacoords);
    // printf("freeing self\n");
    free(freeboardtreenode);
    // printf("done freeing entire node\n");
}

piece *newpiece(int x, int y, int piecetype, bool iswhite, bool moved, board *parentboard) {
    piece *newpiece = (piece *) malloc(sizeof(piece));
    newpiece->x = x;
    newpiece->y = y;
    newpiece->piecetype = piecetype;
    newpiece->iswhite = iswhite;
    newpiece->moved = moved;
    newpiece->parentboard = parentboard;
    return newpiece;
}

void copypiece(piece *sourcepiece, piece *targetpiece) {
    targetpiece->x = sourcepiece->x;
    targetpiece->y = sourcepiece->y;
    targetpiece->piecetype = sourcepiece->piecetype;
    targetpiece->iswhite = sourcepiece->iswhite;
    targetpiece->moved = sourcepiece->moved;
    targetpiece->parentboard = sourcepiece->parentboard;
}

void printpiece(piece *piece) {
    printf("(%d, %d): %d, %d, %d\n", piece->x, piece->y, piece->piecetype, piece->iswhite, piece->moved);
}

piece *getpiece(board *board, int x, int y) {
    return board->pieces[x][y];
}

void freeboard(board *freeboard) {
    // printf("freeing board from freeboard\n");
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            // printf("(%d, %d)\n", x, y);
            free(getpiece(freeboard, x, y));
        }
    }
    // printf("freed all pieces\n");
    // printf("board address: %d", (int) freeboard);
    free(freeboard);
    // printf("freed board struct\n");
}

void printboard(board *board) {
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            printpiece(getpiece(board, x, y));
        }
    }
}

void setpiece(piece *piece, int piecetype, bool iswhite) {
    piece->piecetype = piecetype;
    piece->iswhite = iswhite;
}

bool checkenpassent(bool white, int x, int y) {
    return false; // TODO: actually code this lol
}

intlist *moverange(int start, int end) {
    intlist *range = (intlist *) malloc(sizeof(intlist));
    if (start < end) {
        range->length = (end - start);
        range->array = (int *) malloc(range->length * sizeof(int));
        int offset = 0;
        for (int i = start + 1; i <= end; i++) {
            range->array[offset] = i;
            offset++;
        }
    }
    else if (start > end) {
        range->length = (start - end);
        range->array = (int *) malloc(range->length * sizeof(int));
        int offset = 0;
        for (int i = start - 1; i >= end; i--) {
            range->array[offset] = i;
            offset++;
        }
    }
    else {
        range->length = 0;
        range->array = NULL;
    }
    return range;
}

int min(int x, int y) {
    if (x <= y) {
        return x;
    }
    else {
        return y;
    }
}

int max(int x, int y) {
    if (x >= y) {
        return x;
    }
    else {
        return y;
    }
}

int getmovecount(piece *piece, bool docheckcheck) {
    int movecount = 0;
    board *board = piece->parentboard;
    if (piece->piecetype == PAWN && !piece->iswhite) {
        
        if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE) {
            movecount++;
        }
        if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE && getpiece(board, piece->x, piece->y + 2)->piecetype == NONE) {
            movecount++;
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if ((getpiece(board, piece->x + 1, piece->y + 1)->piecetype != NONE && getpiece(board, piece->x + 1, piece->y + 1)->iswhite) || checkenpassent(true, piece->x + 1, piece->y + 1)) {
                movecount++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if ((getpiece(board, piece->x - 1, piece->y + 1)->piecetype != NONE && getpiece(board, piece->x - 1, piece->y + 1)->iswhite) || checkenpassent(true, piece->x - 1, piece->y + 1)) {
                movecount++;
            }
        }
    }

    else if (piece->piecetype == PAWN && piece->iswhite) {
        if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE) {
            movecount++;
        }
        if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE && getpiece(board, piece->x, piece->y - 2)->piecetype == NONE) {
            movecount++;
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if ((getpiece(board, piece->x + 1, piece->y - 1)->piecetype != NONE && getpiece(board, piece->x + 1, piece->y - 1)->iswhite) || checkenpassent(true, piece->x + 1, piece->y - 1)) {
                movecount++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if ((getpiece(board, piece->x - 1, piece->y - 1)->piecetype != NONE && getpiece(board, piece->x - 1, piece->y - 1)->iswhite) || checkenpassent(true, piece->x - 1, piece->y - 1)) {
                movecount++;
            }
        }
    }

    else if (piece->piecetype == ROOK) {
        intlist *range;
        if (piece->x != 7) {
            range = moverange(piece->x, 7);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->x != 0) {
            range = moverange(piece->x, 0);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 7) {
            range = moverange(piece->y, 7);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 0) {
            range = moverange(piece->y, 0);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
    }

    else if (piece->piecetype == BISHOP) {
        intlist *xlist;
        intlist *ylist;
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 7) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 0) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
    }

    else if (piece->piecetype == KNIGHT) {
        if ((0 <= piece->x + 2 && piece->x + 2 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) &&
        (getpiece(board, piece->x + 2, piece->y + 1)->piecetype == NONE ||
        getpiece(board, piece->x + 2, piece->y + 1)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 2 && piece->y + 2 <= 7) &&
        (getpiece(board, piece->x + 1, piece->y + 2)->piecetype == NONE ||
        getpiece(board, piece->x + 1, piece->y + 2)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 2 && piece->y + 2 <= 7) &&
        (getpiece(board, piece->x - 1, piece->y + 2)->piecetype == NONE ||
        getpiece(board, piece->x - 1, piece->y + 2)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x - 2 && piece->x - 2 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) &&
        (getpiece(board, piece->x - 2, piece->y + 1)->piecetype == NONE ||
        getpiece(board, piece->x - 2, piece->y + 1)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x - 2 && piece->x - 2 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) &&
        (getpiece(board, piece->x - 2, piece->y - 1)->piecetype == NONE ||
        getpiece(board, piece->x - 2, piece->y - 1)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 2 && piece->y - 2 <= 7) &&
        (getpiece(board, piece->x - 1, piece->y - 2)->piecetype == NONE ||
        getpiece(board, piece->x - 1, piece->y - 2)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 2 && piece->y - 2 <= 7) &&
        (getpiece(board, piece->x + 1, piece->y - 2)->piecetype == NONE ||
        getpiece(board, piece->x + 1, piece->y - 2)->iswhite != piece->iswhite)) {
            movecount++;
        }
        if ((0 <= piece->x + 2 && piece->x + 2 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) &&
        (getpiece(board, piece->x + 2, piece->y - 1)->piecetype == NONE ||
        getpiece(board, piece->x + 2, piece->y - 1)->iswhite != piece->iswhite)) {
            movecount++;
        }
    }

    else if (piece->piecetype == QUEEN) {
        intlist *range;
        if (piece->x != 7) {
            range = moverange(piece->x, 7);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->x != 0) {
            range = moverange(piece->x, 0);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 7) {
            range = moverange(piece->y, 7);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 0) {
            range = moverange(piece->y, 0);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movecount++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        intlist *xlist;
        intlist *ylist;
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 7) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 0) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movecount++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movecount++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
    }

    else if (piece->piecetype == KING) {
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x + 1, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y + 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y && piece->y <= 7) {
            if (getpiece(board, piece->x + 1, piece->y)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x + 1, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y - 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x && piece->x <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x, piece->y - 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x - 1, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y - 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y && piece->y <= 7) {
            if (getpiece(board, piece->x - 1, piece->y)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x - 1, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y + 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (0 <= piece->x && piece->x <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x, piece->y + 1)->iswhite != piece->iswhite) {
                movecount++;
            }
        }
        if (!piece->moved) {
            if (getpiece(board, piece->x + 3, piece->y)) {
                if (!getpiece(board, piece->x + 1, piece->y) && !getpiece(board, piece->x + 2, piece->y) && !getpiece(board, piece->x + 3, piece->y)->moved && getpiece(board, piece->x + 3, piece->y)->piecetype == ROOK) {
                    movecount++;
                }
            }
            if (getpiece(board, piece->x - 4, piece->y)) {
                if (!getpiece(board, piece->x - 1, piece->y) && !getpiece(board, piece->x - 2, piece->y) && !getpiece(board, piece->x - 3, piece->y) && !getpiece(board, piece->x - 4, piece->y)->moved && getpiece(board, piece->x - 4, piece->y)->piecetype == ROOK) {
                    movecount++;
                }
            }
        }
    }

    return movecount;
}

int **getmovearray(piece *piece, int movecount, bool docheckcheck) {
    board *board = piece->parentboard;
    int ** movearray = (int **) malloc(movecount * 2 * sizeof(int));
    for (int i = 0; i < movecount; i++) {
        movearray[i] = (int *) malloc(2 * sizeof(int));
    }
    int move = 0;
    
    if (piece->piecetype == PAWN && !piece->iswhite) {
        if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE) {
            movearray[move][0] = piece->x;
            movearray[move][1] = piece->y + 1;
            move++;
        }
        if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE && getpiece(board, piece->x, piece->y + 2)->piecetype == NONE) {
            movearray[move][0] = piece->x;
            movearray[move][1] = piece->y + 2;
            move++;
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if ((getpiece(board, piece->x + 1, piece->y + 1)->piecetype != NONE && getpiece(board, piece->x + 1, piece->y + 1)->iswhite) || checkenpassent(true, piece->x + 1, piece->y + 1)) {
                movearray[move][0] = piece->x + 1;
                movearray[move][1] = piece->y + 1;
                move++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if ((getpiece(board, piece->x - 1, piece->y + 1)->piecetype != NONE && getpiece(board, piece->x - 1, piece->y + 1)->iswhite) || checkenpassent(true, piece->x - 1, piece->y + 1)) {
                movearray[move][0] = piece->x - 1;
                movearray[move][1] = piece->y + 1;
                move++;
            }
        }
        
    }

    else if (piece->piecetype == PAWN && piece->iswhite) {
        if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE) {
            movearray[move][0] = piece->x;
            movearray[move][1] = piece->y - 1;
            move++;
        }
        if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE && getpiece(board, piece->x, piece->y - 2)->piecetype == NONE) {
            movearray[move][0] = piece->x;
            movearray[move][1] = piece->y - 2;
            move++;
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if ((getpiece(board, piece->x + 1, piece->y - 1)->piecetype != NONE && getpiece(board, piece->x + 1, piece->y - 1)->iswhite) || checkenpassent(true, piece->x + 1, piece->y - 1)) {
                movearray[move][0] = piece->x + 1;
                movearray[move][1] = piece->y - 1;
                move++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if ((getpiece(board, piece->x - 1, piece->y - 1)->piecetype != NONE && getpiece(board, piece->x - 1, piece->y - 1)->iswhite) || checkenpassent(true, piece->x - 1, piece->y - 1)) {
                movearray[move][0] = piece->x - 1;
                movearray[move][1] = piece->y - 1;
                move++;
            }
        }
    }

    else if (piece->piecetype == ROOK) {
        intlist *range;
        if (piece->x != 7) {
            range = moverange(piece->x, 7);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->x != 0) {
            range = moverange(piece->x, 0);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 7) {
            range = moverange(piece->y, 7);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 0) {
            range = moverange(piece->y, 0);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
    }

    else if (piece->piecetype == BISHOP) {
        intlist *xlist;
        intlist *ylist;
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 7) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 0) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
    }

    else if (piece->piecetype == KNIGHT) {
        if ((0 <= piece->x + 2 && piece->x + 2 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) &&
        (getpiece(board, piece->x + 2, piece->y + 1)->piecetype == NONE ||
        getpiece(board, piece->x + 2, piece->y + 1)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x + 2;
            movearray[move][1] = piece->y + 1;
            move++;
        }
        if ((0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 2 && piece->y + 2 <= 7) &&
        (getpiece(board, piece->x + 1, piece->y + 2)->piecetype == NONE ||
        getpiece(board, piece->x + 1, piece->y + 2)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x + 1;
            movearray[move][1] = piece->y + 2;
            move++;
        }
        if ((0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 2 && piece->y + 2 <= 7) &&
        (getpiece(board, piece->x - 1, piece->y + 2)->piecetype == NONE ||
        getpiece(board, piece->x - 1, piece->y + 2)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x - 1;
            movearray[move][1] = piece->y + 2;
            move++;
        }
        if ((0 <= piece->x - 2 && piece->x - 2 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) &&
        (getpiece(board, piece->x - 2, piece->y + 1)->piecetype == NONE ||
        getpiece(board, piece->x - 2, piece->y + 1)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x - 2;
            movearray[move][1] = piece->y + 1;
            move++;
        }
        if ((0 <= piece->x - 2 && piece->x - 2 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) &&
        (getpiece(board, piece->x - 2, piece->y - 1)->piecetype == NONE ||
        getpiece(board, piece->x - 2, piece->y - 1)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x - 2;
            movearray[move][1] = piece->y - 1;
            move++;
        }
        if ((0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 2 && piece->y - 2 <= 7) &&
        (getpiece(board, piece->x - 1, piece->y - 2)->piecetype == NONE ||
        getpiece(board, piece->x - 1, piece->y - 2)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x - 1;
            movearray[move][1] = piece->y - 2;
            move++;
        }
        if ((0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 2 && piece->y - 2 <= 7) &&
        (getpiece(board, piece->x + 1, piece->y - 2)->piecetype == NONE ||
        getpiece(board, piece->x + 1, piece->y - 2)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x + 1;
            movearray[move][1] = piece->y - 2;
            move++;
        }
        if ((0 <= piece->x + 2 && piece->x + 2 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) &&
        (getpiece(board, piece->x + 2, piece->y - 1)->piecetype == NONE ||
        getpiece(board, piece->x + 2, piece->y - 1)->iswhite != piece->iswhite)) {
            movearray[move][0] = piece->x + 2;
            movearray[move][1] = piece->y - 1;
            move++;
        }
    }

    else if (piece->piecetype == QUEEN) {
        intlist *range;
        if (piece->x != 7) {
            range = moverange(piece->x, 7);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->x != 0) {
            range = moverange(piece->x, 0);
            for (int x = 0; x < range->length; x++) {
                if (getpiece(board, range->array[x], piece->y)->piecetype == NONE) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                else if (getpiece(board, range->array[x], piece->y)->iswhite != piece->iswhite) {
                    movearray[move][0] = range->array[x];
                    movearray[move][1] = piece->y;
                    move++;
                }
                if (getpiece(board, range->array[x], piece->y)->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 7) {
            range = moverange(piece->y, 7);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        if (piece->y != 0) {
            range = moverange(piece->y, 0);
            for (int y = 0; y < range->length; y++) {
                if (getpiece(board, piece->x, range->array[y])->piecetype == NONE) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                else if (getpiece(board, piece->x, range->array[y])->iswhite != piece->iswhite) {
                    movearray[move][0] = piece->x;
                    movearray[move][1] = range->array[y];
                    move++;
                }
                if (getpiece(board, piece->x, range->array[y])->piecetype != NONE) {
                    break;
                }
            }
            freeintlist(range);
        }
        intlist *xlist;
        intlist *ylist;
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 7) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 7);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 0 || piece->y != 0) {
            xlist = moverange(piece->x, 0);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
        if (piece->x != 7 || piece->y != 7) {
            xlist = moverange(piece->x, 7);
            ylist = moverange(piece->y, 0);
            for (int i = 0; i < min(xlist->length, ylist->length); i++) {
                if (!getpiece(board, xlist->array[i], ylist->array[i])) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                else if (getpiece(board, xlist->array[i], ylist->array[i])->iswhite != piece->iswhite) {
                    movearray[move][0] = xlist->array[i];
                    movearray[move][1] = ylist->array[i];
                    move++;
                }
                if (getpiece(board, xlist->array[i], ylist->array[i])) break;
            }
            free(xlist);
            free(ylist);
        }
    }

    else if (piece->piecetype == KING) {
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x + 1, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y + 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x + 1;
                movearray[move][1] = piece->y + 1;
                move++;
            }
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y && piece->y <= 7) {
            if (getpiece(board, piece->x + 1, piece->y)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x + 1;
                movearray[move][1] = piece->y;
                move++;
            }
        }
        if (0 <= piece->x + 1 && piece->x + 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x + 1, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x + 1, piece->y - 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x + 1;
                movearray[move][1] = piece->y - 1;
                move++;
            }
        }
        if (0 <= piece->x && piece->x <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x, piece->y - 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x;
                movearray[move][1] = piece->y - 1;
                move++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y - 1 && piece->y - 1 <= 7) {
            if (getpiece(board, piece->x - 1, piece->y - 1)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y - 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x - 1;
                movearray[move][1] = piece->y - 1;
                move++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y && piece->y <= 7) {
            if (getpiece(board, piece->x - 1, piece->y)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x - 1;
                movearray[move][1] = piece->y;
                move++;
            }
        }
        if (0 <= piece->x - 1 && piece->x - 1 <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x - 1, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x - 1, piece->y + 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x - 1;
                movearray[move][1] = piece->y + 1;
                move++;
            }
        }
        if (0 <= piece->x && piece->x <= 7 && 0 <= piece->y + 1 && piece->y + 1 <= 7) {
            if (getpiece(board, piece->x, piece->y + 1)->piecetype == NONE || getpiece(board, piece->x, piece->y + 1)->iswhite != piece->iswhite) {
                movearray[move][0] = piece->x;
                movearray[move][1] = piece->y + 1;
                move++;
            }
        }
        if (!piece->moved) {
            if (getpiece(board, piece->x + 3, piece->y)->piecetype == ROOK) {
                if (!getpiece(board, piece->x + 1, piece->y) && !getpiece(board, piece->x + 2, piece->y) && !getpiece(board, piece->x + 3, piece->y)->moved) {
                    movearray[move][0] = piece->x + 2;
                    movearray[move][1] = piece->y;
                    move++;
                }
            }
            if (getpiece(board, piece->x - 4, piece->y)->piecetype == ROOK) {
                if (!getpiece(board, piece->x - 1, piece->y) && !getpiece(board, piece->x - 2, piece->y) && !getpiece(board, piece->x - 3, piece->y) && !getpiece(board, piece->x - 4, piece->y)->moved) {
                    movearray[move][0] = piece->x - 2;
                    movearray[move][1] = piece->y;
                    move++;
                }
            }
        }
    }

    return movearray;
}

movelist *getmoves(piece *piece, bool docheckcheck) {
    board *board = piece->parentboard;
    int movecount = getmovecount(piece, docheckcheck);
    movelist *moves = (movelist *) malloc(sizeof(movelist));
    moves->length = movecount;
    moves->movearray = getmovearray(piece, movecount, docheckcheck);
    return moves;
}

boardtreenode *getfuturestates(board *startingboard, int depth, bool newtree) {
    boardtreenode *futurestates = (boardtreenode *) malloc(sizeof(boardtreenode));
    if (newtree) {
        futurestates->board = startingboard;
        futurestates->haschildren = true;
        futurestates->hasparent = !newtree;
    }
    int futurestatecount = 0;
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            if (getpiece(startingboard, x, y)->iswhite == startingboard->iswhitesturn) {
                futurestatecount += getmovecount(getpiece(startingboard, x, y), false);
            }
        }
    }
    futurestates->childcount = futurestatecount;
    futurestates->children = (boardtreenode **) malloc(futurestatecount * sizeof(boardtreenode *));
    int move = 0;
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            if (getpiece(startingboard, x, y)->iswhite == startingboard->iswhitesturn) {
                movelist *moves = getmoves(getpiece(startingboard, x, y), false);
                board *childboard = (board *) malloc(sizeof(board));
                if (moves->length != 0) {
                    for (int i = 0; i < moves->length; i++) {
                        copyboard(startingboard, childboard);
                        movepiece(getpiece(childboard, x, y), moves->movearray[i][0], moves->movearray[i][1], true);
                        boardtreenode *childstate;
                        if (depth > 1) {
                            childstate = getfuturestates(childboard, depth - 1, false);
                            childstate->board = childboard;
                            childstate->movedeltapiece = getpiece(childboard, x, y);
                            childstate->movedeltacoords = malloc(2 * sizeof(int));
                            childstate->movedeltacoords[0] = moves->movearray[i][0];
                            childstate->movedeltacoords[1] = moves->movearray[i][1];
                            childstate->hasparent = true;
                            childstate->parent = futurestates;
                            childstate->haschildren = true;
                        }
                        else {
                            childstate = (boardtreenode *) malloc(sizeof(boardtreenode));
                            childstate->board = childboard;
                            childstate->movedeltapiece = getpiece(childboard, x, y);
                            childstate->movedeltacoords = malloc(2 * sizeof(int));
                            childstate->movedeltacoords[0] = moves->movearray[i][0];
                            childstate->movedeltacoords[1] = moves->movearray[i][1];
                            childstate->hasparent = true;
                            childstate->parent = futurestates;
                            childstate->haschildren = false;
                            childstate->childcount = 0;
                        }
                        futurestates->children[move] = childstate;
                        move++;
                    }
                }
                freemovelist(moves);
            }
        }
    }

    return futurestates;
}

void printintlist(intlist *intlist) {
    printf("{");
    bool first = true;
    for (int i = 0; i < intlist->length; i++) {
        if (!first) {
            printf(", ");
        }
        printf("%d", intlist->array[i]);
        first = false;
    }
    printf("}\n");
}

void printmoves(movelist *movelist) {
    printf("{");
    bool first = true;
    for (int i = 0; i < movelist->length; i++) {
        if (!first) {
            printf(", ");
        }
        printf("{%d, %d}", movelist->movearray[i][0], movelist->movearray[i][1]);
        first = false;
    }
    printf("}\n");
}

bool movepiece(piece *piece, int x, int y, bool force) {
    movelist *moves = getmoves(piece, force);
    bool validmove = false;
    if (!force) {
        for (int i = 0; i < moves->length; i++) {
            if (moves->movearray[i][0] == x && moves->movearray[i][1] == y) {
                validmove = true;
            }
        } 
    }
    if (force || validmove) {
        piece->moved = true;
        piece->parentboard->pieces[x][y] = piece;
        piece->parentboard->pieces[piece->x][piece->y] = newpiece(piece->x, piece->y, NONE, false, false, piece->parentboard);
        piece->x = x;
        piece->y = y;
        piece->parentboard->iswhitesturn = !piece->parentboard->iswhitesturn;
        return true;
    }
    else {
        return false;
    }
}

piece *getking(board *board, bool white) {
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            piece *checkpiece = getpiece(board, x, y);
            if (checkpiece->piecetype == KING && checkpiece->iswhite == white) {
                return checkpiece;
            }
        }
    }
    return NULL;
}

board *newboard(bool initialize) {
    board *newboard = (board *) malloc(sizeof(board));
    if (initialize) {
        for (int y = 0; y < 8; y++) {
            for (int x = 0; x < 8; x++) {
                switch(y) {
                    case 0:
                        switch(x) {
                            case 0:
                                (*newboard).pieces[x][y] = newpiece(0, 0, ROOK, false, false, newboard);
                                break;
                            case 1:
                                (*newboard).pieces[x][y] = newpiece(1, 0, KNIGHT, false, false, newboard);
                                break;
                            case 2:
                                (*newboard).pieces[x][y] = newpiece(2, 0, BISHOP, false, false, newboard);
                                break;
                            case 3:
                                (*newboard).pieces[x][y] = newpiece(3, 0, QUEEN, false, false, newboard);
                                break;
                            case 4:
                                (*newboard).pieces[x][y] = newpiece(4, 0, KING, false, false, newboard);
                                break;
                            case 5:
                                (*newboard).pieces[x][y] = newpiece(5, 0, BISHOP, false, false, newboard);
                                break;
                            case 6:
                                (*newboard).pieces[x][y] = newpiece(6, 0, KNIGHT, false, false, newboard);
                                break;
                            case 7:
                                (*newboard).pieces[x][y] = newpiece(7, 0, ROOK, false, false, newboard);
                                break;
                        }
                        break;
                    case 1:
                        (*newboard).pieces[x][y] = newpiece(x, 1, PAWN, false, false, newboard);
                        break;
                    case 6:
                        (*newboard).pieces[x][y] = newpiece(x, 6, PAWN, true, false, newboard);
                        break;
                    case 7:
                        switch(x) {
                            case 0:
                                (*newboard).pieces[x][y] = newpiece(0, 7, ROOK, true, false, newboard);
                                break;
                            case 1:
                                (*newboard).pieces[x][y] = newpiece(1, 7, KNIGHT, true, false, newboard);
                                break;
                            case 2:
                                (*newboard).pieces[x][y] = newpiece(2, 7, BISHOP, true, false, newboard);
                                break;
                            case 3:
                                (*newboard).pieces[x][y] = newpiece(3, 7, QUEEN, true, false, newboard);
                                break;
                            case 4:
                                (*newboard).pieces[x][y] = newpiece(4, 7, KING, true, false, newboard);
                                break;
                            case 5:
                                (*newboard).pieces[x][y] = newpiece(5, 7, BISHOP, true, false, newboard);
                                break;
                            case 6:
                                (*newboard).pieces[x][y] = newpiece(6, 7, KNIGHT, true, false, newboard);
                                break;
                            case 7:
                                (*newboard).pieces[x][y] = newpiece(7, 7, ROOK, true, false, newboard);
                                break;
                        }
                        break;
                    default:
                        (*newboard).pieces[x][y] = newpiece(x, y, NONE, false, false, newboard);
                        break;
                }
            }
        }
        newboard->iswhitesturn = true;
    }
    return newboard;
}

board *copyboard(board *sourceboard, board *targetboard) {
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            targetboard->pieces[x][y] = (piece *) malloc(sizeof(piece));
            copypiece(sourceboard->pieces[x][y], targetboard->pieces[x][y]);
            targetboard->pieces[x][y]->parentboard = targetboard;
        }
    }
    targetboard->iswhitesturn = sourceboard->iswhitesturn;
    return targetboard;
}

// long getmicrotime() {
// 	struct timeval currentTime;
// 	gettimeofday(&currentTime, NULL);
// 	return currentTime.tv_sec * (int) 1e6 + currentTime.tv_usec;
// }

// EMSCRIPTEN_KEEPALIVE void handleclick(int x, int y) {
//     printf("%d\n", x + y);
// }

// extern void highlightsquare(int x, int y);

// extern void clearhighlight();

int main(void) {

    board *testboard = newboard(true);
    // printf("testboard\n");
    // printf("moves of (3, 1): ");
    // movelist *testmovelist = getmoves(getpiece(testboard, 3, 1), true);
    // printmoves(testmovelist);
    // long starttime = getmicrotime();
    boardtreenode * futuremoves = getfuturestates(testboard, 1, true);
    // long endtime = getmicrotime();

    // printboard(futuremoves->nodes[0]->board);
    // printf("%d\n", futuremoves->nodecount);
    printf("futuremoves->nodecount: %d\n", futuremoves->childcount);
    for (int i = 0; i < futuremoves->childcount; i++) {
        printf("future state %d:\n", i);
        printboard(futuremoves->children[i]->board);
    }
    // printf("took %d for getfuturestates of depth 4\n", (int) (endtime - starttime));

    freeboard(testboard);
    // for (int i = 0; i < futuremoves->childcount; i++) {
    //     printf("%d\n", i);
    //     freeboardtree(futuremoves->children[i]);
    // }
    freeboardtree(futuremoves);

    printf("executed successfully\n");

    // copyboard(newboard());

    // piece gotpiece = (piece) getpiecetype(5, 6);

    // printf("gotpiece: %d\n", gotpiece);

    // movepiece(0, 0, 1, 1);
    // deletepiece(1, 1);
    // changepiece(2, 2, QUEEN);
    
    return 0;
}