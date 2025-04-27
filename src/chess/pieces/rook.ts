import { ColorTypes, PinDirections, PieceTypes, BoardType, PieceType, MoveTypes } from "../constants";
import { getPositionString } from "../helper/helper";
import { Piece } from "./helper";

export class Rook extends Piece {
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

		const pinnedDirection = this.getPinnedDirection(board);

		if (pinnedDirection !== null && [ PinDirections.fromDownAndLeft, PinDirections.fromDownAndRight, PinDirections.fromUpAndLeft, PinDirections.fromUpAndRight ].includes(pinnedDirection)) return this.legalMoves;

		let moveUpBy = currentRow;
		let moveDownBy = currentRow;
		let moveRightBy = currentColumn;
		let moveLeftBy = currentColumn;

		let moveUp = true;
		let moveDown = true;
		let moveLeft = true;
		let moveRight = true;
		
		let pieceOnPosition: PieceType | undefined;

		const maxDistanceFromEdge = Math.max(currentRow, 7 - currentRow, currentColumn, 7 - currentColumn);
		let steps = 0;

		const updateStates = (currentRow: number, currentColumn: number, pinnedDirections: PinDirections[]) => {
			if (
				(currentRow >= 0 && currentRow <= 7) &&
				(currentColumn >= 0 && currentColumn <= 7) &&
				(pinnedDirection === null || pinnedDirections.includes(pinnedDirection))
			) {
				pieceOnPosition = board.get(getPositionString(currentRow, currentColumn));
	
				if (!pieceOnPosition) {
					this.legalMoves.push({ position: getPositionString(currentRow, currentColumn), moveType: MoveTypes.advance });
					
					// No piece found, keep moving
					return true;
				} else if (pieceOnPosition.getColor() !== this.getColor()) {
					this.legalMoves.push({ position: getPositionString(currentRow, currentColumn), moveType: MoveTypes.capture });
	
					// Since an opposing piece is found, no more moves in this direction are possible.
					return false;
				} else {
	
					// Since a same color piece is found, no more moves in this direction are possible.
					return false;
				}
			}

			// since out of bounds or pinned, do not continue
			return false;
		}
		
		while (steps <= maxDistanceFromEdge) {
			
			moveUpBy++;
			moveDownBy--;
			moveRightBy++;
			moveLeftBy--;

			// Handling upward movement.
			if (moveUp) {
				moveUp = updateStates(moveUpBy, currentColumn, [ PinDirections.fromUp ]);
			}

			// Handling downward movement.
			if (moveDown) {
				moveDown = updateStates(moveDownBy, currentColumn, [ PinDirections.fromDown ]);
			}

			// Handling right sliding movement.
			if (moveRight) {
				moveRight = updateStates(currentRow, moveRightBy, [ PinDirections.fromRight ]);
			}

			// Handling left sliding movement.
			if (moveLeft) {
				moveLeft = updateStates(currentRow, moveLeftBy, [ PinDirections.fromLeft ]);
			}

			steps++;
		}

		return this.legalMoves;
	}
}