import { ColorTypes, PinDirections, PieceTypes, BoardType, PieceType, MoveTypes } from "../constants";
import { getPositionString } from "../helper/helper";
import { Piece } from "./helper";

export class Knight extends Piece {
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
				
				if (!pieceOnPosition)
					this.legalMoves.push({ position: getPositionString(row, col), moveType: MoveTypes.advance });
				else if (pieceOnPosition.getColor() !== this.getColor())
					this.legalMoves.push({ position: getPositionString(row, col), moveType: MoveTypes.capture });

			}
		}

		return this.legalMoves;
	}
}