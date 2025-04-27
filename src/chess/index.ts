import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { ChessGame } from './game';

const PORT = process.env.PORT || 8080;

// Initialize Express
const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Bind WebSocket server to existing HTTP server
const wss = new WebSocketServer({ server });

function getMessage(data: any) {
    try {
        const messageString = typeof data === 'string' ? data : data.toString('utf8');
        return JSON.parse(messageString);
    } catch (error) {
        console.error('error in getMessage function: ', error);
    }
}

function getLatestPlayer(chessGame: ChessGame) {
    return chessGame.getCurrentMovePlayer();
}

wss.on('connection', (ws) => {
    console.log('Client connected');
    const game = new ChessGame();

    // Send initial message
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket Server!' }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = getMessage(data);
            console.log(`Received: ${message.action}`);

            let currentMovePlayedBy = getLatestPlayer(game);

            const action = message.action;
            switch (action) {
                case 'startGame': {
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'isInCheck': { 
                    const isInCheck = currentMovePlayedBy.isInCheck(game.getBoard());
                    
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        isInCheck,
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'getPossibleInterferences': { 
                    const isInCheck = currentMovePlayedBy.isInCheck(game.getBoard());
                    if (isInCheck) {
                        ws.send(JSON.stringify({
                            actionEvent: action,
                            responseEvent: 'response',
                            possibleMoves: currentMovePlayedBy.getAllPossibleCheckInterferences(game.getBoard()),
                            game: {
                                ...game,
                                chessBoard: { board: Object.fromEntries(game.getBoard()) }
                            }
                        }));
                    } else {
                        // if not in check, no point calling this function. Return error.
                        ws.send(JSON.stringify({
                            actionEvent: action,
                            responseEvent: 'response',
                            errorMessage: 'King is not in check, cannot get possible interferences.'
                        }))
                    }
                    break;
                }
                case 'interfereWithCheck': {
                    game.passMoveToNextPlayer();
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        possibleMoves: currentMovePlayedBy.getAllPossibleCheckInterferences(game.getBoard()),
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'getLegalMoves': {
                    const piecePosition = message.piecePosition;
                    const legalMoves = game.currentMovePlayedBy.selectPiece(game.getChessBoard(), piecePosition);

                    console.log('legalMoves: ', piecePosition, legalMoves);
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        legalMoves,
                        piecePosition,
                        pieceOnPosition: game.getBoard().get(piecePosition),
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'makeMove': {
                    const fromPiecePosition = message.from;
                    const moveData = {
                        position: message.to,
                        moveType: message.moveType
                    }
                    const promotionPieceType = message.promotionPieceType;
                    try {
                        currentMovePlayedBy.makeMove(game.getChessBoard(), fromPiecePosition, moveData, promotionPieceType);
                    } catch (error) {
                        console.log('error while making move: ', error);
                        ws.send(JSON.stringify({
                            actionEvent: action,
                            responseEvent: 'response',
                            success: false
                        }));
                    }

                    game.passMoveToNextPlayer();
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        success: true,
                        from: message.from,
                        to: message.to,
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'checkMated': {
                    ws.send(JSON.stringify({
                        actionEvent: action,
                        responseEvent: 'response',
                        checkMated: currentMovePlayedBy.isCheckMated(game.getBoard()),
                        game: {
                            ...game,
                            chessBoard: { board: Object.fromEntries(game.getBoard()) }
                        }
                    }));
                    break;
                }
                case 'gameOver': {
                    console.log('GAME OVER!!');
                    break;
                }
                case 'isDraw': {
                    console.log('GAME DRAWW!!!!');
                    break;
                }
                default: {
                    console.log('Unhandled Switch Case ', action);
                    break;
                }
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    });

    ws.on('close', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
