import { getCategoryVisual } from '../utils/budgetMath';
import { getHeroForecast } from '../utils/dashboard';

const row = (key, spent, target) => ({ key, spentAmount: spent, targetAmount: target, visual: getCategoryVisual(key, spent, target) });
// 10 days into a 30 day cycle
const progress = { elapsed: 10, cycleLength: 30, daysLeft: 20 };

describe('hero card forecast', () => {
  test('warns when a category is on pace to pass its target', () => {
    const f = getHeroForecast([row('transport', 600, 1200)], progress, 'transport');
    // R60 a day, target hit after 10 more days, month ends at R1800
    expect(f).toEqual({ key: 'transport', daysUntilOver: 10, projectedOver: 600 });
  });

  test('total view picks the category heading furthest over', () => {
    const f = getHeroForecast([row('transport', 600, 1200), row('groceries', 1200, 1800)], progress, null);
    expect(f.key).toBe('groceries');
  });

  test('says nothing for a category that is on track', () => {
    expect(getHeroForecast([row('transport', 200, 1200)], progress, 'transport')).toBeNull();
  });

  test('says nothing for a category already over, which has its own orange state', () => {
    expect(getHeroForecast([row('transport', 1500, 1200)], progress, 'transport')).toBeNull();
  });

  test('says nothing for savings and nothing too early in the cycle', () => {
    expect(getHeroForecast([row('savings', 900, 500)], progress, 'savings')).toBeNull();
    expect(getHeroForecast([row('transport', 500, 1200)], { elapsed: 2, cycleLength: 30, daysLeft: 28 }, 'transport')).toBeNull();
  });

  test('only looks at the selected pill', () => {
    const rows = [row('transport', 200, 1200), row('groceries', 1200, 1800)];
    expect(getHeroForecast(rows, progress, 'transport')).toBeNull();
  });
});
