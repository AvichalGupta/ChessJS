import { Player }  from './player';
import { PieceType, ColorTypes } from './constants';
import { Stack } from './datastructures/stack';
import { ChessBoard } from './board';


export class ChessGame {
	boardEntity: ChessBoard;
	player1: Player;
	player2: Player;
	currentMovePlayedBy: Player;
	constructor() {
		this.boardEntity = new ChessBoard();

		const isEven = new Date().getTime() % 2 == 0;
		const piecesAvailable = {
			white: new Stack<PieceType>(15, [
				...this.boardEntity.getBoard()[1].map((row) => {
					return row[1];
				}), ...this.boardEntity.getBoard()[0].map((row) => {
					return row[1];
				})
			]),
			black: new Stack<PieceType>(15, [
				...this.boardEntity.getBoard()[6].map((row) => {
					return row[1];
				}), ...this.boardEntity.getBoard()[7].map((row) => {
					return row[1];
				})
			]) 
		};
		if (isEven) {
			this.player1 = new Player(ColorTypes.white, 'Player 1', piecesAvailable.white);
			this.player2 = new Player(ColorTypes.black, 'Player 2', piecesAvailable.black);
			this.currentMovePlayedBy = this.player1;
		} else {
			this.player1 = new Player(ColorTypes.black, 'Player 1', piecesAvailable.black);
			this.player2 = new Player(ColorTypes.white, 'Player 2', piecesAvailable.white);
			this.currentMovePlayedBy = this.player2;
		}
	}

	selectPlayers() {
		const isEven = new Date().getTime() % 2 == 0;
		const piecesAvailable = {
			white: new Stack<PieceType>(15, [
				...this.boardEntity.getBoard()[1].map((row) => {
					return row[1];
				}), ...this.boardEntity.getBoard()[0].map((row) => {
					return row[1];
				})
			]),
			black: new Stack<PieceType>(15, [
				...this.boardEntity.getBoard()[6].map((row) => {
					return row[1];
				}), ...this.boardEntity.getBoard()[7].map((row) => {
					return row[1];
				})
			]) 
		};
		if (isEven) {
			this.player1 = new Player(ColorTypes.white, 'Player 1', piecesAvailable.white);
			this.player2 = new Player(ColorTypes.black, 'Player 2', piecesAvailable.black);
			this.currentMovePlayedBy = this.player1;
		} else {
			this.player1 = new Player(ColorTypes.black, 'Player 1', piecesAvailable.black);
			this.player2 = new Player(ColorTypes.white, 'Player 2', piecesAvailable.white);
			this.currentMovePlayedBy = this.player2;
		}
	}

	getCurrentMovePlayer() {
		return this.currentMovePlayedBy;
	}

	getBoard() {
		return this.boardEntity.getBoard();
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
		this.boardEntity = new ChessBoard();
		this.selectPlayers();
	}

	startGame = this.resetGame;
}