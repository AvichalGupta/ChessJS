import { BoardType, ColorTypes, PieceType, PromotedPiece } from "./constants";
import { Rook, Knight, Bishop, Queen, King, Pawn } from "./pieces";

export class ChessBoard {
    board: BoardType;
	globalMoveCounter: number;
    constructor() {
		this.globalMoveCounter = 0;
		this.board = new Array(8);
		this.initializeBoard();
	}

    getNonPawnPieces(row: number, column: number, color: ColorTypes, centerPiece: string): PieceType {
		const isKingSidePiece = centerPiece === 'Q';
		switch (column) {
		case 0: {
			return new Rook([ color === ColorTypes.white ? row : 7 - row, isKingSidePiece ? column : 7 - column ], color);
		}
		case 1: {
			return new Knight([ color === ColorTypes.white ? row : 7 - row, isKingSidePiece ? column : 7 - column ], color);
		}
		case 2: {
			return new Bishop([ color === ColorTypes.white ? row : 7 - row, isKingSidePiece ? column : 7 - column ], color);
		}
		case 3: {
			if (centerPiece === 'Q')
				return new Queen([ color === ColorTypes.white ? row : 7 - row, column ], color);

			return new King([ color === ColorTypes.white ? row : 7 - row, 7 - column ], color);
		}
		}
		return null;
	}

	getInitialPiece(row: number, column: number, color: ColorTypes, centerPiece: string): PieceType {
		const isKingSidePiece = centerPiece === 'Q';
		switch (row) {
		case 0: {
			return this.getNonPawnPieces(row, column, color, centerPiece);
		}
		case 1: {
			return new Pawn([ color === ColorTypes.white ? row : 7 - row, isKingSidePiece ? column : 7 - column ], color);
		}
		default: {
			return null;
		}
		}
	}

	initializeBoard() {
		this.board = new Array(8);
		for (let i = 0; i < 4; i++) {
			this.board[i] = new Array(8);
			this.board[7 - i] = new Array(8);
			for (let j = 0; j < 4; j++) {
				this.board[i][j] = [ (i + j) % 2, this.getInitialPiece(i, j, ColorTypes.white, 'Q') ];
				this.board[i][7 - j] = [ (i + 7 - j) % 2, this.getInitialPiece(i, j, ColorTypes.white, 'Kg') ];
				this.board[7 - i][j] = [ ((7 - i + j) % 2), this.getInitialPiece(i, j, ColorTypes.black, 'Q') ];
				this.board[7 - i][7 - j] = [ ((7 - i + 7 - j) % 2), this.getInitialPiece(i, j, ColorTypes.black, 'Kg') ];
			}
		}
	}

	getBoard() {
		return this.board;
	}

	setBoard(currentPosition: number[], updatedPosition: number[]) {
		this.board[updatedPosition[0]][updatedPosition[1]][1] = this.board[currentPosition[0]][currentPosition[1]][1];
		this.board[currentPosition[0]][currentPosition[1]][1] = null;
		this.incrementGlobalMoveCounter();
	}

	replacePawnWithPromotedPiece(currentPosition: number[], promotedPiece: PromotedPiece) {
		this.board[currentPosition[0]][currentPosition[1]][1] = promotedPiece;
	}

	getGlobalMoveCounter() {
		return this.globalMoveCounter;
	}

	incrementGlobalMoveCounter() {
		this.globalMoveCounter += 1;
	}

    resetBoard = this.initializeBoard;

}