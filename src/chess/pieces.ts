import { ChessBoard } from "./board";
import { PieceTypes, MoveTypes, ColorTypes, PinDirections, generateRandomPieceId, ILegalMoves, PromotedPiece, BoardType, PieceType } from "./constants";
import { getPositionString, validatePosition } from "./helper/helper";

class Piece {
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
		
		let pieceOnPosition: PieceType | undefined;

		function checkIfEnemyRookOrBishopOrQueenCanCapture() {
			let moveUpBy = currentRow;
			let moveDownBy = currentRow;
			let moveLeftBy = currentColumn;
			let moveRightBy = currentColumn;

			const possibleProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.rook ];
			const possibleDiagonalProtectionPieceTypes = [ PieceTypes.queen, PieceTypes.bishop ];

			if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

			let steps = 0;

			while (steps <= maxDistanceFromEdge) {

				moveLeftBy--;
				moveRightBy++;
				moveUpBy++;
				moveDownBy--;

				
				if (moveLeftBy >= 0) {
					
					pieceOnPosition = board.get(getPositionString(currentRow, moveLeftBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnCurrentPositon.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveRightBy <= 7) {
					
					pieceOnPosition = board.get(getPositionString(currentRow, moveRightBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveUpBy <= 7) {
					
					pieceOnPosition = board.get(getPositionString(moveUpBy, currentColumn));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveDownBy >= 0) {
					
					pieceOnPosition = board.get(getPositionString(moveDownBy, currentColumn));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveUpBy <= 7 && moveLeftBy >= 0) {
					
					pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveDownBy >= 0 && moveRightBy <= 7) {
					
					pieceOnPosition = board.get(getPositionString(moveDownBy, moveRightBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveUpBy <= 7 && moveRightBy <= 7) {
					
					pieceOnPosition = board.get(getPositionString(moveUpBy, moveRightBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				
				if (moveDownBy >= 0 && moveLeftBy >= 0) {
					
					pieceOnPosition = board.get(getPositionString(moveDownBy, moveLeftBy));
					
					if (pieceOnPosition)
						return (
							pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
							possibleDiagonalProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
							!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
						);
				}

				steps++;
			}
			return false;
		}

		function checkIfEnemyKnightCanCapture() {
			const possibleProtectionPieceTypes = [ PieceTypes.knight ];

			if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

			if (currentRow - 2 >= 0) {

				if (currentColumn - 1 >= 0) {
					pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn - 1));
	
					// Handling Backward Row Left Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}

				if (currentColumn + 1 <= 7) {
					pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn + 1));
	
					// Handling Backward Row Right Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}
			}

			// Handling Upward Row Movement.
			if (currentRow + 2 <= 7) {

				if (currentColumn - 1 >= 0) {
					pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn - 1));
	
					// Handling Upward Row Left Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}

				if (currentColumn + 1 <= 7) {
					pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn + 1));
					
					// Handling Upward Row Right Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}
			}

			// Handling Left Column Movement.
			if (currentColumn - 2 >= 0) {

				if (currentRow - 1 >= 0) {
					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 2));
	
					// Handling Left Column Downward Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}

				if (currentRow + 1 <= 7) {
					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 2));
	
					// Handling Left Column Upward Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}
			}

			// Handling Right Column Movement.
			if (currentColumn + 2 <= 7) {

				if (currentRow - 1 >= 0) {
					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 2));
	
					// Handling Right Column Upward Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}

				if (currentRow + 1 <= 7) {
					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 2));
	
					// Handling Right Column Downward Movement.
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
						!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
					)
						return true;
				}
			}
			return false;
		}

		function checkIfEnemyPawnCanCapture() {
			const possibleProtectionPieceTypes = [ PieceTypes.pawn ];

			if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

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
			checkIfEnemyRookOrBishopOrQueenCanCapture() ||
            checkIfEnemyKnightCanCapture() ||
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

		while (steps <= maxDistanceFromEdge) {

			moveLeftBy--;
			moveRightBy++;
			moveUpBy++;
			moveDownBy--;

			// check if king is to the right of piece, to verify if it is pinned horizontally from left.			
			if (
				continueLeft &&
				moveLeftBy >= 0
			) {
				
				pieceOnPosition = board.get(getPositionString(currentRow, moveLeftBy));

				if (pieceOnPosition) {
					continueLeft = false;
	
					if (pieceOnPosition.getColor() === pieceOnCurrentPositon.getColor()) {
						allyKingFoundLeft = pieceOnPosition.getType() === PieceTypes.king;
					} else if (
						pieceOnPosition.getColor() !== pieceOnCurrentPositon.getColor()
					) {
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

class Pawn extends Piece {
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
									if (
										(pieceOnPosition instanceof Rook) || 
										(pieceOnPosition instanceof Queen)
									) {
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
									if (
										(pieceOnPosition instanceof Rook) || 
										(pieceOnPosition instanceof Queen)
									) {
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
									if (
										(pieceOnPosition instanceof Rook) || 
										(pieceOnPosition instanceof Queen)
									) {
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
									if (
										(pieceOnPosition instanceof Rook) || 
										(pieceOnPosition instanceof Queen)
									) {
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

class Rook extends Piece {
	constructor(currentPosition: string, color: ColorTypes, pinnedDiagonally: PinDirections | null = null, pinnedHorizontally: PinDirections | null = null, pinnedVertically: PinDirections | null = null) {
		super(5, currentPosition, color, PieceTypes.rook, 0, pinnedDiagonally, pinnedHorizontally, pinnedVertically);
	}

	getLegalMoves(board: BoardType) {

		this.legalMoves = [];

		if (this.isCaptured()) return this.legalMoves;

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn));
		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

		// Advancement and Capturing Logic.
		let moveUpBy = currentRow;
		let moveDownBy = currentRow;
		let moveRightBy = currentColumn;
		let moveLeftBy = currentColumn;

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection !== null && [ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight, PinDirections.fromUpAndLeft, PinDirections.fromUpAndRight ].includes(pinnedDirection)) return this.legalMoves;

		let pieceOnPosition: PieceType | undefined;
		
		while (true) {
			moveUpBy++;
			moveDownBy--;
			moveRightBy++;
			moveLeftBy--;

			// Handling upward movement.			
			if (moveUpBy <= 7 && (pinnedDirection === null || [ PinDirections.fromUp ].includes(pinnedDirection))) {
				
				pieceOnPosition = board.get(getPositionString(moveUpBy, currentColumn));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, currentColumn), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, currentColumn), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUpBy = 8;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUpBy = 8;
				}
			}

			// Handling downward movement.
			if (moveDownBy >= 0 && (pinnedDirection === null || [ PinDirections.fromDown ].includes(pinnedDirection))) {
				
				pieceOnPosition = board.get(getPositionString(moveDownBy, currentColumn));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, currentColumn), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, currentColumn), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDownBy = -1;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDownBy = -1;
				}
			}

			// Handling right sliding movement.
			if (moveRightBy <= 7 && (pinnedDirection === null || [ PinDirections.fromRight ].includes(pinnedDirection))) {
				
				pieceOnPosition = board.get(getPositionString(currentRow, moveRightBy));
				
				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveRightBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveRightBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveRightBy = 8;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveRightBy = 8;
				}
			}

			// Handling left sliding movement.
			if (moveLeftBy >= 0 && (pinnedDirection === null || [ PinDirections.fromLeft ].includes(pinnedDirection))) {

				pieceOnPosition = board.get(getPositionString(currentRow, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveLeftBy = -1;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveLeftBy = -1;
				}
			}

			// If all pointers are out of bounds then there are no more legal moves.
			if (moveUpBy > 7 && moveDownBy < 0 && moveRightBy > 7 && moveLeftBy < 0) break;
		}

		return this.legalMoves;
	}
}

class Knight extends Piece {
	constructor(currentPosition: string, color: ColorTypes, pinnedDiagonally: PinDirections | null = null, pinnedHorizontally: PinDirections | null = null, pinnedVertically: PinDirections | null = null) {
		super(3, currentPosition, color, PieceTypes.knight, 0, pinnedDiagonally, pinnedHorizontally, pinnedVertically);
	}

	getLegalMoves(board: BoardType) {

		this.legalMoves = [];

		if (this.isCaptured()) return this.legalMoves;

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection !== null) return this.legalMoves;

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn));
		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

		let pieceOnPosition: PieceType | undefined;

		// Knight moves like an octopus.

		// Handling Backward Row Movement.
		if (currentRow - 2 >= 0) {

			// Handling Backward Row Left Movement.
			if (currentColumn - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn - 1));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow - 2, currentColumn - 1), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow - 2, currentColumn - 1), moveType: MoveTypes.capture });

			}

			// Handling Backward Row Right Movement.
			if (currentColumn + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn + 1));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow - 2, currentColumn + 1), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow - 2, currentColumn + 1), moveType: MoveTypes.capture });

			}
		}

		// Handling Upward Row Movement.
		if (currentRow + 2 <= 7) {

			// Handling Upward Row Left Movement.
			if (currentColumn - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn - 1));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow + 2, currentColumn - 1), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow + 2, currentColumn - 1), moveType: MoveTypes.capture });

			}

			// Handling Upward Row Right Movement.
			if (currentColumn + 1 <= 7) {
				
				pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn + 1));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow + 2, currentColumn + 1), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow + 2, currentColumn + 1), moveType: MoveTypes.capture });

			}
		}

		// Handling Left Column Movement.
		if (currentColumn - 2 >= 0) {

			// Handling Left Column Downward Movement.
			if (currentRow - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 2));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 2), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 2), moveType: MoveTypes.capture });

			}

			// Handling Left Column Upward Movement.
			if (currentRow + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 2));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 2), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 2), moveType: MoveTypes.capture });

			}
		}

		// Handling Right Column Movement.
		if (currentColumn + 2 <= 7) {

			// Handling Right Column Upward Movement.
			if (currentRow - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 2));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 2), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 2), moveType: MoveTypes.capture });

			}

			// Handling Right Column Downward Movement.
			if (currentRow + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 2));

				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 2), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 2), moveType: MoveTypes.capture });

			}
		}

		return this.legalMoves;
	}
}

class Bishop extends Piece {
	constructor(currentPosition: string, color: ColorTypes, pinnedDiagonally: PinDirections | null = null, pinnedHorizontally: PinDirections | null = null, pinnedVertically: PinDirections | null = null) {
		super(3, currentPosition, color, PieceTypes.bishop, 0, pinnedDiagonally, pinnedHorizontally, pinnedVertically);
	}

	getLegalMoves(board: BoardType) {

		this.legalMoves = []

		if (this.isCaptured()) return this.legalMoves;

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection !== null && [ PinDirections.fromDown, PinDirections.fromUp, PinDirections.fromLeft, PinDirections.fromRight ].includes(pinnedDirection)) return this.legalMoves;

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn));
		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

		// Advancement and Capturing Logic.
		let moveRightBy = currentColumn;
		let moveDownBy = currentRow;
		let moveUpBy = currentRow;
		let moveLeftBy = currentColumn;

		let moveUpAndLeft = true;
		let moveUpAndRight = true;
		let moveDownAndLeft = true;
		let moveDownAndRight = true;

		let pieceOnPosition: PieceType | undefined;

		while (true) {

			moveRightBy++;
			moveDownBy--;
			moveLeftBy--;
			moveUpBy++;

			// Handling Down and Left sliding movement.
			if (
				moveDownAndLeft &&
				(moveLeftBy >= 0 && moveDownBy >= 0) &&
				(pinnedDirection === null || [ PinDirections.fromDownAndLeft ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDownAndLeft = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDownAndLeft = false;
				}
			}

			// Handling Up and Right sliding movement.
			if (
				moveUpAndLeft &&
				(moveLeftBy >= 0 && moveUpBy <= 7) &&
				(pinnedDirection === null || [ PinDirections.fromUpAndLeft ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUpAndLeft = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUpAndLeft = false;
				}
			}

			// Handling Down and Right sliding movement.
			if (
				moveDownAndRight &&
				(moveRightBy <= 7 && moveDownBy >= 0) &&
				(pinnedDirection === null || [ PinDirections.fromDownAndRight ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveRightBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveRightBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveRightBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDownAndRight = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDownAndRight = false;
				}
			}

			// Handling Up and Left sliding movement.
			if (
				moveUpAndRight &&
				(moveLeftBy >= 0 && moveUpBy <= 7) &&
				(pinnedDirection === null || [ PinDirections.fromUpAndRight ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUpAndRight = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUpAndRight = false;
				}
			}

			// If all pointers are out of bounds then there are no more legal moves.
			if (
				!(moveUpAndLeft || moveDownAndRight || moveUpAndRight || moveDownAndLeft) ||
                (moveUpBy > 7 && moveDownBy < 0 && moveRightBy > 7 && moveLeftBy < 0)
			) break;
		}

		return this.legalMoves;
	}
}

class Queen extends Piece {
	constructor(currentPosition: string, color: ColorTypes, pinnedDiagonally: PinDirections | null = null, pinnedHorizontally: PinDirections | null = null, pinnedVertically: PinDirections | null = null) {
		super(9, currentPosition, color, PieceTypes.queen, 0, pinnedDiagonally, pinnedHorizontally, pinnedVertically);
	}

	getLegalMoves(board: BoardType) {

		this.legalMoves = [];

		if (this.isCaptured()) return this.legalMoves;

		const pinnedDirection = this.getPinnedDirection(board);

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		const pieceOnCurrentPositon = board.get(getPositionString(currentRow, currentColumn));
		if (!pieceOnCurrentPositon) throw new Error('Invalid operation on current location! Piece not found.');

		// Advancement and Capturing Logic.
		let moveRightBy = currentColumn;
		let moveDownBy = currentRow;
		let moveUpBy = currentRow;
		let moveLeftBy = currentColumn;

		let moveUp = true;
		let moveDown = true;
		let moveLeft = true;
		let moveRight = true;
		let moveUpAndLeft = true;
		let moveUpAndRight = true;
		let moveDownAndLeft = true;
		let moveDownAndRight = true;

		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);
		let steps = 0;

		let pieceOnPosition: PieceType | undefined;

		while (steps <= maxDistanceFromEdge) {

			moveRightBy++;
			moveDownBy--;
			moveLeftBy--;
			moveUpBy++;

			// Handling upward movement.
			if (moveUp && moveUpBy <= 7 && (pinnedDirection === null || [ PinDirections.fromUp ].includes(pinnedDirection))) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, currentColumn));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, currentColumn), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, currentColumn), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUp = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUp = false;
				}
			}

			// Handling downward movement.
			if (moveDown && moveDownBy >= 0 && (pinnedDirection === null || [ PinDirections.fromDown ].includes(pinnedDirection))) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, currentColumn));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, currentColumn), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, currentColumn), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDown = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDown = false;
				}
			}

			// Handling right sliding movement.
			if (moveRight && moveRightBy <= 7 && (pinnedDirection === null || [ PinDirections.fromRight ].includes(pinnedDirection))) {

				pieceOnPosition = board.get(getPositionString(currentRow, moveRightBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveRightBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveRightBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveRight = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveRight = false;
				}
			}

			// Handling left sliding movement.
			if (moveLeft && moveLeftBy >= 0 && (pinnedDirection === null || [ PinDirections.fromLeft ].includes(pinnedDirection))) {

				pieceOnPosition = board.get(getPositionString(currentRow, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(currentRow, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveLeft = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveLeft = false;
				}
			}

			// Handling Down and Left sliding movement.
			if (
				moveDownAndLeft &&
				(moveLeftBy >= 0 && moveDownBy >= 0) &&
				(pinnedDirection === null || [ PinDirections.fromDownAndLeft ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDownAndLeft = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDownAndLeft = false;
				}
			}

			// Handling Up and Right sliding movement.
			if (
				moveUpAndLeft &&
				(moveLeftBy >= 0 && moveUpBy <= 7) &&
				(pinnedDirection === null || [ PinDirections.fromUpAndLeft ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUpAndLeft = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUpAndLeft = false;
				}
			}

			// Handling Down and Right sliding movement.
			if (
				moveDownAndRight &&
				(moveRightBy <= 7 && moveDownBy >= 0) &&
				(pinnedDirection === null || [ PinDirections.fromDownAndRight ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveDownBy, moveRightBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveRightBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveDownBy, moveRightBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveDownAndRight = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveDownAndRight = false;
				}
			}

			// Handling Up and Left sliding movement.
			if (
				moveUpAndRight &&
				(moveLeftBy >= 0 && moveUpBy <= 7) &&
				(pinnedDirection === null || [ PinDirections.fromUpAndRight ].includes(pinnedDirection))
			) {

				pieceOnPosition = board.get(getPositionString(moveUpBy, moveLeftBy));

				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.advance });
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(moveUpBy, moveLeftBy), moveType: MoveTypes.capture });

					// Since an opposing piece is found, no more moves in this direction are possible.
					moveUpAndRight = false;
				} else {

					// Since a same color piece is found, no more moves in this direction are possible.
					moveUpAndRight = false;
				}
			}

			steps++;
		}

		return this.legalMoves;
	}
}

class KingUtils {
	inCheck: boolean;
	currentPosition: string;
	color: ColorTypes;
	pieceId: string;
	type: PieceTypes;
	moveCounter: number;
	castled: boolean;
	attackedFrom: string[];
	inDoubleCheck: boolean;
	legalMoves: ILegalMoves[];
	constructor(currentPosition: string, color: ColorTypes, moveCounter = 0) {
		this.inCheck = false;
		this.inDoubleCheck = false;
		this.currentPosition = currentPosition;
		this.color = color;
		this.pieceId = generateRandomPieceId();
		this.type = PieceTypes.king;
		this.moveCounter = moveCounter;
		this.castled = false;
		this.attackedFrom = [];
		this.legalMoves = [];
	}

	getCurrentPosition() {
		return this.currentPosition;
	}

	updateCurrentPosition(updatedPosition: string) {
		validatePosition(updatedPosition);
		this.currentPosition = updatedPosition;
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

	moveToPosition(board: ChessBoard, updatedPosition: string) {
		board.setBoard(this.getCurrentPosition(), updatedPosition);
		this.incrementMoveCounter();
		this.updateCurrentPosition(updatedPosition);
	}

	markInCheck(inCheck: boolean) {
		this.inCheck = inCheck;
	}

	markInDoubleCheck(inDoubleCheck: boolean) {
		this.inDoubleCheck = inDoubleCheck;
	}

	isInCheck() {
		return this.inCheck;
	}
	
	isInDoubleCheck() {
		return this.inDoubleCheck;
	}

	checkMated() {
		return false;
	}

	verifyBounds(value: number): boolean {
		return (value <= 7 && value >= 0);
	}

	getPossiblePositionOfAttacker(board: BoardType, row: number, column: number, possibleAttackingPieces: PieceTypes[]): string {

		if (
			this.verifyBounds(row) && 
			this.verifyBounds(column)
		) {
			const pieceOnPosition = board.get(getPositionString(row, column));
	
			if (pieceOnPosition) {
				if (
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleAttackingPieces.includes(pieceOnPosition.getType())
				)
					return getPositionString(row, column);
				else
					return 'NA';
			}
		}
		
		return '';
	
	}

	checkForEnemyKnight(currentRow: number, currentColumn: number, board: BoardType, storeAttackedFrom = false) {
		const possibleProtectionPieceTypes = [ PieceTypes.knight ];

		let pieceOnPosition: PieceType | undefined;

		if (currentRow - 2 >= 0) {

			// Handling Backward Row Left Movement.
			if (currentColumn - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn - 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 2, currentColumn - 1));
					}
					return true;
				}
			}


			// Handling Backward Row Right Movement.
			if (currentColumn + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn + 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 2, currentColumn + 1));
					}
					return true;
				}
			}

		}

		// Handling Upward Row Movement.
		if (currentRow + 2 <= 7) {

			// Handling Upward Row Left Movement.
			if (currentColumn - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn - 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 2, currentColumn - 1));
					}
					return true;
				}
			}


			// Handling Upward Row Right Movement.
			if (currentColumn + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn + 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 2, currentColumn + 1));
					}
					return true;
				}
			}

		}

		// Handling Left Column Movement.
		if (currentColumn - 2 >= 0) {

			// Handling Left Column Downward Movement.
			if (currentRow - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 2));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn - 2));
					}
					return true;
				}
			}


			// Handling Left Column Upward Movement.
			if (currentRow + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 2));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn - 2));
					}
					return true;
				}
			}

		}

		// Handling Right Column Movement.
		if (currentColumn + 2 <= 7) {

			// Handling Right Column Upward Movement.
			if (currentRow - 1 >= 0) {

				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 2));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn + 2));
					}
					return true;
				}
			}

			// Handling Right Column Downward Movement.
			if (currentRow + 1 <= 7) {

				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 2));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn + 2));
					}
					return true;
				}
			}

		}
		return false;
	}

	checkForEnemyPawn(currentRow: number, currentColumn: number, board: BoardType, storeAttackedFrom = false) {
		
		const possibleProtectionPieceTypes = [ PieceTypes.pawn ];

		let pieceOnPosition: PieceType | undefined;

		if (this.getColor() === ColorTypes.white) {
			if (
				(currentRow - 1 >= 0 && currentRow <= 7) &&
				(currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
			) {
				
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
					!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn - 1));
					}
					return true;
				}
				
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
					!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn + 1));
					}
					return true;
				}
			}   

		} else if (this.getColor() === ColorTypes.black) {

			if (
				(currentRow + 1 <= 7 && currentRow >= 0) &&
				(currentColumn - 1 >= 0 || currentColumn + 1 <= 7)
			) {
				
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
					!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn - 1));
					}
					return true;
				}
				
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
				
				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType()) &&
					!(pieceOnPosition instanceof King) && !pieceOnPosition.isPinned()
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn + 1));
					}
					return true;
				}
			}

		}
		return false;
	}

	checkForEnemyKing(currentRow: number, currentColumn: number, board: BoardType) {
		const possibleMoves = [
			[ 0, -1 ],
			[ 0, 1 ],
			[ 1, -1 ],
			[ 1, 1 ],
			[ 1, 0 ],
			[ -1, 1 ],
			[ -1, 0 ],
			[ -1, -1 ]
		];

		const possibleProtectionPieceTypes = [ PieceTypes.king ];

		let pieceOnPosition: PieceType | undefined;

		for (const possibleMove of possibleMoves) {
			const possibleRow = currentRow + possibleMove[0];
			const possibleColumn = currentColumn + possibleMove[1];
			if (
				(possibleRow >= 0 && possibleRow <= 7) &&
				(possibleColumn >= 0 && possibleColumn <= 7)
			) {

				pieceOnPosition = board.get(getPositionString(possibleRow, possibleColumn));

				if (
					pieceOnPosition &&
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) return true;
			}
		}

		return false;
	}

	checkForEnemyPieces(board: BoardType) {

		const currentRow: number = +this.currentPosition[0];
		const currentColumn: number = +this.currentPosition[1];

		// need to handle checks from enemy kinghts and pawns.
		if (
			this.checkForEnemyKnight(currentRow, currentColumn, board, true) ||
			this.checkForEnemyPawn(currentRow, currentColumn, board, true)
		)
			this.markInCheck(true);
		else
			this.markInCheck(false);

		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);

		this.legalMoves = [];

		let moveUpBy = currentRow + 1;
		let moveDownBy = currentRow - 1;
		let moveRightBy = currentColumn + 1;
		let moveLeftBy = currentColumn - 1;

		const enemyPiecePosition: Record<any, Record<number, string>> = {
			fromLeft: {
				0: '',
				1: '',
				2: ''
			},
			fromRight: {
				0: '',
				1: '',
				2: ''
			},
			fromUp: {
				0: '',
				1: '',
				2: ''
			},
			fromDown: {
				0: '',
				1: '',
				2: ''
			},
			fromUpAndLeft: {
				0: '',
				1: '',
				2: '',
				3: '',
				4: '',
			},
			fromDownAndLeft: {
				0: '',
				1: '',
				2: '',
				3: '',
				4: '',
			},
			fromUpAndRight: {
				0: '',
				1: '',
				2: '',
				3: '',
				4: '',
			},
			fromDownAndRight: {
				0: '',
				1: '',
				2: '',
				3: '',
				4: '',
			}
		};

		const possibleLinearAttackingPieces = [ PieceTypes.rook, PieceTypes.queen ];
		const possibleDiagonalAttackingPieces = [ PieceTypes.bishop, PieceTypes.queen ];

		let steps = 0;

		let pieceOnPosition: PieceType | undefined;

		while (steps <= maxDistanceFromEdge) {

			moveLeftBy--;
			moveRightBy++;
			moveUpBy++;
			moveDownBy--;

			if (!enemyPiecePosition.fromLeft[0].length) {
				enemyPiecePosition.fromLeft[0] = this.getPossiblePositionOfAttacker(board, currentRow + 1, moveLeftBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromLeft[1].length) {
				enemyPiecePosition.fromLeft[1] = this.getPossiblePositionOfAttacker(board, currentRow, moveLeftBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromLeft[2].length) {
				enemyPiecePosition.fromLeft[2] = this.getPossiblePositionOfAttacker(board, currentRow - 1, moveLeftBy, possibleLinearAttackingPieces);					
			}

			if (!enemyPiecePosition.fromRight[0].length) {
				enemyPiecePosition.fromRight[0] = this.getPossiblePositionOfAttacker(board, currentRow + 1, moveRightBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromRight[1].length) {
				enemyPiecePosition.fromRight[1] = this.getPossiblePositionOfAttacker(board, currentRow, moveRightBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromRight[2].length) {
				enemyPiecePosition.fromRight[2] = this.getPossiblePositionOfAttacker(board, currentRow - 1, moveRightBy, possibleLinearAttackingPieces);					
			}

			if (!enemyPiecePosition.fromDown[0].length) {
				enemyPiecePosition.fromDown[0] = this.getPossiblePositionOfAttacker(board, moveDownBy, currentColumn - 1, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromDown[1].length) {
				enemyPiecePosition.fromDown[1] = this.getPossiblePositionOfAttacker(board, moveDownBy, currentColumn, possibleLinearAttackingPieces);
			}
			
			if (!enemyPiecePosition.fromDown[2].length) {
				enemyPiecePosition.fromDown[2] = this.getPossiblePositionOfAttacker(board, moveDownBy, currentColumn + 1, possibleLinearAttackingPieces);					
			}

			if (!enemyPiecePosition.fromUp[0].length) {
				enemyPiecePosition.fromUp[0] = this.getPossiblePositionOfAttacker(board, moveUpBy, currentColumn - 1, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromUp[1].length) {
				enemyPiecePosition.fromUp[1] = this.getPossiblePositionOfAttacker(board, moveUpBy ,currentColumn, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromUp[2].length) {
				enemyPiecePosition.fromUp[2] = this.getPossiblePositionOfAttacker(board, moveUpBy, currentColumn + 1, possibleLinearAttackingPieces);					
			}

			if (!enemyPiecePosition.fromUpAndLeft[0].length) {
				enemyPiecePosition.fromUpAndLeft[0] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndLeft[1].length) {
				enemyPiecePosition.fromUpAndLeft[1] = this.getPossiblePositionOfAttacker(board, moveUpBy - 1, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndLeft[2].length) {
				enemyPiecePosition.fromUpAndLeft[2] = this.getPossiblePositionOfAttacker(board, moveUpBy - 2, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndLeft[3].length) {
				enemyPiecePosition.fromUpAndLeft[3] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveLeftBy + 1, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndLeft[4].length) {
				enemyPiecePosition.fromUpAndLeft[4] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveLeftBy + 2, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight[0].length) {
				enemyPiecePosition.fromUpAndRight[0] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveRightBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight[1].length) {
				enemyPiecePosition.fromUpAndRight[1] = this.getPossiblePositionOfAttacker(board, moveUpBy - 1, moveRightBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight[2].length) {
				enemyPiecePosition.fromUpAndRight[2] = this.getPossiblePositionOfAttacker(board, moveUpBy - 2, moveRightBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight[3].length) {
				enemyPiecePosition.fromUpAndRight[3] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveRightBy - 1, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight[4].length) {
				enemyPiecePosition.fromUpAndRight[4] = this.getPossiblePositionOfAttacker(board, moveUpBy, moveRightBy - 2, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft[0].length) {
				enemyPiecePosition.fromDownAndLeft[0] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft[1].length) {
				enemyPiecePosition.fromDownAndLeft[1] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveLeftBy + 1, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft[2].length) {
				enemyPiecePosition.fromDownAndLeft[2] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveLeftBy + 2, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft[3].length) {
				enemyPiecePosition.fromDownAndLeft[3] = this.getPossiblePositionOfAttacker(board, moveDownBy + 1, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft[4].length) {
				enemyPiecePosition.fromDownAndLeft[4] = this.getPossiblePositionOfAttacker(board, moveDownBy + 2, moveLeftBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight[0].length) {
				enemyPiecePosition.fromDownAndRight[0] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveRightBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight[1].length) {
				enemyPiecePosition.fromDownAndRight[1] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveRightBy - 1, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight[2].length) {
				enemyPiecePosition.fromDownAndRight[2] = this.getPossiblePositionOfAttacker(board, moveDownBy, moveRightBy - 2, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight[3].length) {
				enemyPiecePosition.fromDownAndRight[3] = this.getPossiblePositionOfAttacker(board, moveDownBy + 1, moveRightBy, possibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight[4].length) {
				enemyPiecePosition.fromDownAndRight[4] = this.getPossiblePositionOfAttacker(board, moveDownBy + 2, moveRightBy, possibleDiagonalAttackingPieces);
			}

			steps++;
		}

		for (const direction in enemyPiecePosition) {
			for (const position in enemyPiecePosition[direction]) {
				if (enemyPiecePosition[direction][position] === 'NA') {
					enemyPiecePosition[direction][position] = '';
				}
			}
		}

		const impossibleMoves: string[] = [];

		function resetInitialStates() {
			return {
				fromUp: false,
				fromDown: false,
				fromRight: false,
				fromLeft: false,
				fromUpAndRight: false,
				fromUpAndLeft: false,
				fromDownAndRight: false,
				fromDownAndLeft: false
			};
		}
		
		let protectedByPieceInProximity = resetInitialStates();
		let pieceProtectionBlocked = resetInitialStates();
		let pieceOnSquare: PieceType | undefined;
		let attackedByEnemyRookOrQueen: boolean = false;
		let attackedByEnemyBishopOrQueen: boolean = false;
		let isSquareAttackedFromDistance: boolean = false;

		// bottom left corner from kings current position.
		if (
			this.verifyBounds(currentRow - 1) &&
			this.verifyBounds(currentColumn - 1)
		) {
			pieceOnSquare = board.get(getPositionString(currentRow - 1, currentColumn - 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			if (this.getColor() === ColorTypes.black) {
				diagonalAttackingPieceTypes.push(PieceTypes.pawn);
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
					
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType())) {
					protectedByPieceInProximity.fromUp = true;
				} else {
					pieceProtectionBlocked.fromUp = true;
				}
			}

			if (!pieceProtectionBlocked.fromUp) {
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
					
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType())) {
						protectedByPieceInProximity.fromUp = true;
					} else {
						pieceProtectionBlocked.fromUp = true;
					}
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn));
					
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType())) {
					protectedByPieceInProximity.fromRight = true;
				} else {
					pieceProtectionBlocked.fromRight = true;
				}
			}

			if (!pieceProtectionBlocked.fromRight) {
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
					
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType())) {
						protectedByPieceInProximity.fromRight = true;
					} else {
						pieceProtectionBlocked.fromRight = true;
					}
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
					
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if ([ PieceTypes.bishop, PieceTypes.queen ].includes(pieceOnPosition.getType())) {
					protectedByPieceInProximity.fromUpAndRight = true;
				} else {
					pieceProtectionBlocked.fromUpAndRight = true;
				}
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromUp || protectedByPieceInProximity.fromRight || protectedByPieceInProximity.fromUpAndRight)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow - 1, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow - 1, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow - 1, currentColumn - 1, board);
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromLeft[2].length ||
				enemyPiecePosition.fromDown[0].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromDownAndLeft[0].length ||
				enemyPiecePosition.fromDownAndRight[2].length ||
				enemyPiecePosition.fromUpAndLeft[2].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (diagonalAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn - 1));
						// mark in check
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[0].length === 0) || pieceProtectionBlocked.fromUp) &&
						((!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[2].length === 0) || pieceProtectionBlocked.fromRight) &&
						((!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[0].length === 0) || pieceProtectionBlocked.fromUpAndRight) &&
						(!protectedByPieceNotInProximity) &&
						(!isSquareAttackedFromDistance)
					) {
						this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow - 1, currentColumn - 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromDownAndLeft[0].length > 0) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromDownAndLeft[0])
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow - 1, currentColumn - 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[0].length === 0) &&
					(!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[2].length === 0) &&
					(!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[0].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn - 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow - 1, currentColumn - 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// bottom right corner from kings current position
		if (
			this.verifyBounds(currentRow - 1) &&
			this.verifyBounds(currentColumn + 1)
		) {
			pieceOnSquare = board.get(getPositionString(currentRow - 1, currentColumn + 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			if (this.getColor() === ColorTypes.black) {
				diagonalAttackingPieceTypes.push(PieceTypes.pawn);
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUp = true;
				else
					pieceProtectionBlocked.fromUp = true;
			}

			if (!pieceProtectionBlocked.fromUp) {
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromUp = true;
					else
						pieceProtectionBlocked.fromUp = true;
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromLeft = true;
				else
					pieceProtectionBlocked.fromLeft = true;
			}

			if (!pieceProtectionBlocked.fromLeft) {
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromLeft = true;
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if ([ PieceTypes.bishop, PieceTypes.queen ].includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUpAndLeft = true;
				else
					pieceProtectionBlocked.fromUpAndLeft = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromUp || protectedByPieceInProximity.fromLeft || protectedByPieceInProximity.fromUpAndLeft)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow - 1, currentColumn + 1, board);
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow - 1, currentColumn + 1, board);
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow - 1, currentColumn + 1, board);
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromRight[2].length ||
				enemyPiecePosition.fromDown[2].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromDownAndRight[0].length ||
				enemyPiecePosition.fromDownAndLeft[2].length ||
				enemyPiecePosition.fromUpAndRight[2].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (diagonalAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						// mark in check
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn + 1));
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[2].length === 0) || pieceProtectionBlocked.fromUp) &&
						((!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[2].length === 0) || pieceProtectionBlocked.fromLeft) &&
						((!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[0].length === 0) || pieceProtectionBlocked.fromUpAndLeft) &&
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow - 1, currentColumn + 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromDownAndRight[0].length) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromDownAndRight[0]);
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow - 1, currentColumn + 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[2].length === 0) &&
					(!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[2].length === 0) &&
					(!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[0].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn + 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow - 1, currentColumn + 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// top left corner from kings current position
		if (
			this.verifyBounds(currentRow + 1) &&
			this.verifyBounds(currentColumn - 1)
		) {
			pieceOnSquare = board.get(getPositionString(currentRow + 1, currentColumn - 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			if (this.getColor() === ColorTypes.white) {
				diagonalAttackingPieceTypes.push(PieceTypes.pawn);
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDown = true;
				else
					pieceProtectionBlocked.fromDown = true;
			}

			if (!pieceProtectionBlocked.fromDown) {
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromDown = true;
					else 
						pieceProtectionBlocked.fromDown = true;
				} 
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromRight = true;
				else
					pieceProtectionBlocked.fromRight = true;
			}

			if (!pieceProtectionBlocked.fromRight) {
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromRight = true;
					else
						pieceProtectionBlocked.fromRight = true;
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
				
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if ([ PieceTypes.bishop, PieceTypes.queen ].includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndRight = true;
				else
					pieceProtectionBlocked.fromDownAndRight = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromDown || protectedByPieceInProximity.fromRight || protectedByPieceInProximity.fromDownAndRight)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow + 1, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow + 1, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow + 1, currentColumn - 1, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromUp[0].length ||
				enemyPiecePosition.fromLeft[0].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromUpAndLeft[0].length ||
				enemyPiecePosition.fromUpAndRight[2].length ||
				enemyPiecePosition.fromDownAndLeft[2].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (diagonalAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn - 1));
						// mark in check
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[0].length === 0) || pieceProtectionBlocked.fromDown) &&
						((!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[0].length === 0) || pieceProtectionBlocked.fromRight) &&
						((!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[0].length === 0) || pieceProtectionBlocked.fromDownAndRight) &&
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow + 1, currentColumn - 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromUpAndLeft[0].length) {
				// mark in enemyPiecePosition.fromUpAndLeft[0]+ 1, currentColumn - 1));
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow - 1, currentColumn + 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[0].length === 0) &&
					(!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[0].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[0].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn - 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow + 1, currentColumn - 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// top right corner from kings current position
		if (
			this.verifyBounds(currentRow + 1) &&
			this.verifyBounds(currentColumn + 1)
		) {
			pieceOnSquare = board.get(getPositionString(currentRow + 1, currentColumn + 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			if (this.getColor() === ColorTypes.white) {
				diagonalAttackingPieceTypes.push(PieceTypes.pawn);
			}
			
			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDown = true;
				else
					pieceProtectionBlocked.fromDown = true;
			}

			if (!pieceProtectionBlocked.fromDown) {
				pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromDown = true;
					else
						pieceProtectionBlocked.fromDown = true;
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromLeft = true;
				else
					pieceProtectionBlocked.fromLeft = true;
			} 

			if (!pieceProtectionBlocked.fromLeft) {
				pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
				
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
					
					if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
						protectedByPieceInProximity.fromLeft = true;
					else
						pieceProtectionBlocked.fromLeft = true;
				}
			} 

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
				
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if ([ PieceTypes.bishop, PieceTypes.queen ].includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndLeft = true;
				else
					pieceProtectionBlocked.fromDownAndLeft = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromDown || protectedByPieceInProximity.fromLeft || protectedByPieceInProximity.fromDownAndLeft)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow + 1, currentColumn + 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow + 1, currentColumn + 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow + 1, currentColumn + 1, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromUp[2].length ||
				enemyPiecePosition.fromRight[0].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromUpAndLeft[4].length ||
				enemyPiecePosition.fromUpAndRight[0].length ||
				enemyPiecePosition.fromDownAndRight[4].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (diagonalAttackingPieceTypes.includes(pieceOnSquare.getType())) {

						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn + 1));
						// mark in check
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[2].length === 0) || pieceProtectionBlocked.fromDown) &&
						((!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[0].length === 0) || pieceProtectionBlocked.fromLeft) &&
						((!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[0].length === 0) || pieceProtectionBlocked.fromDownAndLeft) &&
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow + 1, currentColumn + 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromUpAndRight[0].length) {
				// mark in enemyPiecePosition.fromUpAndRight[0]+ 1, currentColumn + 1));
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow + 1, currentColumn + 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[2].length === 0) &&
					(!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[0].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[0].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn + 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow + 1, currentColumn + 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// left edge from kings position
		if (this.verifyBounds(currentColumn - 1)) {
			pieceOnSquare = board.get(getPositionString(currentRow, currentColumn - 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDown = true;
				else
					pieceProtectionBlocked.fromDown = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUp = true;
				else
					pieceProtectionBlocked.fromUp = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromRight = true;
				else
					pieceProtectionBlocked.fromRight = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				if (this.getColor() === ColorTypes.white) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUpAndRight = true;
				else
					pieceProtectionBlocked.fromUpAndRight = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (this.getColor() === ColorTypes.black) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndRight = true;
				else
					pieceProtectionBlocked.fromDownAndRight = true;
			} 

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromDown || protectedByPieceInProximity.fromUp || protectedByPieceInProximity.fromRight || protectedByPieceInProximity.fromUpAndRight || protectedByPieceInProximity.fromDownAndRight)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow, currentColumn - 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow, currentColumn - 1, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromLeft[1].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromUpAndLeft[1].length ||
				enemyPiecePosition.fromDownAndLeft[3].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (linearAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn - 1));
						// mark in check
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[0].length === 0) || pieceProtectionBlocked.fromUp) && 
						((!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[0].length === 0) || pieceProtectionBlocked.fromDown) &&
						((!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[1].length === 0) || pieceProtectionBlocked.fromRight) &&
						((!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[1].length === 0) || pieceProtectionBlocked.fromUpAndRight) &&
						((!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[1].length === 0) || pieceProtectionBlocked.fromDownAndRight) && 
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow, currentColumn - 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow, currentColumn - 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromLeft[1].length) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromLeft[1]);

				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow, currentColumn - 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[0].length === 0) && 
					(!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[0].length === 0) &&
					(!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[1].length === 0) &&
					(!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[1].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[1].length === 0) && 
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow, currentColumn - 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow, currentColumn - 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// right edge from kings position
		if (this.verifyBounds(currentColumn + 1)) {
			pieceOnSquare = board.get(getPositionString(currentRow, currentColumn + 1));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDown = true;
				else
					pieceProtectionBlocked.fromDown = true;
			} 

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUp = true;
				else
					pieceProtectionBlocked.fromUp = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromLeft = true;
				else
					pieceProtectionBlocked.fromLeft = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				if (this.getColor() === ColorTypes.white) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUpAndLeft = true;
				else
					pieceProtectionBlocked.fromUpAndLeft = true;
			}
			
			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (this.getColor() === ColorTypes.black) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndLeft = true;
				else
					pieceProtectionBlocked.fromDownAndLeft = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromDown || protectedByPieceInProximity.fromUp || protectedByPieceInProximity.fromLeft || protectedByPieceInProximity.fromUpAndLeft || protectedByPieceInProximity.fromDownAndLeft)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow, currentColumn + 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow, currentColumn + 1, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow, currentColumn + 1, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromRight[1].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromUpAndRight[1].length ||
				enemyPiecePosition.fromDownAndRight[3].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (linearAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						// mark in check
						this.attackedFrom.push(getPositionString(currentRow, currentColumn + 1));
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[2].length === 0) || pieceProtectionBlocked.fromUp) &&
						((!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[2].length === 0) || pieceProtectionBlocked.fromDown) &&
						((!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[1].length === 0) || pieceProtectionBlocked.fromLeft) &&
						((!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[3].length === 0) || pieceProtectionBlocked.fromUpAndLeft) &&
						((!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[3].length === 0) || pieceProtectionBlocked.fromDownAndLeft) &&
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow, currentColumn + 1), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow, currentColumn + 1));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromRight[1].length) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromRight[1]);		
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow, currentColumn + 1));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[2].length === 0) &&
					(!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[2].length === 0) &&
					(!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[1].length === 0) &&
					(!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[3].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[3].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow, currentColumn + 1), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow, currentColumn + 1));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// bottom edge from kings position
		if (this.verifyBounds(currentRow - 1)) {
			pieceOnSquare = board.get(getPositionString(currentRow - 1, currentColumn));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];
			
			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromRight = true;
				else
					pieceProtectionBlocked.fromRight = true;
			}
			
			pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromLeft = true;
				else
					pieceProtectionBlocked.fromLeft = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUp = true;
				else
					pieceProtectionBlocked.fromUp = true;
			}


			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				if (this.getColor() === ColorTypes.white) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUpAndLeft = true;
				else
					pieceProtectionBlocked.fromUpAndLeft = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (this.getColor() === ColorTypes.white) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromUpAndRight = true;
				else
					pieceProtectionBlocked.fromUpAndRight = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromRight || protectedByPieceInProximity.fromLeft || protectedByPieceInProximity.fromUp || protectedByPieceInProximity.fromUpAndLeft || protectedByPieceInProximity.fromUpAndRight)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow - 1, currentColumn, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow - 1, currentColumn, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow - 1, currentColumn, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromDown[1].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromDownAndLeft[3].length ||
				enemyPiecePosition.fromDownAndRight[1].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (linearAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						// mark in check
						this.attackedFrom.push(getPositionString(currentRow - 1, currentColumn));
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[1].length === 0) || pieceProtectionBlocked.fromUp) && 
						((!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[2].length === 0) || pieceProtectionBlocked.fromLeft) && 
						((!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[2].length === 0) || pieceProtectionBlocked.fromRight) && 
						((!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[1].length === 0) || pieceProtectionBlocked.fromUpAndLeft) && 
						((!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[1].length === 0) || pieceProtectionBlocked.fromUpAndRight) && 
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow - 1, currentColumn));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromDown[1].length) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromDown[1]);
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow - 1, currentColumn));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromUp && enemyPiecePosition.fromUp[1].length === 0) &&
					(!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[2].length === 0) && 
					(!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[2].length === 0) && 
					(!protectedByPieceInProximity.fromUpAndLeft && enemyPiecePosition.fromUpAndLeft[1].length === 0) && 
					(!protectedByPieceInProximity.fromUpAndRight && enemyPiecePosition.fromUpAndRight[1].length === 0) && 
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow - 1, currentColumn), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow - 1, currentColumn));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		// top edge from kings position
		if (this.verifyBounds(currentRow + 1)) {
			pieceOnSquare = board.get(getPositionString(currentRow + 1, currentColumn));

			const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];
			const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];
			
			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromRight = true;
				else
					pieceProtectionBlocked.fromRight = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromLeft = true;
				else
					pieceProtectionBlocked.fromLeft = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				
				if (linearAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDown = true;
				else
					pieceProtectionBlocked.fromDown = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn - 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {
				if (this.getColor() === ColorTypes.black) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndLeft = true;
				else
					pieceProtectionBlocked.fromDownAndLeft = true;
			}

			pieceOnPosition = board.get(getPositionString(currentRow, currentColumn + 1));
			
			if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

				if (this.getColor() === ColorTypes.black) 
					diagonalAttackingPieceTypes.push(PieceTypes.pawn);
				
				if (diagonalAttackingPieceTypes.includes(pieceOnPosition.getType()))
					protectedByPieceInProximity.fromDownAndRight = true;
				else
					pieceProtectionBlocked.fromDownAndRight = true;
			}

			let protectedByPieceNotInProximity = false;
			if (!(protectedByPieceInProximity.fromRight || protectedByPieceInProximity.fromLeft || protectedByPieceInProximity.fromDown || protectedByPieceInProximity.fromDownAndLeft || protectedByPieceInProximity.fromDownAndRight)) {
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyPawn(currentRow + 1, currentColumn, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKnight(currentRow + 1, currentColumn, board)
				}
				if (!protectedByPieceNotInProximity) {
					protectedByPieceNotInProximity = this.checkForEnemyKing(currentRow + 1, currentColumn, board)
				}
			}

			attackedByEnemyRookOrQueen = (
				enemyPiecePosition.fromUp[1].length
			) > 0;

			attackedByEnemyBishopOrQueen = (
				enemyPiecePosition.fromUpAndLeft[3].length ||
				enemyPiecePosition.fromUpAndRight[3].length
			) > 0;

			isSquareAttackedFromDistance = (
				attackedByEnemyRookOrQueen ||
				attackedByEnemyBishopOrQueen
			);
 			
			if (pieceOnSquare) {
				
				// Enemy piece in kings proximity
				if (pieceOnSquare.getColor() !== this.getColor()) {
					
					// Enemy piece can check king
					if (linearAttackingPieceTypes.includes(pieceOnSquare.getType())) {
						this.attackedFrom.push(getPositionString(currentRow + 1, currentColumn));
						// mark in check
						if (this.isInCheck()) {
							this.markInDoubleCheck(true);
							// King has to move.
						} else {
							this.markInCheck(true);
						}
					}

					// Enemy piece is not protected by any piece in or out of proximity.
					if (
						((!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[1].length === 0) || pieceProtectionBlocked.fromDown) &&
						((!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[0].length === 0) || pieceProtectionBlocked.fromLeft) &&
						((!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[0].length === 0) || pieceProtectionBlocked.fromRight) &&
						((!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[3].length === 0) || pieceProtectionBlocked.fromDownAndLeft) &&
						((!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[3].length === 0) || pieceProtectionBlocked.fromDownAndRight) &&
						!protectedByPieceNotInProximity &&
						!isSquareAttackedFromDistance
					) {
						this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn), moveType: MoveTypes.capture });
					} else {
						// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
						impossibleMoves.push(getPositionString(currentRow + 1, currentColumn));
					}
				}

				// The else case of above is, an ally piece is on the square the king wants to move to. King cannot move to that square as it's occupied.
			
			} else if (enemyPiecePosition.fromUp[1].length) {
				// mark in check.
				this.attackedFrom.push(enemyPiecePosition.fromUp[1]);
				if (this.isInCheck()) {
					this.markInDoubleCheck(true);
					// King has to move.
				} else {
					this.markInCheck(true);
				}
				
				// king is attacked from said direction, hence cannot move here. 
				impossibleMoves.push(getPositionString(currentRow + 1, currentColumn));

				// handle case, to see if any ally piece can block.
			} else {
				if (
					(!protectedByPieceInProximity.fromDown && enemyPiecePosition.fromDown[1].length === 0) &&
					(!protectedByPieceInProximity.fromLeft && enemyPiecePosition.fromLeft[0].length === 0) &&
					(!protectedByPieceInProximity.fromRight && enemyPiecePosition.fromRight[0].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndLeft && enemyPiecePosition.fromDownAndLeft[3].length === 0) &&
					(!protectedByPieceInProximity.fromDownAndRight && enemyPiecePosition.fromDownAndRight[3].length === 0) &&
					!protectedByPieceNotInProximity &&
					!isSquareAttackedFromDistance
				) {
					this.legalMoves.push({ position: getPositionString(currentRow + 1, currentColumn), moveType: MoveTypes.advance });
				} else {
					// in this case, you cannot move to this block, store that. At the end, check where can you move those are legal moves, if you cannot move, check which piece can stop the attack, if none if you are in check, then it's mate, else stalemate.
					impossibleMoves.push(getPositionString(currentRow + 1, currentColumn));
				}
			}
		}

		protectedByPieceInProximity = resetInitialStates();
		pieceProtectionBlocked = resetInitialStates();

		return this.legalMoves;
	}

	getAllPossibleCheckInterferences(currentRow: number, currentColumn: number, board: BoardType, capture = false) {

		const attackedFrom = getPositionString(currentRow, currentColumn);
		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);

		let moveType = MoveTypes.advance;
		if (capture) {
			moveType = MoveTypes.capture;
		}

		const possibleCaptures: Partial<PieceType>[] = [];
		
		let moveUpBy = currentRow;
		let moveDownBy = currentRow;
		let moveRightBy = currentColumn;
		let moveLeftBy = currentColumn;

		const enemyPiecePosition: Record<any, string> = {
			fromLeft: '',
			fromRight: '',
			fromUp: '',
			fromDown: '',
			fromUpAndLeft: '',
			fromDownAndLeft: '',
			fromUpAndRight: '',
			fromDownAndRight: ''
		};

		const possibleLinearAttackingPieces = [ PieceTypes.rook, PieceTypes.queen ];
		const possibleDiagonalAttackingPieces = [ PieceTypes.bishop, PieceTypes.queen ];

		let steps = 0;

		while (steps <= maxDistanceFromEdge) {

			moveLeftBy--;
			moveRightBy++;
			moveUpBy++;
			moveDownBy--;

			if (!enemyPiecePosition.fromLeft.length) {
				enemyPiecePosition.fromLeft = this.getPossiblePositionOfAttacker(board, currentRow, moveLeftBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromRight.length) {
				enemyPiecePosition.fromRight = this.getPossiblePositionOfAttacker(board, currentRow, moveRightBy, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromDown.length) {
				enemyPiecePosition.fromDown = this.getPossiblePositionOfAttacker(board, moveDownBy, currentColumn, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromUp.length) {
				enemyPiecePosition.fromUp = this.getPossiblePositionOfAttacker(board, moveUpBy, currentColumn, possibleLinearAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndLeft.length) {
				const updatedPossibleDiagonalAttackingPieces = possibleDiagonalAttackingPieces;
				if (this.getColor() === ColorTypes.white) {
					if (steps === 0) {
						updatedPossibleDiagonalAttackingPieces.push(PieceTypes.pawn);
					}
				}
				enemyPiecePosition.fromUpAndLeft = this.getPossiblePositionOfAttacker(board, moveUpBy, moveLeftBy, updatedPossibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromUpAndRight.length) {
				const updatedPossibleDiagonalAttackingPieces = possibleDiagonalAttackingPieces;
				if (this.getColor() === ColorTypes.white) {
					if (steps === 0) {
						updatedPossibleDiagonalAttackingPieces.push(PieceTypes.pawn);
					}
				}
				enemyPiecePosition.fromUpAndRight = this.getPossiblePositionOfAttacker(board, moveUpBy, moveRightBy, updatedPossibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndLeft.length) {
				const updatedPossibleDiagonalAttackingPieces = possibleDiagonalAttackingPieces;
				if (this.getColor() === ColorTypes.black) {
					if (steps === 0) {
						updatedPossibleDiagonalAttackingPieces.push(PieceTypes.pawn);
					}
				}
				enemyPiecePosition.fromDownAndLeft = this.getPossiblePositionOfAttacker(board, moveDownBy, moveLeftBy, updatedPossibleDiagonalAttackingPieces);
			}

			if (!enemyPiecePosition.fromDownAndRight.length) {
				const updatedPossibleDiagonalAttackingPieces = possibleDiagonalAttackingPieces;
				if (this.getColor() === ColorTypes.black) {
					if (steps === 0) {
						updatedPossibleDiagonalAttackingPieces.push(PieceTypes.pawn);
					}
				}
				enemyPiecePosition.fromDownAndRight = this.getPossiblePositionOfAttacker(board, moveDownBy, moveRightBy, updatedPossibleDiagonalAttackingPieces);
			}

			steps++;
		}
		
		let pieceOnPosition: PieceType | undefined;

		for (const direction in enemyPiecePosition) {
			if (enemyPiecePosition[direction] !== 'NA' && enemyPiecePosition[direction] !== '') {
				pieceOnPosition = board.get(getPositionString(+enemyPiecePosition[direction][0], +enemyPiecePosition[direction][1]));
				if (pieceOnPosition) {
					// only add to possibleCaptures if piece is not pinned.
					possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
				}
			}
		}
		
		if (!possibleCaptures.length) {
			// knight capture logic
			const possibleProtectionPieceTypes = [ PieceTypes.knight ];

			if (currentRow - 2 >= 0) {

				// Handling Backward Row Left Movement.
				if (currentColumn - 1 >= 0) {

					pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn - 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}


				// Handling Backward Row Right Movement.
				if (currentColumn + 1 <= 7) {

					pieceOnPosition = board.get(getPositionString(currentRow - 2, currentColumn + 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}

			}

			// Handling Upward Row Movement.
			if (currentRow + 2 <= 7) {

				// Handling Upward Row Left Movement.
				if (currentColumn - 1 >= 0) {

					pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn - 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}


				// Handling Upward Row Right Movement.
				if (currentColumn + 1 <= 7) {

					pieceOnPosition = board.get(getPositionString(currentRow + 2, currentColumn + 1));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}

			}

			// Handling Left Column Movement.
			if (currentColumn - 2 >= 0) {

				// Handling Left Column Downward Movement.
				if (currentRow - 1 >= 0) {

					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn - 2));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}


				// Handling Left Column Upward Movement.
				if (currentRow + 1 <= 7) {

					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn - 2));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}

			}

			// Handling Right Column Movement.
			if (currentColumn + 2 <= 7) {

				// Handling Right Column Upward Movement.
				if (currentRow - 1 >= 0) {

					pieceOnPosition = board.get(getPositionString(currentRow - 1, currentColumn + 2));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}

				// Handling Right Column Downward Movement.
				if (currentRow + 1 <= 7) {

					pieceOnPosition = board.get(getPositionString(currentRow + 1, currentColumn + 2));
					
					if (
						pieceOnPosition &&
						pieceOnPosition.getColor() !== this.getColor() &&
						possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
					) {
						possibleCaptures.push({ currentPosition: pieceOnPosition.getCurrentPosition(), legalMoves: [{ position: attackedFrom, moveType: moveType }] });
					}
				}

			}
		}
		
		return possibleCaptures;
	}

	handleCheckInterferences(board: BoardType) {

		const possibleCheckInterferences: Partial<PieceType>[] = [];
		const attackingPiecePosition = this.attackedFrom;

		if (attackingPiecePosition.length === 2) return [];

		for (const attackedFrom of this.attackedFrom) {

			const currentRow = +attackedFrom[0];
			const currentColumn = +attackedFrom[1];

			const kingsCurrentPosition = this.getCurrentPosition();
			const kingsCurrentRow = +kingsCurrentPosition[0];
			const kingsCurrentColumn = +kingsCurrentPosition[1];

			const enemyPieceAtAttackingPosition = board.get(getPositionString(currentRow, currentColumn));

			if (enemyPieceAtAttackingPosition) {
				possibleCheckInterferences.push(...this.getAllPossibleCheckInterferences(currentRow, currentColumn, board, true));
						
				const pieceType = enemyPieceAtAttackingPosition.getType();
				
				// logic to check for piece blocking attackers path.

				if ([ PieceTypes.bishop, PieceTypes.rook, PieceTypes.queen ].includes(pieceType)) {
					
					let row = currentRow;
					let column = currentColumn;
					
					while (true) {
						if (currentRow < kingsCurrentRow) {
							row++;
						} else if (currentRow > kingsCurrentRow) {
							row--;
						}
						
						if (currentColumn < kingsCurrentColumn) {
							column++;
						} else if (currentColumn > kingsCurrentColumn) {
							column--;
						}
									
						if (row !== kingsCurrentRow || column !== kingsCurrentColumn) {
							possibleCheckInterferences.push(...this.getAllPossibleCheckInterferences(row, column, board));
						} else {
							break;
						}
					}
				
				}

			}
		}
		return possibleCheckInterferences;
	}

}

class King extends KingUtils {

	getLegalMoves(board: BoardType) {
		const currentRow = +this.currentPosition[0];

		this.legalMoves = this.checkForEnemyPieces(board);

		// Check if Castling is possible.
		const canCastle = this.canCastle(board);
		if (canCastle.kingSide)
			this.legalMoves.push({ position: getPositionString(currentRow, 7), moveType: MoveTypes.castle });

		if (canCastle.queenSide)
			this.legalMoves.push({ position: getPositionString(currentRow, 0), moveType: MoveTypes.castle });

		if (!this.legalMoves.length && this.inCheck) {

			// checkmated
		}

		return this.legalMoves;
	}

	// This function overrides the current position of the piece with the updated position.
	makeMove(board: ChessBoard, updatedPosition: string) {
		this.moveToPosition(board, updatedPosition);
	}

	//To Do: Check if any opposing piece's attack path lies in between the king and rook.
	canCastle(board: BoardType) {
		if (this.moveCounter > 0 || this.inCheck || this.castled) {
			return {
				kingSide: false,
				queenSide: false
			};
		}

		const currentRow = +this.currentPosition[0];
		const currentColumn = +this.currentPosition[1];

		let kingSide = true;

		// Checks if there a piece on the queen's square, if there is then queen side castling is not possible.
		let queenSide = board.has(getPositionString(currentRow, currentColumn - 1));

		let kingSideColumn = currentColumn + 1;
		let queenSideColumn = currentColumn - 2;

		while (true) {

			if ((kingSideColumn > 7 && queenSideColumn < 0) || !(kingSide || queenSide)) break;

			if (kingSide && kingSideColumn <= 7) {
				if (board.get(getPositionString(currentRow, kingSideColumn))) {
					kingSide = false;
				} 
				// else if (
				// 	// check for enemy pawn
				// 	// check for enemy knight
				// 	// check for enemy bishop
				// 	// check for enemy rook
				// 	// check for enemy queen
				// 	// check for enemy king
				// ) {
				// 	if (kingSideColumn !== 3 && kingSideColumn !== 5) {
				// 		kingSide = false;
				// 	} else if (
				// 		this.checkForEnemyKnight(currentRow, kingSideColumn, board) ||
				// 	) {
				// 		kingSide = false;
				// 	}
				// }
			}
			
			if (queenSide && queenSideColumn >= 0) {
				if (board.get(getPositionString(currentRow, queenSideColumn))) {
					queenSide = false;
				} 
				// else if (
				// 	// check for enemy pawn
				// 	// check for enemy knight
				// 	// check for enemy bishop
				// 	// check for enemy rook
				// 	// check for enemy queen
				// 	// check for enemy king
				// ) {
				// 	queenSide = false;
				// }
			}

			kingSideColumn++;
			queenSideColumn--;

		}

		if (kingSide) {
			const kingSidePiece = board.get(getPositionString(currentRow, 7));
			if (
				kingSidePiece &&
				!(kingSidePiece instanceof King) &&
				!(kingSidePiece.getType() === PieceTypes.rook && kingSidePiece.getColor() === this.getColor() && kingSidePiece.getMoveCounter() === 0)
			)
				kingSide = false;

		}

		if (queenSide) {
			const queenSidePiece = board.get(getPositionString(currentRow, 0));
			if (
				queenSidePiece &&
				!(queenSidePiece instanceof King) &&
				!(queenSidePiece.getType() === PieceTypes.rook && queenSidePiece.getColor() === this.getColor() && queenSidePiece.getMoveCounter() === 0)
			)
				queenSide = false;

		}

		return {
			kingSide,
			queenSide
		};
	}

	performCastling(chessBoard: ChessBoard, updatedPosition: string) {

		const currentRow = +updatedPosition[0];
		const currentColumn = +updatedPosition[1];
		const castleKingSide = currentColumn === 7;
		const rook = chessBoard.getBoard().get(updatedPosition);

		if (!rook) throw new Error('Rook not found during castling.');
		
		if (castleKingSide) {
			rook.makeMove(chessBoard, getPositionString(currentRow, 5));
			this.makeMove(chessBoard, getPositionString(currentRow, 6));
		} else {
			rook.makeMove(chessBoard, getPositionString(currentRow, 3));
			this.makeMove(chessBoard, getPositionString(currentRow, 2));
		}
		this.castled = true;
	}

}

export {
	Pawn,
	Rook,
	Knight,
	Bishop,
	Queen,
	King
};