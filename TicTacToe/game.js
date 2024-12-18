const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const ROWS = 3;
const COLS = 3;
const SQSIZE = WIDTH / COLS;

const CROSS_COLOR = '#ff6347';
const CIRC_COLOR = '#4682b4';
const LINE_COLOR = '#000';
const LINE_WIDTH = 2;
const CROSS_WIDTH = 10;
const RADIUS = SQSIZE / 4;
const OFFSET = SQSIZE / 4;

let board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];
let playerTurn = 1;
let currentMode = 'pvp';  // Possible values: 'pvp', 'randomBot', 'bestBot'

function drawBoard() {
    for (let row = 1; row < ROWS; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * SQSIZE);
        ctx.lineTo(WIDTH, row * SQSIZE);
        ctx.lineWidth = LINE_WIDTH;
        ctx.strokeStyle = LINE_COLOR;
        ctx.stroke();
    }
    for (let col = 1; col < COLS; col++) {
        ctx.beginPath();
        ctx.moveTo(col * SQSIZE, 0);
        ctx.lineTo(col * SQSIZE, HEIGHT);
        ctx.lineWidth = LINE_WIDTH;
        ctx.strokeStyle = LINE_COLOR;
        ctx.stroke();
    }
}
function drawCross(x, y) {
    ctx.beginPath();
    ctx.moveTo(x * SQSIZE + OFFSET, y * SQSIZE + OFFSET);
    ctx.lineTo((x + 1) * SQSIZE - OFFSET, (y + 1) * SQSIZE - OFFSET);
    ctx.moveTo((x + 1) * SQSIZE - OFFSET, y * SQSIZE + OFFSET);
    ctx.lineTo(x * SQSIZE + OFFSET, (y + 1) * SQSIZE - OFFSET);
    ctx.lineWidth = CROSS_WIDTH;
    ctx.strokeStyle = CROSS_COLOR;
    ctx.stroke();
}
function drawCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x * SQSIZE + SQSIZE / 2, y * SQSIZE + SQSIZE / 2, RADIUS, 0, 2 * Math.PI);
    ctx.lineWidth = CROSS_WIDTH;
    ctx.strokeStyle = CIRC_COLOR;
    ctx.stroke();
}

function checkWinner() {
    for (let row = 0; row < ROWS; row++) {
        if (board[row][0] === board[row][1] && board[row][1] === board[row][2] && board[row][0] !== 0) {
            return board[row][0];
        }
    }
    for (let col = 0; col < COLS; col++) {
        if (board[0][col] === board[1][col] && board[1][col] === board[2][col] && board[0][col] !== 0) {
            return board[0][col];
        }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== 0) {
        return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== 0) {
        return board[0][2];
    }
    return 0;
}
function isBoardFull() {
    return board.every(row => row.every(cell => cell !== 0));
}

function minimax(board, depth, isMaximizing) {
    let winner = checkWinner();

    if (winner === 1) return -10;
    if (winner === 2) return 10;
    if (isBoardFull()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (board[row][col] === 0) {
                    board[row][col] = 2;
                    let score = minimax(board, depth + 1, false);
                    board[row][col] = 0;
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (board[row][col] === 0) {
                    board[row][col] = 1;
                    let score = minimax(board, depth + 1, true);
                    board[row][col] = 0;
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

function randomMove() {
    let availableMoves = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === 0) {
                availableMoves.push({ row, col });
            }
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function bestMove() {
    let bestScore = -Infinity;
    let move;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === 0) {
                board[row][col] = 2; 
                let score = minimax(board, 0, false);
                board[row][col] = 0; 
                if (score > bestScore) {
                    bestScore = score;
                    move = { row, col };
                }
            }
        }
    }
    return move;
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / SQSIZE);
    const y = Math.floor((event.clientY - rect.top) / SQSIZE);

    if (board[y][x] === 0 && playerTurn === 1) {
        board[y][x] = 1;
        drawCross(x, y);

        if (checkWinner()) {
            setTimeout(() => {
                alert(`Player ${checkWinner()} wins!`);
                resetGame();
            }, 250);
            return;
        }
        if (isBoardFull()) {
            setTimeout(() => {
                alert(`It's a draw!`);
                resetGame();
            }, 250);
            return;
        }
        playerTurn = 2;

        if (currentMode === 'randomBot' || currentMode === 'bestBot') {
            const aiMove = (currentMode === 'randomBot') ? randomMove() : bestMove();
            board[aiMove.row][aiMove.col] = 2;
            setTimeout(() => {
                drawCircle(aiMove.col, aiMove.row);
                if (checkWinner()) {
                    setTimeout(() => {
                        alert(`Player ${checkWinner()} wins!`);
                        resetGame();
                    }, 250);
                } else if (isBoardFull()) {
                    setTimeout(() => {
                        alert(`It's a draw!`);
                        resetGame();
                    }, 250);
                } else {
                    playerTurn = 1;
                }
            }, 250);
        } else {
            playerTurn = 2;
        }
    }
    else if (board[y][x] === 0 && playerTurn === 2 && currentMode === 'pvp') {
        board[y][x] = 2;
        drawCircle(x, y);

        if (checkWinner()) {
            setTimeout(() => {
                alert(`Player ${checkWinner()} wins!`);
                resetGame();
            }, 250);
        } else if (isBoardFull()) {
            setTimeout(() => {
                alert(`It's a draw!`);
                resetGame();
            }, 250);
        } else {
            playerTurn = 1;
        }
    }
});

function resetGame() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawBoard();
    board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    playerTurn = 1;
}

document.getElementById('pvpButton').addEventListener('click', () => {
    currentMode = 'pvp';
    document.getElementById('gameMode').textContent = 'Current Mode: Player vs Player';
    resetGame();
});
document.getElementById('randomBotButton').addEventListener('click', () => {
    currentMode = 'randomBot';
    document.getElementById('gameMode').textContent = 'Current Mode: Player vs Random Bot';
    resetGame();
});
document.getElementById('bestBotButton').addEventListener('click', () => {
    currentMode = 'bestBot';
    document.getElementById('gameMode').textContent = 'Current Mode: Player vs Best Bot';
    resetGame();
});

drawBoard();
