// Shared carbon reference data used by the Carbon Impact Simulator

// Default carbon intensity library (kg CO2e per kg ingredient)
export const CARBON_LIBRARY = {
  'palm oil': 3.5, 'sodium lauryl sulfate': 2.8, 'mineral oil': 1.1,
  'glycerin': 1.6, 'ethanol': 1.3, 'water': 0.001, 'fragrance': 4.2,
  'parabens': 3.1, 'titanium dioxide': 5.7, 'dimethicone': 3.9,
  'petroleum jelly': 1.4, 'propylene glycol': 2.6, 'citric acid': 1.9,
  'sodium hydroxide': 0.9, 'hydrogen peroxide': 1.2,
};

export const MARKETS = [
  { id: 'eu', name: 'EU', ets: true, cbam: true },
  { id: 'uk', name: 'UK', ets: true, cbam: false },
  { id: 'canada', name: 'Canada', ets: false, cbam: false },
  { id: 'usa_california', name: 'USA (CA)', ets: true, cbam: false },
  { id: 'australia', name: 'Australia', ets: false, cbam: false },
];

let idCounter = 0;
export const newIngredient = (name = '', quantity_kg = 1, carbon_intensity = 1) => ({
  id: ++idCounter,
  name,
  quantity_kg,
  carbon_intensity,
  category: '',
});