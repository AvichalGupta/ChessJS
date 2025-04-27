import { Stack } from "./datastructures/stack";

import * as uuid from 'uuid';
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { Pawn } from "./pieces/helper";

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
	promotionPieceType: string | null;
	inGamePoints: number;
	piecesCaptured: Stack<PieceType>;
}

interface IMove { position: string, moveType: MoveTypes };

interface DefaultDirectionStates {
	fromUp: boolean,
	fromDown: boolean,
	fromRight: boolean,
	fromLeft: boolean,
	fromUpAndRight: boolean,
	fromUpAndLeft: boolean,
	fromDownAndRight: boolean,
	fromDownAndLeft: boolean
}

enum DirectionEnum {
	fromUp = 'fromUp',
	fromDown = 'fromDown',
	fromRight = 'fromRight',
	fromLeft = 'fromLeft',
	fromUpAndRight = 'fromUpAndRight',
	fromUpAndLeft = 'fromUpAndLeft',
	fromDownAndRight = 'fromDownAndRight',
	fromDownAndLeft = 'fromDownAndLeft'
}

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
	PromotedPiece,
	DefaultDirectionStates,
	DirectionEnum
}