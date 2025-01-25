class Stack<T> {
	private stack: Array<T>;
	private maxSize: number;
	constructor(maxSize = 1000, data = new Array()) {
		this.stack = data;
		this.maxSize = maxSize;
	}

	push(data: T) {
		if (this.getSize() > this.maxSize) throw new Error('Overflow');

		this.stack.push(data);

		if (this.getSize() > 1)
			[ this.stack[0], this.stack[this.getSize() - 1] ] = [ this.stack[this.getSize() - 1], this.stack[0] ];

	}

	pop() {
		if (this.isEmpty()) return 'Underflow';
		return this.stack.shift();
	}

	isEmpty() {
		return this.getSize() == 0;
	}

	peek() {
		if (this.isEmpty()) return 'Underflow';
		return this.stack[0];
	}

	getSize() {
		return this.stack.length;
	}

}

export { Stack };