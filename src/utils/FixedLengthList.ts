export class FixedLengthList<T> {
    private list: T[];
    private maxSize: number;

    constructor(maxSize: number) {
        this.list = [];
        this.maxSize = maxSize;
    }

    insert(item: T): void {
        if (this.list.length >= this.maxSize) {
            this.list.shift(); // remove the first item
        }
        this.list.push(item);
    }

    getList(): T[] {
        return this.list;
    }

    clear(): void {
        this.list = [];
    }

    length(): number {
        return this.list.length;
    }
}