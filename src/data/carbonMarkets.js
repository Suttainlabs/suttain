// Deterministic carbon pricing data for the Carbon Tax Simulator.
// Prices are in USD per tonne CO2e, sourced from ICAP, World Bank Carbon
// Pricing Dashboard, and Trading Economics data (mid-2025 to 2026 ranges).
// Low/base/high represent realistic price bands for scenario modelling.
// CBAM phase-in: EU definitive regime starts Jan 2026 at 2.5% and ramps to
// 100% by 2034. CBAM currently covers cement, iron/steel, aluminium,
// fertilisers, electricity, and hydrogen. Chemicals/plastics expected by
// end of decade, so for cosmetics/cleaning manufacturers the exposure is
// shown as forward-looking/informational.

export const CARBON_MARKETS = [
  {
    id: 'eu',
    name: 'EU',
    regulation_name: 'EU Emissions Trading System (EU ETS) + CBAM',
    price_low: 75,
    price_base: 89,
    price_high: 105,
    ets: true,
    cbam: true,
    cbam_phase_in_pct: 2.5,
    currency: 'USD',
    note: 'EU ETS is the largest carbon market. CBAM definitive regime begins January 2026, phasing in at 2.5% and reaching 100% by 2034.',
    cbam_sectors: ['Cement', 'Iron and steel', 'Aluminium', 'Fertilisers', 'Electricity', 'Hydrogen'],
  },
  {
    id: 'uk',
    name: 'UK',
    regulation_name: 'UK Emissions Trading System (UK ETS)',
    price_low: 45,
    price_base: 59,
    price_high: 70,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'UK ETS operates independently post-Brexit, covering power, industry, and aviation sectors.',
  },
  {
    id: 'canada',
    name: 'Canada',
    regulation_name: 'Canada Federal Carbon Pollution Pricing',
    price_low: 50,
    price_base: 68,
    price_high: 95,
    ets: false,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'Federal benchmark at CAD $95/tonne in 2026 (approx. USD $68), rising annually by CAD $15 through 2030.',
  },
  {
    id: 'usa_california',
    name: 'USA (CA)',
    regulation_name: 'California Cap-and-Trade Program',
    price_low: 28,
    price_base: 33,
    price_high: 40,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'California cap-and-trade linked with Quebec. Covers power, industrial, and fuel sectors.',
  },
  {
    id: 'australia',
    name: 'Australia',
    regulation_name: 'Australia Safeguard Mechanism',
    price_low: 15,
    price_base: 18,
    price_high: 25,
    ets: false,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'Safeguard Mechanism applies to large industrial facilities. Carbon leakage review underway for potential future border measure.',
  },
  {
    id: 'china',
    name: 'China',
    regulation_name: 'China National ETS',
    price_low: 10,
    price_base: 14,
    price_high: 18,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'World largest ETS by emissions covered. Currently limited to power sector, expanding to other industries.',
  },
  {
    id: 'south_korea',
    name: 'South Korea',
    regulation_name: 'Korea Emissions Trading Scheme (K-ETS)',
    price_low: 7,
    price_base: 9,
    price_high: 12,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'First nationwide ETS in East Asia. Covers power, industry, buildings, and waste sectors.',
  },
  {
    id: 'japan',
    name: 'Japan',
    regulation_name: 'Japan GX-ETS',
    price_low: 2,
    price_base: 3,
    price_high: 5,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'Green Transformation ETS launched in 2026. Voluntary phase initially, full mandatory participation expected by 2033.',
  },
  {
    id: 'new_zealand',
    name: 'New Zealand',
    regulation_name: 'New Zealand Emissions Trading Scheme (NZ ETS)',
    price_low: 30,
    price_base: 37,
    price_high: 45,
    ets: true,
    cbam: false,
    cbam_phase_in_pct: 0,
    currency: 'USD',
    note: 'NZ ETS covers forestry, energy, industry, and waste. One of the few schemes including agricultural emissions on the roadmap.',
  },
];

export const getMarketById = (id) => CARBON_MARKETS.find((m) => m.id === id);

// Compute deterministic per-market tax scenarios.
// annualCO2eTonnes is the total annual carbon emissions in tonnes.
// Returns an array of { ...market, low, base, high, cbam_exposure } in USD.
export function computeTaxScenarios(annualCO2eTonnes, selectedMarketIds) {
  return CARBON_MARKETS
    .filter((m) => selectedMarketIds.includes(m.id))
    .map((market) => {
      const low = annualCO2eTonnes * market.price_low;
      const base = annualCO2eTonnes * market.price_base;
      const high = annualCO2eTonnes * market.price_high;
      const cbam_exposure = market.cbam && market.cbam_phase_in_pct > 0
        ? annualCO2eTonnes * (market.cbam_phase_in_pct / 100) * market.price_base
        : 0;
      return { ...market, low, base, high, cbam_exposure };
    });
}