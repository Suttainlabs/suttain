// Path-specific inputs. Shared fields (product type, description) live in the page and survive switching.
export const DEFAULT_INDIVIDUAL = { budget: 'low', sensitivities: '', scent: 'light', on_hand: '', equipment: 'kitchen' };
export const DEFAULT_BUSINESS = { batch_kg: 100, units_per_batch: 400, region: 'US', retail_price: 18, packaging_cost: 1.2, channel: 'direct' };

export const REGIONS = ['US', 'EU', 'UK', 'Canada'];

export const splitList = (text) => (text || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean);

// Regional checklist items: general obligations, not a determination that a product complies.
export const REGION_CHECKLIST = {
  US: ['Ingredient list in descending order of predominance (FDA 21 CFR 701.3)', 'Net quantity on principal display panel', 'Facility registration and product listing (MoCRA)', 'Adverse event record keeping (MoCRA)', 'Safety substantiation file'],
  EU: ['INCI ingredient list on packaging', 'Responsible person in the EU named on label', 'Cosmetic product safety report (CPSR)', 'Product information file (PIF)', 'CPNP notification before market placement', 'Declare listed fragrance allergens above threshold'],
  UK: ['UK responsible person named on label', 'SCPN notification', 'Product information file and safety report', 'INCI ingredient list'],
  Canada: ['Cosmetic Notification Form within 10 days of sale', 'Bilingual labelling (English and French)', 'INCI ingredient list', 'Check the Cosmetic Ingredient Hotlist'],
};

export const QC_CHECKS = ['Appearance and colour match standard', 'Odour matches standard', 'pH within specification', 'Viscosity within specification', 'Weight or fill volume check', 'Microbial test sample retained', 'Retain sample labelled and stored'];

export const HOME_EQUIPMENT = {
  kitchen: ['Digital kitchen scale (0.1 g)', 'Heat-safe glass bowls', 'Silicone spatula and whisk', 'Clean jars or bottles', 'Gloves'],
  basic_lab: ['Digital scale (0.01 g)', 'Glass beakers', 'Thermometer', 'pH strips', 'Stick blender', 'Gloves and eye protection'],
};