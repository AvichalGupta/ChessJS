import { Stack } from './datastructures/stack';
import { PieceTypes, MoveTypes, ColorTypes, IPlayerMove, PieceType, IMove, PromotedPiece, BoardType } from './constants';
import { Rook, Knight, Bishop, Queen, King, Pawn } from './pieces';
import { ChessBoard } from './board';

export class Player {
	moves: Stack<IPlayerMove>;
	color: ColorTypes;
	name: string;
	inGamePoints: number;
	piecesCaptured: Stack<PieceType>;
	allyKingPosition: number[];
	piecesAvailable: Stack<PieceType>;
	constructor(color: ColorTypes, name: string, piecesAvailable: Stack<PieceType>) {
		if (!name || !color) throw new Error('Please provide required fields to create a player!');
		this.moves = new Stack<IPlayerMove>();
		this.color = color;
		this.name = name;
		this.inGamePoints = 0;
		this.piecesCaptured = new Stack<PieceType>(15);
		this.piecesAvailable = piecesAvailable || new Stack<PieceType>(15);

		if (this.getColor() === ColorTypes.white)
			this.allyKingPosition = [ 0, 4 ];
		else
			this.allyKingPosition = [ 7, 4 ];
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
			return new Rook([ row, column ], color);
		}
		case PieceTypes.knight: {
			return new Knight([ row, column ], color);
		}
		case PieceTypes.bishop: {
			return new Bishop([ row, column ], color);
		}
		case PieceTypes.queen: {
			return new Queen([ row, column ], color);
		}
		default: {
			throw new Error(`Cannot promote to a ${pieceType}.`);
		}
		}
	}

	setPiecesAvailable() {
		this.piecesAvailable = new Stack(15);
	}

	selectPiece(boardEntity: ChessBoard, position: number[]) {
		const pieceOnPosition = boardEntity.board[position[0]][position[1]][1];

		if (pieceOnPosition === null) return null;
		if (
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
			return pieceOnPosition.getLegalMoves(boardEntity.board, boardEntity.getGlobalMoveCounter());
		else
			return pieceOnPosition.getLegalMoves(boardEntity.board);
	}

	getAllyKingPosition() {
		return this.allyKingPosition;
	}

	updateAllyKingPosition(updatedPosition: number[]) {
		this.allyKingPosition = updatedPosition;
	}

	// When this function is called, it means that a move is happening. All prelimnary checks on whether this move is possible or not are handled in the selectPiece function.
	makeMove(boardEntity: ChessBoard, currentPosition: number[], move: IMove, promotionPieceType = null) {
		if (!move) throw new Error('Move could not be registered!');
		const { position, moveType } = move;

		const pieceToBeMoved = boardEntity.board[currentPosition[0]][currentPosition[1]][1];
		if (pieceToBeMoved === null) throw new Error('No piece on currentPosition!');
		const opposingPiece = boardEntity.board[position[0]][position[1]][1];
		const squareToBeMovedTo = [ position[0], position[1] ];

		switch (moveType) {
		case MoveTypes.advance: {
			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
			if (pieceToBeMoved instanceof King)
				this.updateAllyKingPosition(pieceToBeMoved.getCurrentPosition());

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.advanceTwice: {
			if (!(pieceToBeMoved instanceof Pawn))
				throw new Error('Advance Twice attempt on piece that is not of type Pawn!')
			
			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
			
			if (pieceToBeMoved.getMoveCounter() === 0)
				pieceToBeMoved.setFirstMoveGlobalMoveCounter(boardEntity.getGlobalMoveCounter());

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.capture: {
			if (opposingPiece === null) throw new Error('Opposing piece not found during capture!');
			if ((opposingPiece instanceof King)) throw new Error('Opposing king cannot be captured.');

			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
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

			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
			pieceToBeMoved.handlePromotion(boardEntity, promotedPiece);
			// -1 since the pawn is promoted to a new piece.
			this.inGamePoints += promotedPiece.getValue() - 1;

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: null, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.promoteWithCapture: {
			if (!promotionPieceType) throw new Error('Please provide promotion piece type.');
			if (!(pieceToBeMoved instanceof Pawn)) throw new Error('Invalid promotion attempt!');
			if (opposingPiece === null) throw new Error('Opposing piece not found during capture!');
			if ((opposingPiece instanceof King)) throw new Error('Opposing king cannot be captured.');


			const promotedPiece = this.fetchPiece(promotionPieceType);

			opposingPiece.markAsCaptured();

			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
			pieceToBeMoved.handlePromotion(boardEntity, promotedPiece);
			// -1 since the pawn is promoted to a new piece.
			this.inGamePoints += promotedPiece.getValue() - 1 + opposingPiece.getValue();
			this.piecesCaptured.push(opposingPiece);

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.enpassant: {

			if (!(pieceToBeMoved instanceof Pawn)) throw new Error('Enpassant attempt on piece that is not of type Pawn!');

			if (opposingPiece === null) throw new Error('Opposing piece not found during capture!');
			if (!(opposingPiece instanceof Pawn)) throw new Error('Enpassant only allowed on enemy pawn.');
			
			opposingPiece.markAsCaptured();
			pieceToBeMoved.makeMove(boardEntity, squareToBeMovedTo);
			this.inGamePoints += opposingPiece.getValue();
			this.piecesCaptured.push(opposingPiece);

			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		case MoveTypes.castle: {
			if (!(pieceToBeMoved instanceof King)) throw new Error('Castling attempt on piece that is not of type King!');
			pieceToBeMoved.performCastling(boardEntity, squareToBeMovedTo);
			if (pieceToBeMoved.getType() === PieceTypes.king)
				this.updateAllyKingPosition(pieceToBeMoved.getCurrentPosition());


			this.moves.push({ currentPosition, move, pieceToBeMoved, pieceToBeCaptured: opposingPiece, promotionPieceType, inGamePoints: this.inGamePoints, piecesCaptured: this.piecesCaptured });
			break;
		}
		default: {
			throw new Error(`Invalid Movetype ${moveType}, cannot play move!`);
		}
		}
	}

	isInCheck(board: BoardType) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board[allyKingPosition[0]][allyKingPosition[1]][1];

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is in check!');

		return allyKing.isInCheck();
	}

	isInDoubleCheck(board: BoardType) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board[allyKingPosition[0]][allyKingPosition[1]][1];

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is in double check!');

		return allyKing.isInDoubleCheck();
	}

	isCheckMated(board: BoardType) {

		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board[allyKingPosition[0]][allyKingPosition[1]][1];

		if (!(allyKing instanceof King)) throw new Error('Cannot verify if ally king is checkmated!');

		return allyKing.checkMated();
	}

	markInCheck(board: BoardType, inCheck: boolean) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board[allyKingPosition[0]][allyKingPosition[1]][1];

		if (!(allyKing instanceof King)) throw new Error('Cannot mark ally king is in check!');

		return allyKing.markInCheck(inCheck);
	}

	markInDoubleCheck(board: BoardType, inDoubleCheck: boolean) {
		const allyKingPosition = this.getAllyKingPosition();

		const allyKing = board[allyKingPosition[0]][allyKingPosition[1]][1];

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