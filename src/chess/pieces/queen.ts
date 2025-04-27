import { ColorTypes, PinDirections, PieceTypes, BoardType, PieceType, MoveTypes } from "../constants";
import { getPositionString } from "../helper/helper";
import { Piece } from "./helper";

export class Queen extends Piece {
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

			moveRightBy++;
			moveDownBy--;
			moveLeftBy--;
			moveUpBy++;

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

			// Handling Down and Left sliding movement.
			if (moveDownAndLeft) {
				moveDownAndLeft = updateStates(moveDownBy, moveLeftBy, [ PinDirections.fromDownAndLeft ]);
			}

			// Handling Up and Right sliding movement.
			if (moveUpAndLeft) {
				moveUpAndLeft = updateStates(moveUpBy, moveLeftBy, [ PinDirections.fromUpAndLeft ]);
			}

			// Handling Down and Right sliding movement.
			if (moveDownAndRight) {
				moveDownAndRight = updateStates(moveDownBy, moveRightBy, [ PinDirections.fromDownAndRight ]);
			}

			// Handling Up and Left sliding movement.
			if (moveUpAndRight) {
				moveUpAndRight = updateStates(moveUpBy, moveRightBy, [ PinDirections.fromUpAndRight ]);
			}

			steps++;
		}

		return this.legalMoves;
	}
}