import { getCategoryVisual } from '../utils/budgetMath.js';
import { getHeroState, getSegments } from '../utils/dashboard.js';

const row = (key, spent, target) => ({
  key,
  spentAmount: spent,
  targetAmount: target,
  visual: getCategoryVisual(key, spent, target),
});
const totals = { income: 9700, expenses: 7350, target: 7950, balance: 2350 };

describe('dashboard hero card', () => {
  test('total view shows overall income', () => {
    const hero = getHeroState(null, totals);
    expect(hero.mode).toBe('total');
    expect(hero.isOver).toBe(false);
    expect(hero.primaryValue).toBe(9700);
  });

  test('normal category shows Balance', () => {
    const hero = getHeroState(row('rent', 1000, 3500), totals);
    expect(hero.primaryLabel).toBe('Balance');
    expect(hero.primaryValue).toBe(2500);
    expect(hero.isOver).toBe(false);
    expect(hero.showProgress).toBe(true);
  });

  test('over-budget category switches to the orange Over state', () => {
    const hero = getHeroState(row('transport', 1350, 1200), totals);
    expect(hero.isOver).toBe(true);
    expect(hero.primaryLabel).toBe('Over');
    expect(hero.primaryValue).toBe(150);
    expect(hero.showProgress).toBe(false);
  });

  test('savings past its target is a win, never Over', () => {
    const hero = getHeroState(row('savings', 800, 500), totals);
    expect(hero.isOver).toBe(false);
    expect(hero.primaryLabel).toBe('Extra saved');
    expect(hero.primaryValue).toBe(300);
  });

  test('savings past its target lights up as a celebration, and only savings does', () => {
    const win = getHeroState(row('savings', 800, 500), totals);
    expect(win.isCelebrating).toBe(true);
    expect(win.motivationKind).toBe('savingsOver');
    expect(getHeroState(row('savings', 300, 500), totals).isCelebrating).toBe(false);
    expect(getHeroState(row('savings', 500, 500), totals).isCelebrating).toBe(false);
    expect(getHeroState(row('transport', 1350, 1200), totals).isCelebrating).toBe(false);
    expect(getHeroState(null, totals).isCelebrating).toBe(false);
  });

  test('progress has five segments filled by band', () => {
    expect(getSegments(0)).toHaveLength(5);
    expect(getSegments(0.5).filter((s) => s.filled)).toHaveLength(3);
    expect(getSegments(1).filter((s) => s.filled)).toHaveLength(5);
  });
});
