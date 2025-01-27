import { BoardType, ColorTypes, PieceType, PromotedPiece } from "./constants";
import { getPositionString } from "./helper/helper";
import { Rook, Knight, Bishop, Queen, King, Pawn } from "./pieces";

export class ChessBoard {
    board: BoardType;
	globalMoveCounter: number;
    constructor() {
		this.globalMoveCounter = 0;
		this.board = new Map<string, PieceType>();
		this.initializeBoard();
	}

    getNonPawnPieces(row: number, column: number, color: ColorTypes, centerPiece: string): PieceType {
		const isKingSidePiece = centerPiece === 'Q';
		switch (column) {
		case 0: {
			if (color === ColorTypes.white) {
				if (isKingSidePiece) {
					return new Rook(getPositionString(row, column), color);
				}
				return new Rook(getPositionString(row, 7 - column), color);
			}
			if (isKingSidePiece) {
				return new Rook(getPositionString(7 - row, column), color);
			}
			return new Rook(getPositionString(7 - row, 7 - column), color);
		}
		case 1: {
			if (color === ColorTypes.white) {
				if (isKingSidePiece) {
					return new Knight(getPositionString(row, column), color);
				}
				return new Knight(getPositionString(row, 7 - column), color);
			}
			if (isKingSidePiece) {
				return new Knight(getPositionString(7 - row, column), color);
			}
			return new Knight(getPositionString(7 - row, 7 - column), color);
		}
		case 2: {
			if (color === ColorTypes.white) {
				if (isKingSidePiece) {
					return new Bishop(getPositionString(row, column), color);
				}
				return new Bishop(getPositionString(row, 7 - column), color);
			}
			if (isKingSidePiece) {
				return new Bishop(getPositionString(7 - row, column), color);
			}
			return new Bishop(getPositionString(7 - row, 7 - column), color);
		}
		case 3: {
			if (centerPiece === 'Q') {
				if (color === ColorTypes.white) {
					return new Queen(getPositionString(row, column), color);
				}
				return new Queen(getPositionString(7 - row, column), color);
			} else {
				if (color === ColorTypes.white) {
					return new King(getPositionString(row, 7 - column), color);
				}
				return new King(getPositionString(7 - row, 7 - column), color);
			}
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
			if (color === ColorTypes.white) {
				if (isKingSidePiece) {
					return new Pawn(getPositionString(row, column), color);
				}
				return new Pawn(getPositionString(row, 7 - column), color);
			}
			if (isKingSidePiece) {
				return new Pawn(getPositionString(7 - row, column), color);
			}
			return new Pawn(getPositionString(7 - row, 7 - column), color);

		}
		default: {
			return null;
		}
		}
	}

	initializeBoard() {
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 4; j++) {
				this.board.set(getPositionString(i, j), this.getInitialPiece(i, j, ColorTypes.white, 'Q'));
				this.board.set(getPositionString(i, 7 - j), this.getInitialPiece(i, j, ColorTypes.white, 'Kg'));
				this.board.set(getPositionString(7 - i, j), this.getInitialPiece(i, j, ColorTypes.black, 'Q'));
				this.board.set(getPositionString(7 - i, 7 - j), this.getInitialPiece(i, j, ColorTypes.black, 'Kg'));
			}
		}
	}

	getBoard() {
		return this.board;
	}

	setBoard(currentPosition: string, updatedPosition: string) {
		const elementOnCurrentPosition = this.board.get(currentPosition);
		if (!elementOnCurrentPosition) {
			throw new Error('Cannot update board, element not present on position!');
		}
		this.board.set(updatedPosition, elementOnCurrentPosition);
		this.board.delete(currentPosition);
		this.incrementGlobalMoveCounter();
	}

	replacePawnWithPromotedPiece(currentPosition: string, promotedPiece: PromotedPiece) {
		const elementOnCurrentPosition = this.board.get(currentPosition);
		if (!elementOnCurrentPosition) {
			throw new Error('Cannot update board during promotion, element not present on position!');
		}
		this.board.set(currentPosition, promotedPiece);
	}

	getGlobalMoveCounter() {
		return this.globalMoveCounter;
	}

	incrementGlobalMoveCounter() {
		this.globalMoveCounter += 1;
	}

    resetBoard = this.initializeBoard;

}