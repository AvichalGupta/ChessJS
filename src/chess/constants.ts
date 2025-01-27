import { Stack } from "./datastructures/stack";
import { Pawn, Rook, Bishop, Queen, Knight, King } from "./pieces";

import * as uuid from 'uuid';

enum PieceTypes {
	pawn = 'Pawn',
	rook = 'Rook',
	knight = 'Knight',
	bishop = 'Bishop',
	queen = 'Queen',
	king = 'King'
};

enum MoveTypes {
	advance = 'advance',
	enpassant = 'enpassant',
	capture = 'capture',
	promote = 'promote',
	promoteWithCapture = 'promoteWithCapture',
	check = 'check',
	pin = 'pin',
	castle = 'castle',
	captureWithCheck = 'captureWithCheck',
	advanceTwice = 'advanceTwice'
};

enum ColorTypes {
	white = 'white',
	black = 'black'
};

function generateRandomPieceId() {
	return uuid.v4();
};

enum PinDirections {
	fromUp = 'fromUp',
	fromDown = 'fromDown',
	fromRight = 'fromRight',
	fromLeft = 'fromLeft',
	fromUpAndLeft = 'fromUpAndLeft',
	fromUpAndRight = 'fromUpAndRight',
	fromDownAndLeft = 'fromDownAndLeft',
	fromDownAndRight = 'fromDownAndRight'
};

interface ILegalMoves {
	position: string;
	moveType: MoveTypes;
}

type BoardType = Map<string, PieceType>;

type PieceType = null | Pawn | Rook | Bishop | Queen | Knight | King;

type PromotedPiece = Rook | Bishop | Queen | Knight;

interface IPlayerMove {
	currentPosition: string;
	move: IMove;
	pieceToBeMoved: PieceType;
	pieceToBeCaptured: PieceType | null;
	promotionPieceType: PieceType | null;
	inGamePoints: number;
	piecesCaptured: Stack<PieceType>;
}

interface IMove { position: string, moveType: MoveTypes };

export {
	PieceTypes,
	MoveTypes,
	ColorTypes,
	generateRandomPieceId,
	PinDirections,
	ILegalMoves,
	BoardType,
	PieceType,
	IPlayerMove,
	IMove,
	PromotedPiece
}