import { ChessBoard } from "../board";
import { ColorTypes, PieceTypes, PinDirections, ILegalMoves, generateRandomPieceId, BoardType, PieceType, MoveTypes, PromotedPiece } from "../constants";
import { validatePosition, getPositionString } from "../helper/helper";
import { King } from "./king";

export class Piece {
	protected value: number;
	protected currentPosition: string;
	protected pieceId: string;
	protected color: ColorTypes;
	protected captured: boolean;
	protected type: PieceTypes;
	protected moveCounter: number;
	protected pinnedDiagonally: PinDirections | null;
	protected pinnedHorizontally: PinDirections | null;
	protected pinnedVertically: PinDirections | null;
	protected legalMoves: ILegalMoves[];
	constructor(
		value: number, 
		currentPosition: string, 
		color: ColorTypes, 
		type: PieceTypes, 
		moveCounter = 0, 
		pinnedDiagonally: PinDirections | null = null, 
		pinnedHorizontally: PinDirections | null = null, 
		pinnedVertically: PinDirections | null = null,
	) {
		this.value = value;
		this.currentPosition = currentPosition;
		this.pieceId = generateRandomPieceId();
		this.color = color;
		this.captured = false;
		this.pinnedDiagonally = pinnedDiagonally;
		this.pinnedHorizontally = pinnedHorizontally;
		this.pinnedVertically = pinnedVertically;
		this.type = type;
		this.moveCounter = moveCounter;
		this.legalMoves = [];
	}

	getValue() {
		return this.value;
	}

	resetLegalMoves() {
		this.legalMoves = [];
	}

	getCurrentPosition() {
		return this.currentPosition;
	}

	updateCurrentPosition(updatedPosition: string) {
		validatePosition(updatedPosition);
		this.currentPosition = updatedPosition;
	}

	getMoveCounter() {
		return this.moveCounter;
	}

	incrementMoveCounter() {
		this.moveCounter += 1;
	}

	getColor() {
		return this.color;
	}

	getType() {
		return this.type;
	}

	moveToPosition(chessBoard: ChessBoard, updatedPosition: string) {
		chessBoard.setBoard(this.getCurrentPosition(), updatedPosition);
		this.incrementMoveCounter();
		this.updateCurrentPosition(updatedPosition);
	}

	// This function overrides the current position of the piece with the updated position.
	makeMove(chessBoard: ChessBoard, updatedPosition: string) {
		this.moveToPosition(chessBoard, updatedPosition);
		this.resetLegalMoves();
	}

	// Marks the piece as captured, the piece is removed from the board using the makeMove function, it should be called before marking as captured.
	markAsCaptured() {
		this.captured = true;
	}

	setPinnedDiagonally(pinnedToAllyKingFrom: PinDirections | null = null) {
		if (
			pinnedToAllyKingFrom !== null && 
			!Object.values(PinDirections).includes(pinnedToAllyKingFrom)
		) throw new Error('Invalid value being updated to pinnedDiagonally field!');
		this.pinnedDiagonally = pinnedToAllyKingFrom;
	}

	setPinnedHorizontally(pinnedToAllyKingFrom: PinDirections | null = null) {
		if (
			pinnedToAllyKingFrom !== null && 
			!Object.values(PinDirections).includes(pinnedToAllyKingFrom)
		) throw new Error('Invalid value being updated to pinnedHorizontally field!');
		this.pinnedHorizontally = pinnedToAllyKingFrom;
	}

	setPinnedVertically(pinnedToAllyKingFrom: PinDirections | null = null) {
		if (
			pinnedToAllyKingFrom !== null && 
			!Object.values(PinDirections).includes(pinnedToAllyKingFrom)
		) throw new Error('Invalid value being updated to pinnedVertically field!');
		this.pinnedVertically = pinnedToAllyKingFrom;
	}

	getPinnedDiagonally(): PinDirections | null {
		return this.pinnedDiagonally;
	}

	getPinnedHorizontally(): PinDirections | null {
		return this.pinnedHorizontally;
	}

	getPinnedVertically(): PinDirections | null {
		return this.pinnedVertically;
	}

	isCaptured(): boolean {
		return this.captured;
	}

	isPinned(): boolean {
		const pinnedDiagonally = this.getPinnedDiagonally();
		const pinnedHorizontally = this.getPinnedHorizontally();
		const pinnedVertically = this.getPinnedVertically();
		return (
			(pinnedDiagonally !== null && Object.values(PinDirections).includes(pinnedDiagonally)) ||
			(pinnedHorizontally !== null && Object.values(PinDirections).includes(pinnedHorizontally)) ||
			(pinnedVertically !== null && Object.values(PinDirections).includes(pinnedVertically))
		);
	}

	getPinnedDirection(board: BoardType): PinDirections | null {
		this.verifyPin(board);
		
		return (
			this.getPinnedDiagonally() ||
			this.getPinnedHorizontally() ||
			this.getPinnedVertically()
		);	
	}

	getAllPossibleCapturesOnAttackingPiece(board: BoardType, currentRow: number, currentColumn: number, currentGlobalMoveCounter: number = 0) {
		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);
		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn));

		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');
		
		let pieceOnPosition: PieceType | undefined;

		const checkIfEnemyNonPawnPieceCanCapture = () => {
			let moveUpBy = currentRow;
			let moveDownBy = currentRow;
			let moveLeftBy = currentColumn;
			let moveRightBy = currentColumn;

			const possibleProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.rook ];
			const possibleDiagonalProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.bishop ];

			let steps = 0;

			let possibleEnemyPiecePositions: Map<string, PieceTypes[]> = new Map();

			while (steps <= maxDistanceFromEdge) {

				moveLeftBy--;
				moveRightBy++;
				moveUpBy++;
				moveDownBy--;

				possibleEnemyPiecePositions = new Map([
					[getPositionString(currentRow, moveLeftBy), possibleProtectionPieceTypes],
					[getPositionString(currentRow, moveRightBy), possibleProtectionPieceTypes],
					[getPositionString(moveUpBy, currentColumn), possibleProtectionPieceTypes],
					[getPositionString(moveDownBy, currentColumn), possibleProtectionPieceTypes],
					[getPositionString(moveUpBy, moveLeftBy), possibleDiagonalProtectionPieceTypes],
					[getPositionString(moveDownBy, moveRightBy), possibleDiagonalProtectionPieceTypes],
					[getPositionString(moveUpBy, moveRightBy), possibleDiagonalProtectionPieceTypes],
					[getPositionString(moveDownBy, moveLeftBy), possibleDiagonalProtectionPieceTypes]
				]);

				for (const [ position, possibleProtectionPieceTypes ] of possibleEnemyPiecePositions) {
					const row = +position[0];
					const col = +position[1];
					if (
						(row >= 0 && row <= 7) &&
						(col >= 0 && col <= 7)
					) {
						pieceOnPosition = board.get(getPositionString(row, col));
			
						if (pieceOnPosition)
							return (
								pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
								possibleProtectionPieceTypes.includes(pieceOnCurrentPositon.getType()) &&
								!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
							);
					}
				}

				steps++;
			}

			const possibleKnightPositions = [
				[currentRow - 2, currentColumn - 1],
				[currentRow - 2, currentColumn + 1],
				[currentRow + 2, currentColumn - 1],
				[currentRow + 2, currentColumn + 1],
				[currentRow - 1, currentColumn - 2],
				[currentRow + 1, currentColumn - 2],
				[currentRow - 1, currentColumn + 2],
				[currentRow + 1, currentColumn + 2]
			]

			for (const [ row, col ] of possibleKnightPositions) {
				if (
					(row >= 0 && row <= 7) && 
					(col >= 0 && col <= 7)
				) {
					pieceOnPosition = board.get(getPositionString(row, col));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						[ PieceTypes.knight ].includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}
			}
			
			return false;
		}

		const checkIfEnemyPawnCanCapture = () => {
			const possibleProtectionPieceTypes = [ PieceTypes.pawn ];

			if (pieceOnCurrentPositon.getColor() === ColorTypes.black) {

				// enpassant logic
				if (pieceOnCurrentPositon instanceof Pawn) {
					if (
						(currentRow >= 0 && currentRow <= 7) &&
						(currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
					) {
						pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
					
						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							(pieceOnPosition instanceof Pawn) && !pieceOnPosition.isPinned()
						)  {
							const { toLeft, toRight } = pieceOnPosition.verifyEnPassant(board, currentGlobalMoveCounter);
							return toLeft || toRight;
						}
						
						pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
						
						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							(pieceOnPosition instanceof Pawn) && !pieceOnPosition.isPinned()
						)  {
							const { toLeft, toRight } = pieceOnPosition.verifyEnPassant(board, currentGlobalMoveCounter);
							return toLeft || toRight;
						}
					}
				}

				if (
					(currentRow - 1 >= 0 && currentRow <= 7) &&
                    (currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
				) {
					
					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					) return true;
					
					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					) return true;
				}   

			} else if (pieceOnCurrentPositon.getColor() === ColorTypes.white) {

				// enpassant logic
				if (pieceOnCurrentPositon instanceof Pawn) {
					if (
						(currentRow >= 0 && currentRow <= 7) &&
						(currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
					) {
						pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
					
						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							(pieceOnPosition instanceof Pawn) && !pieceOnPosition.isPinned()
						)  {
							const { toLeft, toRight } = pieceOnPosition.verifyEnPassant(board, currentGlobalMoveCounter);
							return toLeft || toRight;
						}
						
						pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
						
						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							(pieceOnPosition instanceof Pawn) && !pieceOnPosition.isPinned()
						)  {
							const { toLeft, toRight } = pieceOnPosition.verifyEnPassant(board, currentGlobalMoveCounter);
							return toLeft || toRight;
						}
					}
				}

				if (
					(currentRow + 1 <= 7 && currentRow >= 0) &&
                    (currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
				) {
					
					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					) return true;
					
					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					) return true;
				}

			}
			return false;
		}

		return (
            checkIfEnemyNonPawnPieceCanCapture() ||
            checkIfEnemyPawnCanCapture()
		);
	}

	verifyPin(board: BoardType) {

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn))
		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);

		let moveUpBy = currentRow;
		let moveDownBy = currentRow;
		let moveLeftBy = currentColumn;
		let moveRightBy = currentColumn;

		const possibleProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.rook ];
		const possibleDiagonalProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.bishop ];

		let steps = 0;

		let continueUp = true;
		let continueDown = true;
		let continueRight = true;
		let continueLeft = true;
		let continueUpAndLeft = true;
		let continueUpAndRight = true;
		let continueDownAndLeft = true;
		let continueDownAndRight = true;

		let enemyFoundUp = false;
		let enemyFoundDown = false;
		let enemyFoundRight = false;
		let enemyFoundLeft = false;
		let enemyFoundUpAndLeft = false;
		let enemyFoundUpAndRight = false;
		let enemyFoundDownAndLeft = false;
		let enemyFoundDownAndRight = false;

		let allyKingFoundUp = false;
		let allyKingFoundDown = false;
		let allyKingFoundRight = false;
		let allyKingFoundLeft = false;
		let allyKingFoundUpAndLeft = false;
		let allyKingFoundUpAndRight = false;
		let allyKingFoundDownAndLeft = false;
		let allyKingFoundDownAndRight = false;

		let pieceOnPosition: PieceType | undefined;

		let possiblePiecePositions = new Map([
			[getPositionString(currentRow, moveLeftBy), possibleProtectionPieceTypes],
			[getPositionString(currentRow, moveRightBy), possibleProtectionPieceTypes],
			[getPositionString(moveUpBy, currentColumn), possibleProtectionPieceTypes],
			[getPositionString(moveDownBy, currentColumn), possibleProtectionPieceTypes],
			[getPositionString(moveUpBy, moveLeftBy), possibleDiagonalProtectionPieceTypes],
			[getPositionString(moveDownBy, moveRightBy), possibleDiagonalProtectionPieceTypes],
			[getPositionString(moveUpBy, moveRightBy), possibleDiagonalProtectionPieceTypes],
			[getPositionString(moveDownBy, moveLeftBy), possibleDiagonalProtectionPieceTypes],
		])

		while (steps <= maxDistanceFromEdge) {

			moveLeftBy--;
			moveRightBy++;
			moveUpBy++;
			moveDownBy--;

			// check if king is to the right of piece, to verify if it is pinned horizontally from left.	
			
			for (const [ direction, possibleProtectionPieceType ] of possiblePiecePositions) {
				const row = +direction[0];
				const col = +direction[1];
				if (
					(row >= 0 && row <= 7) &&
					(col >= 0 && col <= 7)
				) {
					pieceOnPosition = board.get(getPositionString(row, col));
	
					if (pieceOnPosition) {
						if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
							allyKingFoundLeft = pieceOnPosition.getType() === PieceTypes.king;
						} else {
							enemyFoundLeft =
								!(pieceOnPosition instanceof King) &&
								!pieceOnPosition.isCaptured() &&
								possibleProtectionPieceType.includes(pieceOnPosition.getType());
						}
					}
				}

			}
			if (
				continueLeft &&
				moveLeftBy >= 0
			) {
				
				pieceOnPosition = board.get(getPositionString(currentRow, moveLeftBy));

				if (pieceOnPosition) {
					continueLeft = false;
	
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundLeft = pieceOnPosition.getType() === PieceTypes.king;
					} else {
						enemyFoundLeft =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is to the left of piece, to verify if it is pinned horizontally from right.			
			if (
				continueRight &&
				moveRightBy <= 7
			) {
				
				pieceOnPosition = board.get(getPositionString(currentRow, moveRightBy));

				if (pieceOnPosition) {
					continueRight = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundRight = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundRight =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is below the piece, to verify if it is pinned vertically from above.
			if (
				continueUp &&
				moveUpBy <= 7
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, currentColumn));

				if (pieceOnPosition) {
					continueUp = false;
	
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundUp = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundUp =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is above the piece, to verify if it is pinned vertically from below.
			if (
				continueDown &&
				moveDownBy >= 0
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, currentColumn));

				if (pieceOnPosition) {
					continueDown = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundDown = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundDown =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is diagonally below and to the right of the piece, to verify if it is pinned diagonally from up and left diagonal.
			if (
				continueUpAndLeft &&
				(moveUpBy <= 7 && moveLeftBy >= 0)
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));

				if (pieceOnPosition) {
					continueUpAndLeft = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundUpAndLeft = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundUpAndLeft =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is diagonally above and to the left of the piece, to verify if it is pinned diagonally from down and right diagonal.			
			if (
				continueDownAndRight &&
				(moveDownBy >= 0 && moveRightBy <= 7)
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveRightBy));

				if (pieceOnPosition) {
					continueDownAndRight = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundDownAndRight = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundDownAndRight =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is diagonally below and to the left of the piece, to verify if it is pinned diagonally from up and right diagonal.			
			if (
				continueUpAndRight &&
				(moveUpBy <= 7 && moveRightBy <= 7)
			) {
				
				pieceOnPosition = board.get(getPositionString(moveUpBy, moveRightBy));

				if (pieceOnPosition) {
					continueUpAndRight = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundUpAndRight = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundUpAndRight =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}

			// check if king is diagonally above and to the right of the piece, to verify if it is pinned diagonally down up and left diagonal.
			if (
				continueDownAndLeft &&
				(moveDownBy >= 0 && moveLeftBy >= 0)
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveLeftBy));

				if (pieceOnPosition) {
					continueDownAndLeft = false;
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundDownAndLeft = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
						enemyFoundDownAndLeft =
							!(pieceOnPosition instanceof King) &&
							!pieceOnPosition.isCaptured() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType());
					}
				}
			}
			steps++;
		}

		if (enemyFoundDown && allyKingFoundUp) {
			this.setPinnedVertically(PinDirections.fromDown);
		} else if (enemyFoundUp && allyKingFoundDown) {
			this.setPinnedVertically(PinDirections.fromUp);
		} else if (enemyFoundLeft && allyKingFoundRight) {
			this.setPinnedHorizontally(PinDirections.fromRight);
		} else if (enemyFoundRight && allyKingFoundLeft) {
			this.setPinnedHorizontally(PinDirections.fromLeft);
		} else if (enemyFoundDownAndLeft && allyKingFoundUpAndRight) {
			this.setPinnedDiagonally(PinDirections.fromDownAndLeft);
		} else if (enemyFoundDownAndRight && allyKingFoundUpAndLeft) {
			this.setPinnedDiagonally(PinDirections.fromDownAndRight);
		} else if (enemyFoundUpAndLeft && allyKingFoundDownAndRight) {
			this.setPinnedDiagonally(PinDirections.fromUpAndLeft);
		} else if (enemyFoundUpAndRight && allyKingFoundDownAndLeft) {
			this.setPinnedDiagonally(PinDirections.fromUpAndRight);
		} else {
			this.setPinnedDiagonally();
			this.setPinnedHorizontally();
			this.setPinnedVertically();
		}
	}
}

export class Pawn extends Piece {
	promoted: boolean;
	globalCounterOnFirstMove: number;
	constructor(currentPosition: string, color: ColorTypes) {
		super(1, currentPosition, color, PieceTypes.pawn, 0, null, null, null);
		this.promoted = false;
		this.globalCounterOnFirstMove = 0;
	}

	setFirstMoveGlobalMoveCounter(globalCounterOnFirstMove: number) {
		this.globalCounterOnFirstMove = globalCounterOnFirstMove;
	}

	getFirstMoveGlobalMoveCounter() {
		return this.globalCounterOnFirstMove;
	}

	getMoveCounter() {
		return this.moveCounter;
	}

	verifyEnPassantSquare(neighbouringPiece: PieceType | undefined, currentGlobalMoveCounter: number) {

		// This logic is incomplete, enpassant is only possible when the opposing piece has moved 2 squares in the first move.
		return (
			neighbouringPiece && 
			(neighbouringPiece instanceof Pawn) &&
			neighbouringPiece.getColor() !== this.getColor() && 
			neighbouringPiece.getMoveCounter() === 1 &&
			currentGlobalMoveCounter - this.getFirstMoveGlobalMoveCounter() === 1
		);
	}

	verifyEnPassant(board: BoardType, currentGlobalMoveCounter: number) {
		const enpassantDirection = {
			toLeft: false,
			toRight: false
		};

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection === null) {
					
			if (
				(
					currentRow === 4 &&
					this.getColor() === ColorTypes.white
				) || 
				(
					currentRow === 3 &&
					this.getColor() === ColorTypes.black
				)
			) {
				let possiblePieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
				if (currentColumn < 7 && this.verifyEnPassantSquare(possiblePieceOnPosition, currentGlobalMoveCounter)) {
				
					//!NOTE: Need to handle a rare edge case, where en-passant should not be allowed if king and pawn are in the same row, but are pinned horizontally and an enemy pawn moves 2 squares in between the pawn and the king.
					let tempCol1 = currentColumn + 1;
					let tempCol2 = currentColumn;
					let pieceOnPosition: PieceType | undefined;
					let allyKingPresentOnSameRow = false;
					let enemyRookOrQueenPresentOnSameRow = false;
					while (true) {
						tempCol1++;
						tempCol2--;

						if (tempCol1 <= 7) {

							pieceOnPosition = board.get(getPositionString(currentRow, tempCol1));

							if (pieceOnPosition) {
								if (pieceOnPosition.getColor() === this.getColor()) {
									if (pieceOnPosition instanceof King) {
										allyKingPresentOnSameRow = true;
										tempCol1 = 8;
									}
								} else {
									if ([ PieceTypes.rook, PieceTypes.queen ].includes(pieceOnPosition.getType())) {
										enemyRookOrQueenPresentOnSameRow = true;
										tempCol1 = 8;
									}
								}
							}
						} 

						if (tempCol2 >= 0) {

							pieceOnPosition = board.get(getPositionString(currentRow, tempCol2));

							if (pieceOnPosition) {
								if (pieceOnPosition.getColor() === this.getColor()) {
									if (pieceOnPosition instanceof King) {
										allyKingPresentOnSameRow = true;
										tempCol2 = -1;
									}
								} else {
									if ([ PieceTypes.rook, PieceTypes.queen ].includes(pieceOnPosition.getType())) {
										enemyRookOrQueenPresentOnSameRow = true;
										tempCol2 = -1;
									}
								}
							}
						} 

						if (tempCol1 > 7 && tempCol2 < 0) break;
					}

					if (!(allyKingPresentOnSameRow && enemyRookOrQueenPresentOnSameRow))
						enpassantDirection.toRight = true;
				}
				
				possiblePieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
				if (currentColumn > 0 && this.verifyEnPassantSquare(possiblePieceOnPosition, currentGlobalMoveCounter)) {
					
					//!NOTE: Need to handle a rare edge case, where en-passant should not be allowed if king and pawn are in the same row, but are pinned horizontally and an enemy pawn moves 2 squares in between the pawn and the king.
					let tempCol1 = currentColumn - 1;
					let tempCol2 = currentColumn;
					let pieceOnPosition: PieceType | undefined;
					let allyKingPresentOnSameRow = false;
					let enemyRookOrQueenPresentOnSameRow = false;

					while (true) {
						tempCol1--;
						tempCol2++;

						if (tempCol1 >= 0) {

							pieceOnPosition = board.get(getPositionString(currentRow, tempCol1));

							if (pieceOnPosition) {
								if (pieceOnPosition.getColor() === this.getColor()) {
									if (pieceOnPosition instanceof King) {
										allyKingPresentOnSameRow = true;
										tempCol1 = -1;
									}
								} else {
									if ([ PieceTypes.rook, PieceTypes.queen ].includes(pieceOnPosition.getType())) {
										enemyRookOrQueenPresentOnSameRow = true;
										tempCol1 = -1;
									}
								}
							}
						} 

						if (tempCol2 <= 7) {

							pieceOnPosition = board.get(getPositionString(currentRow, tempCol2));

							if (pieceOnPosition) {
								if (pieceOnPosition.getColor() === this.getColor()) {
									if (pieceOnPosition instanceof King) {
										allyKingPresentOnSameRow = true;
										tempCol2 = 8;
									}
								} else {
									if ([ PieceTypes.rook, PieceTypes.queen ].includes(pieceOnPosition.getType())) {
										enemyRookOrQueenPresentOnSameRow = true;
										tempCol2 = 8;
									}
								}
							}
						} 

						if (tempCol1 > 7 && tempCol2 < 0) break;
					}

					if (!(allyKingPresentOnSameRow && enemyRookOrQueenPresentOnSameRow))
						enpassantDirection.toLeft = true;
				}
			}
		}

		return enpassantDirection;
	}

	getLegalMoves(board: BoardType, currentGlobalMoveCounter: number) {

		this.legalMoves = [];

		if (this.isCaptured()) return this.legalMoves;

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection !== null && [ PinDirections.fromLeft, PinDirections.fromRight ].includes(pinnedDirection)) return [];

		let pieceOnPosition: PieceType | undefined;

		/*
		 * EnPassant is only possible when the pawn is on the 5th rank and the opposing pawn adjacent to the current pawn moves 2 moves at once, which is only possible when this is the first move of the oppsoing pawn.
		 * Promotion Logic is a subset of the Capture Logic and the Advancing Logic.
		 */

		if (this.getColor() === ColorTypes.white) {

			if (currentRow < 7) {

				// Pinned Logic
				if (pinnedDirection !== null && [ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight ].includes(pinnedDirection)) return [];

				// Capture Logic
				if (currentColumn < 7) {

					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						(
							pinnedDirection === null ||
							(
								[ PinDirections.fromUpAndLeft, PinDirections.fromUpAndRight ].includes(pinnedDirection) &&
								[ PieceTypes.queen, PieceTypes.bishop ].includes(pieceOnPosition.getType())
							)
						)
					) this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 1), moveType: currentRow === 6 ? MoveTypes.promoteWithCapture : MoveTypes.capture });
				}

				if (currentColumn > 0) {

					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						(
							pinnedDirection === null ||
							(
								[ PinDirections.fromUpAndLeft, PinDirections.fromUpAndRight ].includes(pinnedDirection) &&
								[ PieceTypes.queen, PieceTypes.bishop ].includes(pieceOnPosition.getType())
							)
						)					
					) this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 1), moveType: currentRow === 6 ? MoveTypes.promoteWithCapture : MoveTypes.capture });
				}

				// EnPassant Logic
				const { toLeft, toRight } = this.verifyEnPassant(board, currentGlobalMoveCounter);

				if (toRight) this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 1), moveType: MoveTypes.enpassant });
				if (toLeft) this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 1), moveType: MoveTypes.enpassant });

				// Advancing Logic
				if (pinnedDirection === null || [ PinDirections.fromDown, PinDirections.fromUp ].includes(pinnedDirection)) {

					if (!board.get(getPositionString(currentRow + 1, currentColumn))) {

						// Advancement by 2 steps for pawns on 1st move
						if (this.moveCounter === 0 && !board.get(getPositionString(currentRow + 2, currentColumn)))
							this.legalMoves.push({ position: getPositionString(currentRow + 2, currentColumn), moveType: MoveTypes.advanceTwice });
						this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn), moveType: currentRow === 6 ? MoveTypes.promote : MoveTypes.advance });
					}
				}

			}
		} else if (this.getColor() === ColorTypes.black) {

			if (currentRow > 0) {

				// Pinned Logic
				if (pinnedDirection !== null && [ PinDirections.fromUpAndLeft, PinDirections.fromUpAndRight ].includes(pinnedDirection)) return [];

				// Capture Logic
				if (pinnedDirection === null || [ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight ].includes(pinnedDirection)) {

					if (currentColumn < 7) {

						pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));

						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== this.getColor() &&
							(
								pinnedDirection === null ||
								(
									[ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight ].includes(pinnedDirection) &&
									[ PieceTypes.queen, PieceTypes.bishop ].includes(pieceOnPosition.getType())
								)
							)
						) this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 1), moveType: currentRow === 1 ? MoveTypes.promoteWithCapture : MoveTypes.capture });
					}

					if (currentColumn > 0) {
						pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1))
						
						if (
							pieceOnPosition &&
							pieceOnPosition.getColor() !== this.getColor() &&
							(
								pinnedDirection == null ||
								(
									[ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight ].includes(pinnedDirection) &&
									[ PieceTypes.queen, PieceTypes.bishop ].includes(pieceOnPosition.getType())
								)
							)
						) this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 1), moveType: currentRow === 1 ? MoveTypes.promoteWithCapture : MoveTypes.capture });
					}
				}

				// EnPassant Logic

				const { toLeft, toRight } = this.verifyEnPassant(board, currentGlobalMoveCounter);

				if (toRight) this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 1), moveType: MoveTypes.enpassant });
				if (toLeft) this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 1), moveType: MoveTypes.enpassant });

				// Advancing Logic
				if (pinnedDirection === null || [ PinDirections.fromDown, PinDirections.fromUp ].includes(pinnedDirection)) {

					if (!board.get(getPositionString(currentRow - 1, currentColumn))) {

						// Advancement by 2 steps for pawns on 1st move
						if (this.moveCounter === 0 && !board.get(getPositionString(currentRow - 2, currentColumn)))
							this.legalMoves.push({ position: getPositionString(currentRow - 2, currentColumn), moveType: MoveTypes.advanceTwice });
						this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn), moveType: currentRow === 1 ? MoveTypes.promote : MoveTypes.advance });
					}
				}

			}
		}

		return this.legalMoves;
	}

	isPromoted() {
		return this.promoted;
	}

	handlePromotion(board: ChessBoard, promotedPiece: PromotedPiece) {
		board.replacePawnWithPromotedPiece(this.currentPosition, promotedPiece);
		this.promoted = true;
	}
}