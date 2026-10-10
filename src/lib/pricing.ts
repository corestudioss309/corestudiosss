export interface SitePricing {
  setup_fee: number;
  monthly_fee: number;
  discount_enabled: boolean;
  discount_percent: number;
}

export const applySiteDiscount = (
  price: number,
  pricing: Pick<SitePricing, 'discount_enabled' | 'discount_percent'>,
) =>
  pricing.discount_enabled
    ? Math.round(price * (1 - pricing.discount_percent / 100))
    : price;

export const getPaidPrices = (pricing: SitePricing | null) => ({
  setupFee: pricing ? applySiteDiscount(pricing.setup_fee, pricing) : 0,
  monthlyFee: pricing ? applySiteDiscount(pricing.monthly_fee, pricing) : 0,
});
