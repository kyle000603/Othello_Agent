const validMoves = getValidMoves(player);
const MAX_DEPTH = 4;
let bestScore = -Infinity;
let bestMove = null;
const opponent = player === 1 ? 2 : 1

let startWeights = [
    [90, -15, 10, 5, 5, 10, -15, 90],
    [-15, -25, -3, -3, -3, -3, -25, -15],
    [10, -3, 2, 1, 1, 2, -3, 10],
    [5, -3, 1, 1, 1, 1, -3, 5],
    [5, -3, 1, 1, 1, 1, -3, 5],
    [10, -3, 2, 1, 1, 2, -3, 10],
    [-15, -25, -3, -3, -3, -3, -25, -15],
    [90, -15, 10, 5, 5, 10, -15, 90]
];

function makeBestMove(validMoves) {
    for (const move of validMoves) {
        // Score based on position
        const positionScore = startWeights[move.row][move.col];
        
        if (positionScore > bestScore) {
            bestScore = positionScore;
            bestMove = move;
        }
    }
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, maximizingPlayer, weights) {
    // Termination condition
    if (depth === 0) {
        // Board evaluation
        let score = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (board[row][col] === player) {
                    score += weights[row][col];
                } else if (board[row][col] === opponent) {
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
        return minimax(board, depth - 1, maximizingPlayer === 1 ? 2 : 1, weights);
    }
    
    if (maximizingPlayer === player) {
        let maxEval = -Infinity;
        for (const move of currentValidMoves) {
            let new_weights = weights.map(row => row.slice());
            const boardCopy = board.map(row => row.slice());
            
            // Simulate the move
            makeSimulatedMove(boardCopy, move.row, move.col, opponent, new_weights, depth);
            
            // Recursive evaluation
            const eval = minimax(boardCopy, depth - 1, opponent, new_weights);
            maxEval = Math.max(maxEval, eval);
            
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of currentValidMoves) {
            let new_weights = weights.map(row => row.slice());
            const boardCopy = board.map(row => row.slice());
            
            // Simulate the move
            makeSimulatedMove(boardCopy, move.row, move.col, player, new_weights, depth);
            
            // Recursive evaluation
            const eval = minimax(boardCopy, depth - 1, player, new_weights);
            minEval = Math.min(minEval, eval);
        }
        return minEval;
    }
}

// Function to check valid moves for minimax
function isValidMoveForMinimax(board, row, col, maximizingPlayer) {
    if (board[row][col] !== 0) {
        return false;
    }
    
    const minimizingPlayer = maximizingPlayer === 1 ? 2 : 1;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        let foundOpponent = false;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === minimizingPlayer) {
            foundOpponent = true;
            r += dr;
            c += dc;
        }
        
        if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === maximizingPlayer) {
            return true;
        }
    }
    
    return false;
}

// Function to simulate moves for minimax
function makeSimulatedMove(board, row, col, maximizingPlayer, weights, depth) {
    board[row][col] = maximizingPlayer;
    
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
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] !== 0 && board[r][c] !== maximizingPlayer) {
            discsToFlip.push([r, c]);
            r += dr;
            c += dc;
        }
        
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === maximizingPlayer) {
            discsToFlip.forEach(([fr, fc]) => {
                board[fr][fc] = maximizingPlayer;
                if (maximizingPlayer === opponent){
                    weights[fr][fc] -= (MAX_DEPTH - depth);
                }
            });
        }
    });
}

// Run minimax algorithm for each valid move
for (const move of validMoves) {
    // Copy the board
    const boardCopy = board.map(row => row.slice());
    
    // Simulate the move
    makeSimulatedMove(boardCopy, move.row, move.col, player, startWeights, MAX_DEPTH);
    
    // Get minimax evaluation
    const score = minimax(boardCopy, MAX_DEPTH, player, startWeights);
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestMove = move;
    }
}

return bestMove || makeBestMove(validMoves);
