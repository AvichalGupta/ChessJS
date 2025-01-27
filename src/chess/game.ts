import { Player }  from './player';
import { PieceType, ColorTypes } from './constants';
import { Stack } from './datastructures/stack';
import { ChessBoard } from './board';

export class ChessGame {
	chessBoard: ChessBoard;
	player1: Player;
	player2: Player;
	currentMovePlayedBy: Player;
	constructor() {
		this.chessBoard = new ChessBoard();
		console.log('chessBoard: ', this.chessBoard);

		const isEven = new Date().getTime() % 2 == 0;
		if (isEven) {
			this.player1 = new Player(ColorTypes.white, 'Player 1');
			this.player2 = new Player(ColorTypes.black, 'Player 2');
		} else {
			this.player1 = new Player(ColorTypes.black, 'Player 1');
			this.player2 = new Player(ColorTypes.white, 'Player 2');
		}

		if (isEven) {
			this.currentMovePlayedBy = this.player1;
		}
		this.currentMovePlayedBy = this.player2;
	}

	selectPlayers() {
		const isEven = new Date().getTime() % 2 == 0;
		if (isEven) {
			this.player1 = new Player(ColorTypes.white, 'Player 1');
			this.player2 = new Player(ColorTypes.black, 'Player 2');
		} else {
			this.player1 = new Player(ColorTypes.black, 'Player 1');
			this.player2 = new Player(ColorTypes.white, 'Player 2');
		}

		if (isEven) {
			this.currentMovePlayedBy = this.player1;
		}
		this.currentMovePlayedBy = this.player2;
	}

	getCurrentMovePlayer() {
		return this.currentMovePlayedBy;
	}

	getBoard() {
		return this.chessBoard.getBoard();
	}

	passMoveToNextPlayer() { 
		if (this.getCurrentMovePlayer().name === this.player1.name)
			this.currentMovePlayedBy = this.player2;
		else if (this.getCurrentMovePlayer().name === this.player2.name)
			this.currentMovePlayedBy = this.player1;
	}

	endGame() {

		// End Game
	}

	resetGame() {
		this.chessBoard = new ChessBoard();
		this.selectPlayers();
	}

	startGame = this.resetGame;
}