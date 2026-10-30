// EDF "Tarif Bleu" regulated price, Base option, 6 kVA, taxes included.
// Approximate values: update them when the regulated price changes.
export const PRICE_PER_KWH_EUR = 0.2016;
export const MONTHLY_SUBSCRIPTION_EUR = 15.65;

// Estimated bill for one month of consumption
export function monthlyCost(kwh: number) {
  return kwh * PRICE_PER_KWH_EUR + MONTHLY_SUBSCRIPTION_EUR;
}

const euroFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

// 1234.5 -> "€1,234.50"
export function formatEuro(value: number) {
  return euroFormat.format(value);
}
