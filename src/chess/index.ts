import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
const PORT = process.env.PORT || 3002;
import { ChessGame } from './game';

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Basic route for testing
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
	const game = new ChessGame();

	console.log('A user connected:', socket.id);

	socket.on('message', (message) => {
		socket.emit('response', {
			message: `Server received: ${message}`,
			game: {
				...game,
				chessBoard: {
					board: Object.fromEntries(game.getBoard())
				}
			},
		});
	});

	socket.on('getLegalMoves', (message) => {
		const piecePosition = message.piecePosition;
		console.log('getLegalMoves: ', piecePosition);
		const legalMoves = game.currentMovePlayedBy.selectPiece(game.chessBoard, piecePosition)
		socket.emit('showLegalMoves', {
			legalMoves,
			piecePosition
		});
	})

	socket.on('makeMove', (message) => {
		// console.log('makeMove', message);
		const piecePosition = message.piecePosition;
		const chessBoard = game.chessBoard.getBoard();
		const pieceOnPosition = chessBoard.get(piecePosition);
		console.log('board before: ', JSON.stringify(game.getBoard()))
		game.currentMovePlayedBy.makeMove(game.chessBoard, piecePosition, message.legalMove);
		console.log('board after: ', JSON.stringify(game.getBoard()))
		game.passMoveToNextPlayer();
		game.getBoard();

		socket.emit('nextPlayer', {
			fromPosition: piecePosition,
			toPosition: message.legalMove.position,
			pieceOnPosition
		});
	})

	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.id);
	});
});

// Start the server
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
