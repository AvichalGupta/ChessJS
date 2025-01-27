import { Stack } from './datastructures/stack';
import { PieceTypes, MoveTypes, ColorTypes, IPlayerMove, PieceType, IMove, PromotedPiece, BoardType } from './constants';
import { Rook, Knight, Bishop, Queen, King, Pawn } from './pieces';
import { ChessBoard } from './board';
import { getPositionString } from './helper/helper';

export class Player {
	moves: Stack<IPlayerMove>;
	color: ColorTypes;
	name: string;
	inGamePoints: number;
	piecesCaptured: Stack<PieceType>;
	allyKingPosition: string;
	constructor(color: ColorTypes, name: string) {
		if (!name || !color) throw new Error('Please provide required fields to create a player!');
		this.moves = new Stack<IPlayerMove>();
		this.color = color;
		this.name = name;
		this.inGamePoints = 0;
		this.piecesCaptured = new Stack<PieceType>(15);

		if (this.getColor() === ColorTypes.white)
			this.allyKingPosition = getPositionString(0, 4);
		else
			this.allyKingPosition = getPositionString(7, 4);
	}

	fetchPiece(pieceInfo: {
		row: number
		column: number
		color: ColorTypes
		pieceType: PieceTypes
	}): PromotedPiece {
		const {
			row,
			column,
			color,
			pieceType
		} = pieceInfo;
		switch (pieceType) {
		case PieceTypes.rook: {
			return new Rook(getPositionString(row, column), color);
		}
		case PieceTypes.knight: {
			return new Knight(getPositionString(row, column), color);
		}
		case PieceTypes.bishop: {
			return new Bishop(getPositionString(row, column), color);
		}
		case PieceTypes.queen: {
			return new Queen(getPositionString(row, column), color);
		}
		default: {
			throw new Error(`Cannot promote to a ${pieceType}.`);
		}
		}
	}

	getPiecesCaptured() {
		return this.piecesCaptured;
	}

	setPiecesCaptured(chessBoard: ChessBoard) {
		this.piecesCaptured = new Stack(15);
	}

	selectPiece(chessBoard: ChessBoard, position: string) {
		const pieceOnPosition = chessBoard.getBoard().get(position);
		console.log('pieceOnPosition: ', pieceOnPosition);
		if (
			!pieceOnPosition ||
			!(pieceOnPosition instanceof King) && (
				pieceOnPosition.isCaptured() ||
				(
					pieceOnPosition instanceof Knight &&
					pieceOnPosition.isPinned()
				 ) ||
				this.getColor() !== pieceOnPosition.getColor()
			)
		) return null;

		if (pieceOnPosition instanceof Pawn)
			return pieceOnPosition.getLegalMoves(chessBoard.board, chessBoard.getGlobalMoveCounter());
		else
			return pieceOnPosition.getLegalMoves(chessBoard.board);
	}

	getAllyKingPosition() {
		return this.allyKingPosition;
	}

	updateAllyKingPosition(updatedPosition: string) {
		this.allyKingPosition = updatedPosition;
	}

	// When this function is called, it means that a move is happening. All prelimnary checks on whether this move is possible or not are handled in the selectPiece function.
	makeMove(chessBoard: ChessBoard, currentPosition: string, move: IMove, promotionPieceType = null) {
		if (!move) throw new Error('Move could not be registered!');
		const { position, moveType } = move;

		const pieceToBeMoved = chessBoard.getBoard().get(currentPosition);

		if (!pieceToBeMoved) throw new Error('No piece on currentPosition!');
		const opposingPiece = chessBoard.getBoard().get(position);
		const squareToBeMovedTo = position;

		switch (moveType) {
		case MoveTypes.advance: {
			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			if (pieceToBeMoved instanceof King)
				this.updateAllyKingPosition(pieceToBeMoved.getCurrentPosition());

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.advanceTwice: {
			if (!(pieceToBeMoved instanceof Pawn))
				throw new Error('Advance Twice attempt on piece that is not of type Pawn!')
			
			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			
			if (pieceToBeMoved.getMoveCounter() === 0)
				pieceToBeMoved.setFirstMoveGlobalMoveCounter(chessBoard.getGlobalMoveCounter());

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.capture: {
			if (!opposingPiece) throw new Error('Opposing piece not found during capture!');
			if ((opposingPiece instanceof King)) throw new Error('Opposing king cannot be captured.');

			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			if (pieceToBeMoved instanceof King)
				this.updateAllyKingPosition(pieceToBeMoved.getCurrentPosition());

			opposingPiece.markAsCaptured();
			this.inGamePoints += opposingPiece.getValue();
			this.piecesCaptured.push(opposingPiece);

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.promote: {
			if (!promotionPieceType) throw new Error('Please provide promotion piece type.');
			if (!(pieceToBeMoved instanceof Pawn)) throw new Error('Invalid promotion attempt!');
			const promotedPiece = this.fetchPiece(promotionPieceType);

			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			pieceToBeMoved.handlePromotion(chessBoard, promotedPiece);
			// -1 since the pawn is promoted to a new piece.
			this.inGamePoints += promotedPiece.getValue() - 1;

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.promoteWithCapture: {
			if (!promotionPieceType) throw new Error('Please provide promotion piece type.');
			if (!(pieceToBeMoved instanceof Pawn)) throw new Error('Invalid promotion attempt!');
			if (!opposingPiece) throw new Error('Opposing piece not found during capture!');
			if ((opposingPiece instanceof King)) throw new Error('Opposing king cannot be captured.');


			const promotedPiece = this.fetchPiece(promotionPieceType);

			opposingPiece.markAsCaptured();

			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			pieceToBeMoved.handlePromotion(chessBoard, promotedPiece);
			// -1 since the pawn is promoted to a new piece.
			this.inGamePoints += promotedPiece.getValue() - 1 + opposingPiece.getValue();
			this.piecesCaptured.push(opposingPiece);

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.enpassant: {

			if (!(pieceToBeMoved instanceof Pawn)) throw new Error('Enpassant attempt on piece that is not of type Pawn!');

			if (!opposingPiece) throw new Error('Opposing piece not found during capture!');
			if (!(opposingPiece instanceof Pawn)) throw new Error('Enpassant only allowed on enemy pawn.');
			
			opposingPiece.markAsCaptured();
			pieceToBeMoved.makeMove(chessBoard, squareToBeMovedTo);
			this.inGamePoints += opposingPiece.getValue();
			this.piecesCaptured.push(opposingPiece);

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.castle: {
			if (!(pieceToBeMoved instanceof King)) throw new Error('Castling attempt on piece that is not of type King!');
			pieceToBeMoved.performCastling(chessBoard, squareToBeMovedTo);
			if (pieceToBeMoved.getType() === PieceTypes.king)
				this.updateAllyKingPosition(pieceToBeMoved.getCurrentPosition());


			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		default: {
			throw new Error(`Invalid Movetype ${moveType}, cannot play move!`);
		}
		}
	}

	isInCheck(board: BoardType) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board.get(allyKingPosition);

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is in check!');

		return allyKing.isInCheck();
	}

	isInDoubleCheck(board: BoardType) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board.get(allyKingPosition);

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is in double check!');

		return allyKing.isInDoubleCheck();
	}

	isCheckMated(board: BoardType) {

		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board.get(allyKingPosition);

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is checkmated!');

		return allyKing.checkMated();
	}

	markInCheck(board: BoardType, inCheck: boolean) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board.get(allyKingPosition);

		if (!(allyKing instanceof King)) throw new Error('Cannot mark ally king is in check!');

		return allyKing.markInCheck(inCheck);
	}

	markInDoubleCheck(board: BoardType, inDoubleCheck: boolean) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board.get(allyKingPosition);

		if (!(allyKing instanceof King)) throw new Error('Cannot mark ally king is in double check!');

		return allyKing.markInDoubleCheck(inDoubleCheck);
	}

	getLastMove() {
		return this.moves.peek();
	}

	getColor() {
		return this.color;
	}

	getName() {
		return this.name;
	}
}