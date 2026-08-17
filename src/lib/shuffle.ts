/** Fisher–Yates shuffle (returns a new array). */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

/**
 * Shuffle 0..length-1 into a full cycle.
 * If `avoidFirst` is set, the first track of the new cycle will not match it
 * (so the last song of the previous cycle is not immediately repeated).
 */
export function shuffleCycle(length: number, avoidFirst?: number): number[] {
  if (length <= 0) return [];
  if (length === 1) return [0];

  let order = shuffleArray([...Array(length).keys()]);

  if (avoidFirst !== undefined && order[0] === avoidFirst) {
    const swapWith = order.findIndex((index) => index !== avoidFirst);
    if (swapWith > 0) {
      [order[0], order[swapWith]] = [order[swapWith], order[0]];
    }
  }

  return order;
}
