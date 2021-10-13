const BOARD_WIDTH = 100;
const BOARD_HEIGHT = 100;

const TILE_SIZE = 50;

const WHITE_TILE_COLOR = "#2F567D"; 
const BLACK_TILE_COLOR = "#1D2B45";
const HIGHLIGHT_COLOR = "rgb(175, 75, 75)";
const WHITE = 0;
const BLACK = 1;

const EMPTY = -1;
const QUEEN = 0;
const KING = 1;

const INVALID = 0;
const VALID = 1;
const VALID_CAPTURE = 2;

// const piecesCharacters = {
//     0: '♕',
//     1: '♚'
// };
const piecesCharacters = {
    0: '🛸',
    1: '🌍'
};

let chessCanvas;
let chessCtx;
let currentTeamText;

let board;
let currentTeam;

let turnCnt=1;
let playLog;

let curX;
let curY;

document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
    chessCanvas = document.getElementById("chessCanvas");
    chessCtx = chessCanvas.getContext("2d");
    chessCanvas.addEventListener("click", onClick);

    currentTeamText = document.getElementById("currentTeamText");
    playLog = document.getElementById("playLogText")

    startGame();
}

function startGame() {    
    board = new Board();
    curX = -1;
    curY = -1;

    currentTeam = WHITE;
    currentTeamText.textContent = "White's turn(1)";
    playLog.innerHTML += '<br>-------<br><br>'

    whiteCasualities = [0, 0, 0, 0, 0];
    blackCasualities = [0, 0, 0, 0, 0];

    repaintBoard();
}

function onClick(event) {
    let chessCanvasX = chessCanvas.getBoundingClientRect().left;
    let chessCanvasY = chessCanvas.getBoundingClientRect().top;

    let x = Math.floor((event.clientX-chessCanvasX)/TILE_SIZE);
    let y = Math.floor((event.clientY-chessCanvasY)/TILE_SIZE);

    if (checkValidMovement(x, y) === true) {

        playLog.innerHTML += curX + ' '+ curY + ' '+ x + ' '+ y + '<br/>'
        
        if (checkValidCapture(x, y) === true) {
            if (board.tiles[y][x].pieceType === KING) {
                alert('finish with '+turnCnt+' turn(s)');
                turnCnt = 1;
                startGame();
                return;
            }
        }


        moveSelectedPiece(x, y);

        changeCurrentTeam();
    } else {
        curX = x;
        curY = y;
    }

    repaintBoard();
}

function checkPossiblePlays() {
    if (curX < 0 || curY < 0) return;

    let tile = board.tiles[curY][curX];
    if (tile.team === EMPTY || tile.team !== currentTeam) return;

    drawTile(curX, curY, HIGHLIGHT_COLOR);

    board.resetValidMoves();

    if (tile.pieceType === QUEEN) checkPossiblePlaysQueen(curX, curY);
    else if (tile.pieceType === KING) checkPossiblePlaysKing(curX, curY);
}

function checkPossiblePlaysRook(curX, curY) {
    // Upper move
    for (let i = 1; curY-i >= 0; i++) {
        if (checkPossiblePlay(curX, curY-i)) break;
    }

    // Right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1; i++) {
        if (checkPossiblePlay(curX+i, curY)) break;
    }

    // Lower move
    for (let i = 1; curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX, curY+i)) break;
    }

    // Left move
    for (let i = 1; curX-i >= 0; i++) {
        if (checkPossiblePlay(curX-i, curY)) break;
    }
}

function checkPossiblePlaysBishop(curX, curY) {
    // Upper-right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1 && curY-i >= 0; i++) {
        if (checkPossiblePlay(curX+i, curY-i)) break;
    }

    // Lower-right move
    for (let i = 1; curX+i <= BOARD_WIDTH-1 && curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX+i, curY+i)) break;
    }

    // Lower-left move
    for (let i = 1; curX-i >= 0 && curY+i <= BOARD_HEIGHT-1; i++) {
        if (checkPossiblePlay(curX-i, curY+i)) break;
    }

    // Upper-left move
    for (let i = 1; curX-i >= 0 && curY-i >= 0; i++) {
        if (checkPossiblePlay(curX-i, curY-i)) break;
    }
}

function checkPossiblePlaysQueen(curX, curY) {
    checkPossiblePlaysBishop(curX, curY);
    checkPossiblePlaysRook(curX, curY);
}

function checkPossiblePlaysKing(curX, curY) {
    for (let i = -1; i <= 1; i++) {
        if (curY+i < 0 || curY+i > BOARD_HEIGHT-1) continue;

        for (let j = -1; j <= 1; j++) {
            if (curX+j < 0 || curX+j > BOARD_WIDTH-1) continue;
            if (i == 0 && j == 0) continue;

            checkPossiblePlay(curX+j, curY+i);
        }
    }
}

function checkPossiblePlay(x, y) {
    if (checkPossibleCapture(x, y)) return true;

    return !checkPossibleMove(x, y);
}

function checkPossibleMove(x, y) {
    if (board.tiles[y][x].team !== EMPTY) return false;

    board.validMoves[y][x] = VALID;
    drawCircle(x, y, HIGHLIGHT_COLOR);
    return true;
}

function checkPossibleCapture(x, y) {
    if (board.tiles[y][x].team !== getOppositeTeam(currentTeam) || board.tiles[y][x].team !== BLACK) return false;
    
    board.validMoves[y][x] = VALID_CAPTURE;
    drawCorners(x, y, HIGHLIGHT_COLOR);
    return true;
}

function checkValidMovement(x, y) {
    if (board.validMoves[y][x] === VALID || board.validMoves[y][x] === VALID_CAPTURE) return true;
    else return false;
}

function checkValidCapture(x, y) {
    if (board.validMoves[y][x] === VALID_CAPTURE) return true;
    else return false;
}

function moveSelectedPiece(x, y) { 
    board.tiles[y][x].pieceType = board.tiles[curY][curX].pieceType;
    board.tiles[y][x].team = board.tiles[curY][curX].team;

    board.tiles[curY][curX].pieceType = EMPTY;
    board.tiles[curY][curX].team = EMPTY;

    curX = -1;
    curY = -1;
    board.resetValidMoves();
}

function changeCurrentTeam() {
    if (currentTeam === WHITE) {
        currentTeamText.textContent = "Black's turn("+turnCnt+")";
        currentTeam = BLACK;
    } else {
        turnCnt += 1;
        currentTeamText.textContent = "White's turn("+turnCnt+")";
        currentTeam = WHITE;
    }
}

function repaintBoard() {
    drawBoard();
    checkPossiblePlays();
    drawPieces();
}

function drawBoard() {
    chessCtx.fillStyle = WHITE_TILE_COLOR;
    chessCtx.fillRect(0, 0, BOARD_WIDTH*TILE_SIZE, BOARD_HEIGHT*TILE_SIZE);
    
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if ((i+j)%2 === 1) {
                drawTile(j, i, BLACK_TILE_COLOR);
            }
        }
    }
}

function drawTile(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;
    chessCtx.fillRect(TILE_SIZE*x, TILE_SIZE*y, TILE_SIZE, TILE_SIZE);
}

function drawCircle(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;
    chessCtx.beginPath();
    chessCtx.arc(TILE_SIZE*(x+0.5), TILE_SIZE*(y+0.5), TILE_SIZE/5, 0, 2*Math.PI);
    chessCtx.fill();
}

function drawCorners(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*x, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*x+15, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*x, TILE_SIZE*y+15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*(x+1), TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*(x+1)-15, TILE_SIZE*y);
    chessCtx.lineTo(TILE_SIZE*(x+1), TILE_SIZE*y+15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*x, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*x+15, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*x, TILE_SIZE*(y+1)-15);
    chessCtx.fill();

    chessCtx.beginPath();
    chessCtx.moveTo(TILE_SIZE*(x+1), TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*(x+1)-15, TILE_SIZE*(y+1));
    chessCtx.lineTo(TILE_SIZE*(x+1), TILE_SIZE*(y+1)-15);
    chessCtx.fill();
}

function drawPieces() {
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (board.tiles[i][j].team === EMPTY) continue;
            
            if (board.tiles[i][j].team === WHITE) {
                chessCtx.fillStyle = "#D0D0D0";
            } else {
                chessCtx.fillStyle = "#000000";
            }
            
            chessCtx.font = "30px Arial";
            let pieceType = board.tiles[i][j].pieceType;
            chessCtx.fillText(piecesCharacters[pieceType], TILE_SIZE*(j+1/8), TILE_SIZE*(i+4/5));
        }
    }
}

function getOppositeTeam(team) {
    if (team === WHITE) return BLACK;
    else if (team === BLACK) return WHITE;
    else return EMPTY;
}

class Board {
    constructor() {
        this.tiles = [];

        for (let i = 0; i < 100; i++) {
            this.tiles.push([
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//10
            
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//20
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//30
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//40
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//50
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//60
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//70
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//80
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),//90
                
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY),
                new Tile(EMPTY, EMPTY)//100
            ]);
        }
        
        this.tiles[50][50] = new Tile(QUEEN, WHITE)
        this.tiles[99][0] = new Tile(KING, BLACK)
        this.tiles[0][99] = new Tile(KING, BLACK)

        this.validMoves = [];
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            this.validMoves.push([
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//10
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//20
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//30
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//40
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//50
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//60
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//70
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//80
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,//90
                
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID,
                INVALID//100
                
            ]);
        }
    }

    resetValidMoves() {
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            for (let j = 0; j < BOARD_WIDTH; j++) {
                this.validMoves[i][j] = INVALID;
            }
        }
    }
}

class Tile {
    constructor(pieceType, team) {
        this.pieceType = pieceType;
        this.team = team;
    }
}