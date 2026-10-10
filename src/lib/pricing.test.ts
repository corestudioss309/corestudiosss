import { describe, expect, it } from 'vitest';
import { getPaidPrices } from './pricing';

describe('getPaidPrices', () => {
  it('applies the site discount to setup and monthly fees', () => {
    const prices = getPaidPrices({
      setup_fee: 8000,
      monthly_fee: 2000,
      discount_enabled: true,
      discount_percent: 50,
    });

    expect(prices).toEqual({ setupFee: 4000, monthlyFee: 1000 });
  });

  it('uses the full setup and monthly fees when the discount is disabled', () => {
    const prices = getPaidPrices({
      setup_fee: 8000,
      monthly_fee: 2000,
      discount_enabled: false,
      discount_percent: 50,
    });

    expect(prices).toEqual({ setupFee: 8000, monthlyFee: 2000 });
  });
});
