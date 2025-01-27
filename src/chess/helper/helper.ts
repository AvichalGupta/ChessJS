export function validatePosition(position: any): void {
    if (
        typeof position !== 'string' ||
        position.length !== 2 ||
        isNaN(Number(position[0])) ||
        isNaN(Number(position[1])) ||
        Number(position[0]) < 0 ||
        Number(position[0]) > 7 ||
        Number(position[1]) < 0 ||
        Number(position[1]) > 7
    ) throw new Error('Incorrect position format!');
}

export function getPositionString(row: number, column: number): string {
    return `${row}${column}`;
}