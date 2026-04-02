test('leet', () => {
  const res = maxArea([]);
  expect(res).toBe(402471897);
});

function maxArea(height: number[]): number {
  let maxArea = 0;
  for (let i = 0; i < height.length; i++) {
    const outter = height[i];
    for (let j = i + 1; j < height.length; j++) {
      const inner = height[j];
      const lower = Math.min(outter, inner);
      const width = j - i;
      const area = lower * width;
      if (maxArea < area) {
        maxArea = area;
      }
    }
  }

  return maxArea;
}
