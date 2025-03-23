const validMoves = getValidMoves(player);
const MAX_DEPTH = 6;
let bestScore = -Infinity;
let bestMove = null;

let startWeights = [
    [70, 20, 50, 50, 50, 50, 20, 70],
    [20, 0, 50, 50, 50, 50, 0, 20],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [20, 0, 50, 50, 50, 50, 0, 20],
    [70, 20, 50, 50, 50, 50, 20, 70]
];

function makeRandomMove(validMoves) {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
}

// Minimax algorithm
function minimax(board, depth, alpha, beta, maximizingPlayer, weights) {
    // Termination condition
    if (depth === 0) {
        // Board evaluation
        let score = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] === WHITE) {
                    score += weights[row][col];
                } else if (board[row][col] === BLACK) {
                    score -= weights[row][col];
                }
            }
        }
        return score;
    }
    
    // Get valid moves for current player
    const currentValidMoves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMoveForMinimax(board, row, col, maximizingPlayer)) {
                currentValidMoves.push({ row, col });
            }
        }
    }
    
    // If no valid moves, pass turn to opponent
    if (currentValidMoves.length === 0) {
        // Recursive call with opponent player
        return minimax(board, depth - 1, alpha, beta, !maximizingPlayer, weights);
    }
    
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of currentValidMoves) {
            let new_weights = weights.slice();
            const boardCopy = board.map(row => [...row]);
            
            // Simulate the move
            makeSimulatedMove(boardCopy, move.row, move.col, maximizingPlayer, new_weights);
            
            // Recursive evaluation
            const eval = minimax(boardCopy, depth - 1, alpha, beta, false, new_weights);
            maxEval = Math.max(maxEval, eval);
            
            // Alpha-beta pruning
            alpha = Math.max(alpha, eval);
            if (beta <= alpha)
                break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of currentValidMoves) {
            let new_weights = weights.slice();
            const boardCopy = board.map(row => [...row]);
            
            // Simulate the move
            makeSimulatedMove(boardCopy, move.row, move.col, !maximizingPlayer, new_weights);
            
            // Recursive evaluation
            const eval = minimax(boardCopy, depth - 1, alpha, beta, true, new_weights);
            minEval = Math.min(minEval, eval);
            
            // Alpha-beta pruning
            beta = Math.min(beta, eval);
            if (beta <= alpha)
                break;
        }
        return minEval;
    }
}

// Function to check valid moves for minimax
function isValidMoveForMinimax(board, row, col, player) {
    if (board[row][col] !== EMPTY) {
        return false;
    }
    
    const opponent = player === 1 ? 2 : 1;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        let foundOpponent = false;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
            foundOpponent = true;
            r += dr;
            c += dc;
        }
        
        if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            return true;
        }
    }
    
    return false;
}

// Function to simulate moves for minimax
function makeSimulatedMove(board, row, col, player, weights) {
    board[row][col] = player;
    
    // Flip discs
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        const discsToFlip = [];
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] !== EMPTY && board[r][c] !== player) {
            discsToFlip.push([r, c]);
            r += dr;
            c += dc;
        }
        
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            discsToFlip.forEach(([fr, fc]) => {
                board[fr][fc] = player;
                weights[fr][fc] -= 20;
            });
        }
    });
}

// Run minimax algorithm for each valid move
for (const move of validMoves) {
    // Copy the board
    const boardCopy = board.map(row => [...row]);
    
    // Simulate the move
    makeSimulatedMove(boardCopy, move.row, move.col, WHITE, startWeights);
    
    // Get minimax evaluation
    const score = minimax(boardCopy, MAX_DEPTH, -Infinity, Infinity, false, startWeights);
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestMove = move;
    }
}

return bestMove || makeRandomMove(validMoves);
