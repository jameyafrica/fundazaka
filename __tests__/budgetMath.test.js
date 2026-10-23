import { getCategoryVisual, getProgressRatio } from '../utils/budgetMath.js';

const visual = (key, spent, target) => getCategoryVisual(key, spent, target);

describe('progress ratio', () => {
  test('is spent divided by target', () => {
    expect(getProgressRatio(250, 1000)).toBe(0.25);
  });

  test('is safe when the target is zero', () => {
    expect(getProgressRatio(0, 0)).toBe(0);
    expect(getProgressRatio(50, 0)).toBe(Infinity);
  });
});

describe('opacity tiers', () => {
  test('0% to 20% uses the 41% tier with a dark tint', () => {
    expect(visual('rent', 0, 1000).opacity).toBe(0.41);
    expect(visual('rent', 0, 1000).tint).toBe('#000000');
    expect(visual('rent', 200, 1000).opacity).toBe(0.41);
  });

  test('21% to 40% uses the 30% tier', () => {
    expect(visual('rent', 201, 1000).opacity).toBe(0.3);
    expect(visual('rent', 400, 1000).opacity).toBe(0.3);
  });

  test('41% to 60% uses the 45% tier', () => {
    expect(visual('rent', 500, 1000).opacity).toBe(0.45);
  });

  test('61% to 80% uses the 60% tier', () => {
    expect(visual('rent', 700, 1000).opacity).toBe(0.6);
  });

  test('81% to exactly 100% uses the 80% tier and is not over', () => {
    expect(visual('rent', 1000, 1000).opacity).toBe(0.8);
    expect(visual('rent', 1000, 1000).isOver).toBe(false);
  });
});

describe('over-budget state', () => {
  test('one cent past the target is over', () => {
    expect(visual('rent', 1000.01, 1000).isOver).toBe(true);
  });

  test('reports how much you went over', () => {
    const v = visual('transport', 1350, 1200);
    expect(v.variant).toBe('over');
    expect(v.overAmount).toBe(150);
    expect(v.remainingAmount).toBe(0);
  });

  test('any spend against a zero target is over', () => {
    expect(visual('rent', 50, 0).isOver).toBe(true);
  });
});

describe('savings exception', () => {
  test('savings never goes over, however much is saved', () => {
    const v = visual('savings', 5000, 1000);
    expect(v.isOver).toBe(false);
    expect(v.variant).toBe('savings');
    expect(v.overAmount).toBe(0);
  });

  test('savings stays at 80% opacity at every level', () => {
    expect(visual('savings', 0, 1000).opacity).toBe(0.8);
    expect(visual('savings', 500, 1000).opacity).toBe(0.8);
    expect(visual('savings', 5000, 1000).opacity).toBe(0.8);
  });
});
