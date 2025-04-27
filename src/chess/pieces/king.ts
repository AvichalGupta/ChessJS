import { ChessBoard } from "../board";
import { BoardType, ColorTypes, DefaultDirectionStates, DirectionEnum, generateRandomPieceId, ILegalMoves, MoveTypes, PieceType, PieceTypes } from "../constants";
import { getPositionString, validatePosition } from "../helper/helper";

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
					pieceOnPosition.getColor() !== this.getColor() &&
					possibleProtectionPieceTypes.includes(pieceOnPosition.getType())
				) {
					if (storeAttackedFrom) {
						this.attackedFrom.push(getPositionString(row, col));
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
		const linearAttackingPieceTypes = [ PieceTypes.rook, PieceTypes.queen ];

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

		const updateStates = (
			pieceOnPosition: PieceType | undefined, 
			protectedByPieceInProximity:DefaultDirectionStates,
			pieceProtectionBlocked: DefaultDirectionStates,
			direction: DirectionEnum,
			includePawn = false,
		): {
			protectedByPieceInProximity: boolean,
			pieceProtectionBlocked: boolean
		} => {

			const tempObj = {
				protectedByPieceInProximity: false,
				pieceProtectionBlocked: false
			}

			if (!(direction in DirectionEnum)) throw new Error('Invalid Direction ' + direction);

			const checkDiagonalAttacker = [ DirectionEnum.fromDownAndLeft, DirectionEnum.fromDownAndRight, DirectionEnum.fromUpAndLeft, DirectionEnum.fromUpAndRight ].includes(direction);

			if (!(pieceProtectionBlocked[direction] || protectedByPieceInProximity[direction])) {
				if (pieceOnPosition && pieceOnPosition.getColor() !== this.getColor()) {

					const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];

					if (includePawn) {
						diagonalAttackingPieceTypes.push(PieceTypes.pawn);
					}
	
					const attackingPieceType = checkDiagonalAttacker ? diagonalAttackingPieceTypes : linearAttackingPieceTypes;
	
					if (attackingPieceType.includes(pieceOnPosition.getType())) {
						protectedByPieceInProximity[direction] = true;
					} else {
						pieceProtectionBlocked[direction] = true;
					}
				}
			}
			return tempObj;
		}
		
		let protectedByPieceInProximity = resetInitialStates();
		let pieceProtectionBlocked = resetInitialStates();
		let pieceOnSquare: PieceType | undefined;
		let attackedByEnemyRookOrQueen: boolean = false;
		let attackedByEnemyBishopOrQueen: boolean = false;
		let isSquareAttackedFromDistance: boolean = false;

		// bottom left corner.
		if (
			this.verifyBounds(currentRow - 1) &&
			this.verifyBounds(currentColumn - 1)
		) {
			pieceOnSquare = board.get(getPositionString(currentRow - 1, currentColumn - 1));

			const piecePositions = new Map([
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromUp, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn - 1), { direction: DirectionEnum.fromUp, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn), { direction: DirectionEnum.fromRight, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn + 1), { direction: DirectionEnum.fromRight, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn + 1), { direction: DirectionEnum.fromUpAndRight, includePawn: false }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

					const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];

					if (this.getColor() === ColorTypes.black) {
						diagonalAttackingPieceTypes.push(PieceTypes.pawn);
					}
					
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

			const piecePositions = new Map([
				[getPositionString(currentRow, currentColumn + 1), { direction: DirectionEnum.fromUp, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn + 1), { direction: DirectionEnum.fromUp, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn), { direction: DirectionEnum.fromLeft, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn - 1), { direction: DirectionEnum.fromLeft, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn - 1), { direction: DirectionEnum.fromUpAndLeft, includePawn: false }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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
					
					const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];

					if (this.getColor() === ColorTypes.black) {
						diagonalAttackingPieceTypes.push(PieceTypes.pawn);
					}

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

			const piecePositions = new Map([
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromDown, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn - 1), { direction: DirectionEnum.fromDown, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn), { direction: DirectionEnum.fromRight, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn + 1), { direction: DirectionEnum.fromRight, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn + 1), { direction: DirectionEnum.fromDownAndRight, includePawn: false }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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
					
					const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];

					if (this.getColor() === ColorTypes.white) {
						diagonalAttackingPieceTypes.push(PieceTypes.pawn);
					}
					
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

			const piecePositions = new Map([
				[getPositionString(currentRow, currentColumn + 1), { direction: DirectionEnum.fromDown, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn + 1), { direction: DirectionEnum.fromDown, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn), { direction: DirectionEnum.fromLeft, includePawn: false }],
				[getPositionString(currentRow + 1, currentColumn - 1), { direction: DirectionEnum.fromLeft, includePawn: false }],
				[getPositionString(currentRow - 1, currentColumn - 1), { direction: DirectionEnum.fromDownAndLeft, includePawn: false }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

					const diagonalAttackingPieceTypes = [ PieceTypes.bishop, PieceTypes.queen ];

					if (this.getColor() === ColorTypes.white) {
						diagonalAttackingPieceTypes.push(PieceTypes.pawn);
					}
					
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

			const piecePositions = new Map([
				[getPositionString(currentRow - 1, currentColumn - 1), { direction: DirectionEnum.fromDown, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn - 1), { direction: DirectionEnum.fromUp, includePawn: false}],
				[getPositionString(currentRow, currentColumn + 1), { direction: DirectionEnum.fromRight, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn), { direction: DirectionEnum.fromUpAndRight, includePawn: this.getColor() === ColorTypes.white }],
				[getPositionString(currentRow - 1, currentColumn), { direction: DirectionEnum.fromDownAndRight, includePawn: this.getColor() === ColorTypes.black }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

			const piecePositions = new Map([
				[getPositionString(currentRow - 1, currentColumn + 1), { direction: DirectionEnum.fromDown, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn + 1), { direction: DirectionEnum.fromUp, includePawn: false}],
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromLeft, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn), { direction: DirectionEnum.fromUpAndLeft, includePawn: this.getColor() === ColorTypes.white }],
				[getPositionString(currentRow - 1, currentColumn), { direction: DirectionEnum.fromDownAndLeft, includePawn: this.getColor() === ColorTypes.black }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

			const piecePositions = new Map([
				[getPositionString(currentRow - 1, currentColumn + 1), { direction: DirectionEnum.fromRight, includePawn: false}],
				[getPositionString(currentRow - 1, currentColumn - 1), { direction: DirectionEnum.fromLeft, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn), { direction: DirectionEnum.fromUp, includePawn: false}],
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromUpAndLeft, includePawn: this.getColor() === ColorTypes.white }],
				[getPositionString(currentRow, currentColumn + 1), { direction: DirectionEnum.fromUpAndRight, includePawn: this.getColor() === ColorTypes.white }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

			const piecePositions = new Map([
				[getPositionString(currentRow + 1, currentColumn + 1), { direction: DirectionEnum.fromRight, includePawn: false}],
				[getPositionString(currentRow + 1, currentColumn - 1), { direction: DirectionEnum.fromLeft, includePawn: false}],
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromDown, includePawn: false}],
				[getPositionString(currentRow, currentColumn - 1), { direction: DirectionEnum.fromDownAndLeft, includePawn: this.getColor() === ColorTypes.black }],
				[getPositionString(currentRow, currentColumn + 1), { direction: DirectionEnum.fromDownAndRight, includePawn: this.getColor() === ColorTypes.black }]
			])

			for (const [ position, actionObj ] of piecePositions.entries()) {
				pieceOnPosition = board.get(position);
				updateStates(pieceOnPosition, protectedByPieceInProximity, pieceProtectionBlocked, actionObj.direction, actionObj.includePawn);
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

export class King extends KingUtils {

	constructor(currentPosition: string, color: ColorTypes) {
		super(currentPosition, color, 0);
	}

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