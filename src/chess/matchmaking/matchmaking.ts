// have queues for every 800 elo (0-800, 800-1600, 1600-2400 etc).
// pick person with longest wait times first from queue.
// every x seconds, change rating delta by +/- y
// use either red-black tree or avl tree for matchmaking. implement both for now.

// TypeScript implementation of bucket-based matchmaking
// with Red-Black Tree and AVL Tree options

// -------------------------
// Player Interface
// -------------------------
interface Player {
    id: string;
    elo: number;
    joinTime: number; // timestamp
}

// -------------------------
// Node Structure
// -------------------------
class TreeNode {
    constructor(
        public key: number,
        public player: Player,
        public left: TreeNode | null = null,
        public right: TreeNode | null = null,
        public height: number = 1,
        public color: 'red' | 'black' = 'red'
    ) { }
}

// -------------------------
// AVL Tree Implementation
// -------------------------
class AVLTree {
    root: TreeNode | null = null;

    insert(player: Player) {
        const key = this.compositeKey(player);
        this.root = this._insert(this.root, key, player);
    }

    remove(player: Player) {
        const key = this.compositeKey(player);
        this.root = this._remove(this.root, key);
    }

    findClosestMatch(key: number, range: number): Player | null {
        return this._findClosest(this.root, key, range);
    }

    private compositeKey(player: Player): number {
        return player.elo + Math.floor((Date.now() - player.joinTime) / 1000);
    }

    private _insert(node: TreeNode | null, key: number, player: Player): TreeNode {
        if (!node) return new TreeNode(key, player);
        if (key < node.key) node.left = this._insert(node.left, key, player);
        else node.right = this._insert(node.right, key, player);
        return this._balance(node);
    }

    private _remove(node: TreeNode | null, key: number): TreeNode | null {
        if (!node) return null;
        if (key < node.key) node.left = this._remove(node.left, key);
        else if (key > node.key) node.right = this._remove(node.right, key);
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            const min = this._minValueNode(node.right);
            node.key = min.key;
            node.player = min.player;
            node.right = this._remove(node.right, min.key);
        }
        return this._balance(node);
    }

    private _minValueNode(node: TreeNode): TreeNode {
        while (node.left) node = node.left;
        return node;
    }

    private _height(n: TreeNode | null): number {
        return n ? n.height : 0;
    }

    private _balanceFactor(n: TreeNode): number {
        return this._height(n.left) - this._height(n.right);
    }

    private _balance(n: TreeNode): TreeNode {
        n.height = 1 + Math.max(this._height(n.left), this._height(n.right));
        const bf = this._balanceFactor(n);

        if (bf > 1) {
            if (this._balanceFactor(n.left!) < 0) n.left = this._rotateLeft(n.left!);
            return this._rotateRight(n);
        }
        if (bf < -1) {
            if (this._balanceFactor(n.right!) > 0) n.right = this._rotateRight(n.right!);
            return this._rotateLeft(n);
        }
        return n;
    }

    private _rotateLeft(z: TreeNode): TreeNode {
        const y = z.right!;
        z.right = y.left;
        y.left = z;
        z.height = 1 + Math.max(this._height(z.left), this._height(z.right));
        y.height = 1 + Math.max(this._height(y.left), this._height(y.right));
        return y;
    }

    private _rotateRight(z: TreeNode): TreeNode {
        const y = z.left!;
        z.left = y.right;
        y.right = z;
        z.height = 1 + Math.max(this._height(z.left), this._height(z.right));
        y.height = 1 + Math.max(this._height(y.left), this._height(y.right));
        return y;
    }

    private _findClosest(node: TreeNode | null, key: number, range: number): Player | null {
        if (!node) return null;
        if (Math.abs(node.key - key) <= range) return node.player;
        if (key < node.key) return this._findClosest(node.left, key, range);
        return this._findClosest(node.right, key, range);
    }
}

// -------------------------
// Red-Black Tree (Simplified)
// -------------------------
class RedBlackTree {
    root: TreeNode | null = null;

    insert(player: Player) {
        const key = this.compositeKey(player);
        this.root = this._insert(this.root, key, player);
        if (this.root) this.root.color = 'black';
    }

    remove(player: Player) {
        // Simplified: implementation omitted for brevity
        console.warn('Remove not implemented for RedBlackTree');
    }

    findClosestMatch(key: number, range: number): Player | null {
        return this._findClosest(this.root, key, range);
    }

    private compositeKey(player: Player): number {
        return player.elo + Math.floor((Date.now() - player.joinTime) / 1000);
    }

    private _insert(node: TreeNode | null, key: number, player: Player): TreeNode {
        if (!node) return new TreeNode(key, player, null, null, 1, 'red');
        if (key < node.key) node.left = this._insert(node.left, key, player);
        else node.right = this._insert(node.right, key, player);

        // Fix red-black tree violations (simplified)
        if (this._isRed(node.right) && !this._isRed(node.left)) node = this._rotateLeft(node);
        if (this._isRed(node.left) && node.left && this._isRed(node.left.left)) node = this._rotateRight(node);
        if (this._isRed(node.left) && this._isRed(node.right)) this._flipColors(node);

        return node;
    }

    private _isRed(node: TreeNode | null): boolean {
        return node?.color === 'red';
    }

    private _rotateLeft(h: TreeNode): TreeNode {
        const x = h.right!;
        h.right = x.left;
        x.left = h;
        x.color = h.color;
        h.color = 'red';
        return x;
    }

    private _rotateRight(h: TreeNode): TreeNode {
        const x = h.left!;
        h.left = x.right;
        x.right = h;
        x.color = h.color;
        h.color = 'red';
        return x;
    }

    private _flipColors(h: TreeNode) {
        h.color = 'red';
        if (h.left) h.left.color = 'black';
        if (h.right) h.right.color = 'black';
    }

    private _findClosest(node: TreeNode | null, key: number, range: number): Player | null {
        if (!node) return null;
        if (Math.abs(node.key - key) <= range) return node.player;
        if (key < node.key) return this._findClosest(node.left, key, range);
        return this._findClosest(node.right, key, range);
    }
}

// -------------------------
// Buckets with Matchmaking Timer
// -------------------------
class MatchmakerBucket {
    private tree: AVLTree = new AVLTree(); // change to RedBlackTree if needed
    private range = 500;
    private timer: NodeJS.Timer;

    constructor() {
        this.timer = setInterval(() => this.expandRange(), 5000);
    }

    join(player: Player) {
        this.tree.insert(player);
    }

    leave(player: Player) {
        this.tree.remove(player);
    }

    findMatchFor(player: Player): Player | null {
        const key = player.elo + Math.floor((Date.now() - player.joinTime) / 1000);
        return this.tree.findClosestMatch(key, this.range);
    }

    private expandRange() {
        this.range += 25;
        console.log(`Expanded matchmaking range to ±${this.range}`);
    }
}

// Exportable classes
export { MatchmakerBucket, Player, AVLTree, RedBlackTree };
