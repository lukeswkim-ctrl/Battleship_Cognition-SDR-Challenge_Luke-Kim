export function getAIMove(previousAttacks: Set<number>): number {
  const available: number[] = [];
  for (let index = 0; index < 100; index++) {
    if (!previousAttacks.has(index)) {
      available.push(index);
    }
  }

  if (available.length === 0) {
    throw new Error('No moves available');
  }

  return available[Math.floor(Math.random() * available.length)];
}
