class MinHeap<T> {
  #data: T[] = [];
  #keyMap?: Map<number, T>;
  #compare: (a: T, b: T) => number;
  #keyFn?: (item: T) => number;

  constructor(compare: (a: T, b: T) => number, keyFn?: (item: T) => number) {
    this.#compare = compare;
    this.#keyFn = keyFn;
    if (keyFn) {
      this.#keyMap = new Map();
    }
  }

  #swap(i: number, j: number) {
    [this.#data[i], this.#data[j]] = [this.#data[j], this.#data[i]];
  }

  #bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.#compare(this.#data[index], this.#data[parent]) >= 0) break;
      this.#swap(index, parent);
      index = parent;
    }
  }

  #bubbleDown(index: number) {
    const n = this.#data.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < n && this.#compare(this.#data[left], this.#data[smallest]) < 0)
        smallest = left;
      if (
        right < n &&
        this.#compare(this.#data[right], this.#data[smallest]) < 0
      )
        smallest = right;

      if (smallest === index) break;
      this.#swap(index, smallest);
      index = smallest;
    }
  }

  push(item: T) {
    this.#data.push(item);
    this.#bubbleUp(this.#data.length - 1);
    if (this.#keyMap && this.#keyFn) {
      this.#keyMap.set(this.#keyFn(item), item);
    }
  }

  popMin(): T | undefined {
    if (this.#data.length === 0) return undefined;
    const min = this.#data[0];
    if (this.#keyMap && this.#keyFn) {
      this.#keyMap.delete(this.#keyFn(min));
    }
    const last = this.#data.pop();
    if (last !== undefined && this.#data.length > 0) {
      this.#data[0] = last;
      this.#bubbleDown(0);
    }
    return min;
  }

  peek(): T | undefined {
    return this.#data[0];
  }

  get(key: number): T | undefined {
    return this.#keyMap?.get(key);
  }

  get size() {
    return this.#data.length;
  }
}

export default MinHeap;
