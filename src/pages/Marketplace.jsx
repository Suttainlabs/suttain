import React, { useState, useContext, useRef } from 'react';
import AuthContext from '@/components/auth/AuthContext';
import AuthGate from '@/components/auth/AuthGate';
import { Search, CheckCircle2, Filter, Building2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CERTIFICATIONS = ['All', 'COSMOS', 'EcoCert', 'USDA Organic', 'ISO', 'Vegan', 'Fair Trade'];
const CATEGORIES = ['All', 'Surfactants', 'Emollients', 'Preservatives', 'Fragrances', 'Emulsifiers', 'Humectants', 'Antioxidants', 'Chelating Agents', 'pH Adjusters', 'Colorants', 'Thickeners', 'Vitamins'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ALL_INGREDIENTS = [
  // A
  { id: 1,  name: 'Aloe Vera Extract',            supplier: 'NaturaSource Co',      category: 'Emollients',       safety: 97, sustain: 93, certs: ['COSMOS','USDA Organic','Vegan'], price: '$8–$14/kg',   avail: 'in_stock',  desc: 'Soothing gel extract from aloe leaves. Rich in polysaccharides and vitamins.',          verified: true  },
  { id: 2,  name: 'Argan Oil (Cold Pressed)',      supplier: 'MorocChem Ltd',        category: 'Emollients',       safety: 99, sustain: 88, certs: ['COSMOS','EcoCert'],             price: '$45–$60/kg',  avail: 'in_stock',  desc: 'Premium cold-pressed Moroccan argan oil. Rich in oleic and linoleic fatty acids.',    verified: true  },
  { id: 3,  name: 'Allantoin',                     supplier: 'BioActives GmbH',      category: 'Emollients',       safety: 96, sustain: 84, certs: ['ISO'],                           price: '$30–$40/kg',  avail: 'in_stock',  desc: 'Skin-soothing active promoting cell renewal. Widely used in sensitive skin care.',     verified: true  },
  { id: 4,  name: 'Ascorbic Acid (Vitamin C)',     supplier: 'PureVit Ingredients',  category: 'Antioxidants',     safety: 95, sustain: 80, certs: ['USDA Organic','Vegan'],           price: '$22–$32/kg',  avail: 'in_stock',  desc: 'Potent antioxidant and brightening active. Stabilised form for cosmetic use.',        verified: true  },
  { id: 5,  name: 'Avocado Oil',                   supplier: 'GreenExtract Labs',    category: 'Emollients',       safety: 98, sustain: 85, certs: ['COSMOS','Vegan'],                price: '$18–$28/kg',  avail: 'in_stock',  desc: 'Rich in vitamins A, D, and E. Excellent for dry and mature skin formulations.',       verified: true  },
  // B
  { id: 6,  name: 'Benzyl Alcohol',                supplier: 'SafeChem Europe',      category: 'Preservatives',    safety: 76, sustain: 70, certs: ['ISO'],                           price: '$20–$26/kg',  avail: 'in_stock',  desc: 'Multifunctional preservative and solvent. Effective against bacteria and fungi.',     verified: false },
  { id: 7,  name: 'Behentrimonium Methosulfate',   supplier: 'HairChem Solutions',   category: 'Emulsifiers',      safety: 88, sustain: 79, certs: ['COSMOS'],                        price: '$35–$45/kg',  avail: 'in_stock',  desc: 'Mild conditioning emulsifier derived from rapeseed. Key in hair care.',              verified: true  },
  { id: 8,  name: 'Beeswax (Organic)',             supplier: 'EcoHive Naturals',     category: 'Emulsifiers',      safety: 99, sustain: 91, certs: ['USDA Organic','EcoCert'],        price: '$12–$18/kg',  avail: 'in_stock',  desc: 'Natural wax providing emollient and occlusive properties. Solid at room temperature.',verified: true  },
  { id: 9,  name: 'Betaine',                       supplier: 'SugarBio Ingredients', category: 'Humectants',       safety: 97, sustain: 92, certs: ['COSMOS','Vegan'],                price: '$16–$22/kg',  avail: 'in_stock',  desc: 'Natural osmolyte from sugar beet. Excellent moisturisation and anti-irritant.',      verified: true  },
  { id: 10, name: 'Bisabolol',                     supplier: 'FlowerChem GmbH',      category: 'Emollients',       safety: 95, sustain: 83, certs: ['COSMOS','EcoCert'],             price: '$80–$110/kg', avail: 'on_request',desc: 'Anti-inflammatory active from chamomile. Enhances skin penetration.',               verified: true  },
  // C
  { id: 11, name: 'Cocamidopropyl Betaine',        supplier: 'GreenChem Solutions',  category: 'Surfactants',      safety: 92, sustain: 88, certs: ['COSMOS','EcoCert'],             price: '$12–$18/kg',  avail: 'in_stock',  desc: 'Mild amphoteric surfactant derived from coconut oil. Excellent skin compatibility.',  verified: true  },
  { id: 12, name: 'Cetyl Alcohol',                 supplier: 'PalmFree Actives',     category: 'Emulsifiers',      safety: 93, sustain: 81, certs: ['COSMOS','Vegan'],                price: '$14–$20/kg',  avail: 'in_stock',  desc: 'Fatty alcohol providing creamy texture and emollient properties. Palm-free source.', verified: true  },
  { id: 13, name: 'Caprylyl Glycol',               supplier: 'BioActives GmbH',      category: 'Preservatives',    safety: 85, sustain: 78, certs: ['ISO','COSMOS'],                 price: '$40–$55/kg',  avail: 'in_stock',  desc: 'Multifunctional humectant and preservative booster. Skin feel enhancer.',           verified: true  },
  { id: 14, name: 'Carrageenan',                   supplier: 'OceanBio Extracts',    category: 'Thickeners',       safety: 91, sustain: 89, certs: ['USDA Organic','Vegan'],           price: '$22–$30/kg',  avail: 'in_stock',  desc: 'Seaweed-derived polysaccharide. Natural thickener and gelling agent.',              verified: true  },
  { id: 15, name: 'Citric Acid',                   supplier: 'AcidWorks Europe',     category: 'pH Adjusters',     safety: 94, sustain: 86, certs: ['COSMOS','USDA Organic','Vegan'], price: '$6–$10/kg',   avail: 'in_stock',  desc: 'Natural acid from citrus fermentation. pH adjuster and chelating agent.',           verified: true  },
  { id: 16, name: 'Chamomile Extract',             supplier: 'HerbalPure Labs',      category: 'Emollients',       safety: 96, sustain: 90, certs: ['COSMOS','EcoCert','Vegan'],      price: '$35–$50/kg',  avail: 'in_stock',  desc: 'Soothing botanical extract rich in bisabolol and apigenin.',                        verified: true  },
  // D
  { id: 17, name: 'Decyl Glucoside',               supplier: 'SugarSurf Co',         category: 'Surfactants',      safety: 95, sustain: 92, certs: ['COSMOS','EcoCert','Vegan'],      price: '$18–$25/kg',  avail: 'in_stock',  desc: 'Very mild sugar-based non-ionic surfactant. Suitable for baby and sensitive skin.', verified: true  },
  { id: 18, name: 'DMAE Bitartrate',               supplier: 'NeuroChem Actives',    category: 'Vitamins',         safety: 79, sustain: 72, certs: ['ISO'],                           price: '$55–$75/kg',  avail: 'on_request',desc: 'Skin-firming active. Precursor to acetylcholine. Used in anti-ageing formulations.',verified: false },
  // E
  { id: 19, name: 'Ethylhexylglycerin',            supplier: 'SafeChem Europe',      category: 'Preservatives',    safety: 87, sustain: 76, certs: ['COSMOS','ISO'],                  price: '$42–$58/kg',  avail: 'in_stock',  desc: 'Multifunctional ingredient. Effective preservative booster and skin conditioner.',  verified: true  },
  { id: 20, name: 'Evening Primrose Oil',          supplier: 'BotanicExt Ltd',       category: 'Emollients',       safety: 98, sustain: 87, certs: ['COSMOS','Vegan'],                price: '$28–$38/kg',  avail: 'in_stock',  desc: 'Rich in gamma-linolenic acid. Beneficial for dry and inflamed skin conditions.',    verified: true  },
  // F
  { id: 21, name: 'Fractionated Coconut Oil',      supplier: 'TropicNat Supplies',   category: 'Emollients',       safety: 97, sustain: 80, certs: ['COSMOS','EcoCert','Vegan'],      price: '$9–$14/kg',   avail: 'in_stock',  desc: 'Light, non-greasy carrier oil with excellent shelf stability.',                     verified: true  },
  { id: 22, name: 'Ferulic Acid',                  supplier: 'PureVit Ingredients',  category: 'Antioxidants',     safety: 93, sustain: 85, certs: ['COSMOS','Vegan'],                price: '$90–$120/kg', avail: 'on_request',desc: 'Potent plant-based antioxidant. Synergistic with vitamins C and E.',               verified: true  },
  // G
  { id: 23, name: 'Glycerin (Vegetable)',           supplier: 'PureSource Labs',      category: 'Humectants',       safety: 98, sustain: 85, certs: ['USDA Organic','Vegan'],           price: '$4–$8/kg',    avail: 'in_stock',  desc: 'Natural humectant from vegetable sources. USDA certified organic.',                 verified: true  },
  { id: 24, name: 'Green Tea Extract',             supplier: 'AsiaPlant Actives',    category: 'Antioxidants',     safety: 97, sustain: 91, certs: ['COSMOS','EcoCert','Vegan'],      price: '$40–$60/kg',  avail: 'in_stock',  desc: 'Rich in catechins and EGCG. Powerful antioxidant and anti-inflammatory agent.',     verified: true  },
  { id: 25, name: 'Glycolic Acid',                 supplier: 'AcidWorks Europe',     category: 'pH Adjusters',     safety: 80, sustain: 75, certs: ['ISO'],                           price: '$25–$35/kg',  avail: 'in_stock',  desc: 'Alpha-hydroxy acid for exfoliation. Improves skin texture and radiance.',           verified: true  },
  // H
  { id: 26, name: 'Hyaluronic Acid (HMW)',         supplier: 'BioPoly Ingredients',  category: 'Humectants',       safety: 99, sustain: 88, certs: ['COSMOS','Vegan'],                price: '$120–$180/kg',avail: 'in_stock',  desc: 'High molecular weight HA providing superior surface hydration and plumping.',      verified: true  },
  { id: 27, name: 'Hemp Seed Oil',                 supplier: 'GreenExtract Labs',    category: 'Emollients',       safety: 97, sustain: 93, certs: ['USDA Organic','Vegan'],           price: '$15–$22/kg',  avail: 'in_stock',  desc: 'Balanced omega-3/6 ratio. Non-comedogenic. Ideal for acne-prone skin.',            verified: true  },
  { id: 28, name: 'Hydroxyacetophenone',           supplier: 'BioActives GmbH',      category: 'Preservatives',    safety: 88, sustain: 77, certs: ['COSMOS','ISO'],                  price: '$65–$85/kg',  avail: 'in_stock',  desc: 'Natural-derived preservative booster and antioxidant. Broad-spectrum protection.', verified: true  },
  // I
  { id: 29, name: 'Inulin',                        supplier: 'ChicoryBio NL',        category: 'Humectants',       safety: 99, sustain: 95, certs: ['COSMOS','USDA Organic','Vegan'], price: '$18–$26/kg',  avail: 'in_stock',  desc: 'Prebiotic chicory-derived polysaccharide. Enhances skin microbiome balance.',       verified: true  },
  { id: 30, name: 'Isodecyl Oleate',               supplier: 'EsterChem Europe',     category: 'Emollients',       safety: 86, sustain: 74, certs: ['ISO'],                           price: '$30–$42/kg',  avail: 'on_request',desc: 'Synthetic ester providing luxurious skin feel without greasiness.',                verified: false },
  // J
  { id: 31, name: 'Jojoba Oil (Golden)',           supplier: 'DesertGold Naturals',  category: 'Emollients',       safety: 99, sustain: 90, certs: ['COSMOS','EcoCert','Vegan'],      price: '$20–$30/kg',  avail: 'in_stock',  desc: 'Liquid wax ester closely mimicking skin sebum. Exceptional shelf stability.',      verified: true  },
  // K
  { id: 32, name: 'Kaolin Clay',                   supplier: 'MineralPure Co',       category: 'Thickeners',       safety: 98, sustain: 88, certs: ['COSMOS','Vegan'],                price: '$5–$9/kg',    avail: 'in_stock',  desc: 'Fine white clay for absorption and mattifying effects. Ideal in masks and powders.',verified: true  },
  // L
  { id: 33, name: 'Lactic Acid',                   supplier: 'AcidWorks Europe',     category: 'pH Adjusters',     safety: 90, sustain: 88, certs: ['COSMOS','Vegan'],                price: '$8–$14/kg',   avail: 'in_stock',  desc: 'Gentle AHA naturally occurring in skin. Promotes exfoliation and moisturisation.',  verified: true  },
  { id: 34, name: 'Lavender Essential Oil',        supplier: 'ProvencePure Oils',    category: 'Fragrances',       safety: 85, sustain: 88, certs: ['COSMOS','EcoCert'],             price: '$35–$55/kg',  avail: 'in_stock',  desc: 'True lavender (Lavandula angustifolia). Calming fragrance and antiseptic properties.',verified: true  },
  { id: 35, name: 'Leuconostoc Ferment Filtrate',  supplier: 'FermentBio Labs',      category: 'Preservatives',    safety: 94, sustain: 89, certs: ['COSMOS','Vegan'],                price: '$70–$95/kg',  avail: 'on_request',desc: 'Bio-fermentation-derived preservative. Natural alternative to synthetic preservatives.',verified: true  },
  // M
  { id: 36, name: 'Magnesium Ascorbyl Phosphate',  supplier: 'PureVit Ingredients',  category: 'Vitamins',         safety: 94, sustain: 82, certs: ['ISO','COSMOS'],                  price: '$55–$80/kg',  avail: 'in_stock',  desc: 'Stable vitamin C derivative. Brightening and antioxidant with good skin tolerance.', verified: true  },
  { id: 37, name: 'Meadowfoam Seed Oil',           supplier: 'BotanicExt Ltd',       category: 'Emollients',       safety: 98, sustain: 91, certs: ['COSMOS','Vegan'],                price: '$22–$32/kg',  avail: 'in_stock',  desc: 'Highly stable oil from Limnanthes alba. Long shelf life and excellent emolliency.',  verified: true  },
  // N
  { id: 38, name: 'Niacinamide (Vitamin B3)',      supplier: 'PureVit Ingredients',  category: 'Vitamins',         safety: 95, sustain: 83, certs: ['COSMOS','Vegan','ISO'],           price: '$30–$45/kg',  avail: 'in_stock',  desc: 'Multifunctional vitamin. Reduces pores, brightens, and strengthens the skin barrier.',verified: true  },
  // O
  { id: 39, name: 'Olive Squalane',                supplier: 'MedOil Actives',       category: 'Emollients',       safety: 99, sustain: 90, certs: ['COSMOS','EcoCert','Vegan'],      price: '$28–$40/kg',  avail: 'in_stock',  desc: '100% olive-derived squalane. Lightweight, non-comedogenic moisturiser.',           verified: true  },
  { id: 40, name: 'Oat Kernel Extract',            supplier: 'GrainActives NL',      category: 'Emollients',       safety: 98, sustain: 92, certs: ['COSMOS','Vegan'],                price: '$35–$50/kg',  avail: 'in_stock',  desc: 'Rich in beta-glucan. Soothing, anti-itch and barrier-strengthening properties.',    verified: true  },
  // P
  { id: 41, name: 'Panthenol (Pro-Vitamin B5)',    supplier: 'PureVit Ingredients',  category: 'Vitamins',         safety: 96, sustain: 84, certs: ['COSMOS','Vegan'],                price: '$25–$38/kg',  avail: 'in_stock',  desc: 'Penetrating moisturiser converting to pantothenic acid in skin. Anti-inflammatory.',verified: true  },
  { id: 42, name: 'Phenoxyethanol',                supplier: 'SafeChem Europe',      category: 'Preservatives',    safety: 78, sustain: 72, certs: ['ISO'],                           price: '$28–$35/kg',  avail: 'on_request',desc: 'Broad-spectrum preservative effective at low concentrations. EU-approved at 1%.',   verified: false },
  { id: 43, name: 'Pomegranate Seed Oil',          supplier: 'FruitActives Global',  category: 'Emollients',       safety: 97, sustain: 86, certs: ['COSMOS','Vegan'],                price: '$65–$90/kg',  avail: 'in_stock',  desc: 'Rich in punicic acid (conjugated linolenic acid). Powerful antioxidant carrier.', verified: true  },
  // Q
  { id: 44, name: 'Quercetin',                     supplier: 'FlavorChem Actives',   category: 'Antioxidants',     safety: 93, sustain: 87, certs: ['COSMOS','Vegan'],                price: '$80–$110/kg', avail: 'on_request',desc: 'Flavonoid antioxidant from plant sources. Anti-inflammatory and UV-protective.',    verified: true  },
  // R
  { id: 45, name: 'Resveratrol',                   supplier: 'VinoActives France',   category: 'Antioxidants',     safety: 94, sustain: 88, certs: ['COSMOS','Vegan'],                price: '$200–$280/kg',avail: 'on_request',desc: 'Polyphenol from grape skin. Potent antioxidant with anti-ageing properties.',      verified: true  },
  { id: 46, name: 'Rosehip Seed Oil',              supplier: 'AndesBotanics',        category: 'Emollients',       safety: 97, sustain: 91, certs: ['COSMOS','EcoCert','Vegan'],      price: '$30–$45/kg',  avail: 'in_stock',  desc: 'Rich in trans-retinoic acid and essential fatty acids. Regenerative skin oil.',   verified: true  },
  // S
  { id: 47, name: 'Sodium Cocoyl Isethionate',     supplier: 'EcoBio Ingredients',   category: 'Surfactants',      safety: 95, sustain: 91, certs: ['COSMOS','Vegan'],                price: '$22–$30/kg',  avail: 'in_stock',  desc: 'Ultra-mild coconut-derived surfactant. Ideal for solid bars and sensitive skin.',  verified: true  },
  { id: 48, name: 'Salicylic Acid',                supplier: 'AcidWorks Europe',     category: 'pH Adjusters',     safety: 82, sustain: 78, certs: ['ISO'],                           price: '$15–$22/kg',  avail: 'in_stock',  desc: 'BHA exfoliant. Oil-soluble penetration into pores. Acne and keratosis treatment.', verified: true  },
  { id: 49, name: 'Shea Butter (Unrefined)',       supplier: 'AfricaSource NL',      category: 'Emollients',       safety: 99, sustain: 93, certs: ['COSMOS','Fair Trade','Vegan'],   price: '$10–$16/kg',  avail: 'in_stock',  desc: 'Unrefined shea from West Africa. Fair trade certified. Rich in triterpenes.',    verified: true  },
  // T
  { id: 50, name: 'Tocopherol (Vitamin E)',        supplier: 'SunflowerActives',     category: 'Vitamins',         safety: 97, sustain: 89, certs: ['COSMOS','Vegan'],                price: '$35–$55/kg',  avail: 'in_stock',  desc: 'Natural mixed tocopherols from sunflower. Antioxidant and skin conditioning.',     verified: true  },
  { id: 51, name: 'Tea Tree Essential Oil',        supplier: 'AustraliaPure Oils',   category: 'Fragrances',       safety: 82, sustain: 85, certs: ['EcoCert'],                       price: '$28–$40/kg',  avail: 'in_stock',  desc: 'Natural antimicrobial and anti-fungal essential oil. Active in acne formulations.', verified: true  },
  // U
  { id: 52, name: 'Urea',                          supplier: 'BioChem Actives',      category: 'Humectants',       safety: 90, sustain: 81, certs: ['ISO','COSMOS'],                  price: '$12–$18/kg',  avail: 'in_stock',  desc: 'Natural moisturising factor component. Keratolytic at high concentrations.',        verified: true  },
  // V
  { id: 53, name: 'Vitamin C (Ascorbyl Glucoside)',supplier: 'PureVit Ingredients',  category: 'Vitamins',         safety: 94, sustain: 83, certs: ['COSMOS','Vegan'],                price: '$60–$85/kg',  avail: 'in_stock',  desc: 'Stable vitamin C glucoside. Gradual release brightening without irritation.',      verified: true  },
  // W
  { id: 54, name: 'Witch Hazel Extract',           supplier: 'HerbalPure Labs',      category: 'Emollients',       safety: 91, sustain: 87, certs: ['COSMOS','Vegan'],                price: '$18–$28/kg',  avail: 'in_stock',  desc: 'Astringent botanical extract. Pore-minimising and anti-inflammatory.',              verified: true  },
  // X
  { id: 55, name: 'Xanthan Gum',                  supplier: 'BioPoly Ingredients',  category: 'Emulsifiers',      safety: 96, sustain: 90, certs: ['USDA Organic','COSMOS'],         price: '$18–$25/kg',  avail: 'in_stock',  desc: 'Natural thickener and stabiliser derived from microbial fermentation.',            verified: true  },
  // Y
  { id: 56, name: 'Ylang Ylang Essential Oil',     supplier: 'TropicNat Supplies',   category: 'Fragrances',       safety: 80, sustain: 84, certs: ['COSMOS','EcoCert'],             price: '$55–$80/kg',  avail: 'on_request',desc: 'Exotic floral essential oil. Known for relaxing properties in aromatherapy.',      verified: true  },
  // Z
  { id: 57, name: 'Zinc Oxide (Nano-free)',        supplier: 'MineralPure Co',       category: 'Colorants',        safety: 95, sustain: 86, certs: ['COSMOS','Vegan','ISO'],           price: '$12–$20/kg',  avail: 'in_stock',  desc: 'Non-nano mineral UV filter. Broad-spectrum UVA/UVB protection. Reef-safe.',        verified: true  },
  { id: 58, name: 'Zinc PCA',                      supplier: 'BioChem Actives',      category: 'Humectants',       safety: 93, sustain: 85, certs: ['COSMOS','ISO'],                  price: '$40–$60/kg',  avail: 'in_stock',  desc: 'Zinc salt of pyrrolidone carboxylic acid. Sebum regulating and moisturising.',      verified: true  },
];

const SUPPLIERS = [
  { name: 'GreenChem Solutions',   country: 'Netherlands', speciality: 'Surfactants & Cleansers',    certs: ['COSMOS','ISO 9001'],     verified: true  },
  { name: 'EcoBio Ingredients',    country: 'Germany',     speciality: 'Coconut Derivatives',        certs: ['COSMOS','EcoCert'],      verified: true  },
  { name: 'PureSource Labs',       country: 'USA',         speciality: 'Organic Humectants',         certs: ['USDA Organic','Non-GMO'], verified: true  },
  { name: 'SafeChem Europe',       country: 'France',      speciality: 'Preservation Systems',       certs: ['ISO 9001'],              verified: false },
  { name: 'TropicNat Supplies',    country: 'Malaysia',    speciality: 'Tropical Botanicals',        certs: ['COSMOS','EcoCert'],      verified: true  },
  { name: 'BioPoly Ingredients',   country: 'Belgium',     speciality: 'Biopolymers & Hydrocolloids',certs: ['COSMOS','USDA Organic'], verified: true  },
  { name: 'NaturaSource Co',       country: 'Spain',       speciality: 'Aloe & Botanical Extracts',  certs: ['COSMOS','USDA Organic'], verified: true  },
  { name: 'BioActives GmbH',       country: 'Germany',     speciality: 'Multifunctional Actives',    certs: ['COSMOS','ISO 9001'],     verified: true  },
  { name: 'PureVit Ingredients',   country: 'USA',         speciality: 'Vitamins & Antioxidants',    certs: ['ISO 9001','Vegan'],      verified: true  },
  { name: 'HerbalPure Labs',       country: 'Italy',       speciality: 'Botanical Extracts',         certs: ['COSMOS','EcoCert'],      verified: true  },
  { name: 'AcidWorks Europe',      country: 'Sweden',      speciality: 'Hydroxy Acids & pH',         certs: ['ISO 9001','COSMOS'],     verified: true  },
  { name: 'OceanBio Extracts',     country: 'Ireland',     speciality: 'Marine Ingredients',         certs: ['COSMOS','MSC'],          verified: true  },
  { name: 'AfricaSource NL',       country: 'Ghana/NL',    speciality: 'Fair Trade African Butters', certs: ['Fair Trade','COSMOS'],   verified: true  },
  { name: 'MineralPure Co',        country: 'UK',          speciality: 'Minerals & Clays',           certs: ['COSMOS','Vegan'],        verified: true  },
  { name: 'FermentBio Labs',       country: 'South Korea', speciality: 'Bio-fermentation Actives',   certs: ['COSMOS','ISO 22716'],    verified: true  },
];

const TABS = ['Ingredients', 'Suppliers'];

export default function Marketplace() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState('Ingredients');
  const [query, setQuery] = useState('');
  const [certFilter, setCertFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  const [activeLetter, setActiveLetter] = useState(null);
  const [contactedId, setContactedId] = useState(null);
  const letterRefs = useRef({});

  const handleLetterClick = (letter) => {
    setActiveLetter(letter);
    setQuery('');
    setCertFilter('All');
    setCatFilter('All');
    letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filtered = ALL_INGREDIENTS.filter(item => {
    const matchQuery = !query || item.name.toLowerCase().includes(query.toLowerCase()) || item.supplier.toLowerCase().includes(query.toLowerCase());
    const matchCert = certFilter === 'All' || item.certs.includes(certFilter);
    const matchCat = catFilter === 'All' || item.category === catFilter;
    const matchLetter = !activeLetter || item.name.toUpperCase().startsWith(activeLetter);
    return matchQuery && matchCert && matchCat && matchLetter;
  });

  const filteredSuppliers = SUPPLIERS.filter(s =>
    !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.country.toLowerCase().includes(query.toLowerCase()) || s.speciality.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = ALPHABET.reduce((acc, letter) => {
    const items = filtered.filter(i => i.name.toUpperCase().startsWith(letter));
    if (items.length) acc[letter] = items;
    return acc;
  }, {});

  const availableLetters = new Set(ALL_INGREDIENTS.map(i => i.name[0].toUpperCase()));

  const handleContact = (id) => {
    setContactedId(id);
    setTimeout(() => setContactedId(null), 2000);
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#EDF7F2' }}>
      <AuthGate featureName="Marketplace" featureDescription="Sign in to browse verified sustainable ingredient suppliers." />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDF7F2' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Sustainable Chemistry Marketplace</h1>
          <p className="text-slate-500 mt-1">Verified sustainable ingredients — filtered, rated, and ready to source.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-5 py-2 rounded-lg text-sm font-semibold transition-all', tab === t ? 'bg-[#007850] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {t}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setActiveLetter(null); }}
              placeholder={tab === 'Ingredients' ? 'Search ingredients or suppliers...' : 'Search suppliers, country, or speciality...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-[#007850] outline-none"
            />
          </div>
          {tab === 'Ingredients' && (
            <>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1"><Filter className="w-3.5 h-3.5" /> Certification:</div>
                {CERTIFICATIONS.map(c => (
                  <button key={c} onClick={() => setCertFilter(c)}
                    className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border transition-all', certFilter === c ? 'bg-[#007850] text-white border-[#007850]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#007850]/40')}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-1"><Filter className="w-3.5 h-3.5" /> Category:</div>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border transition-all', catFilter === c ? 'bg-[#6B3FA0] text-white border-[#6B3FA0]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#6B3FA0]/40')}>
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* A-Z navigator */}
        {tab === 'Ingredients' && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-6 flex flex-wrap gap-1 items-center">
            <span className="text-xs text-slate-400 font-semibold mr-2">A-Z:</span>
            <button onClick={() => setActiveLetter(null)}
              className={cn('w-7 h-7 rounded-md text-xs font-bold transition-all', !activeLetter ? 'bg-[#007850] text-white' : 'text-slate-400 hover:bg-slate-100')}>
              All
            </button>
            {ALPHABET.map(letter => (
              <button key={letter} onClick={() => handleLetterClick(letter)}
                disabled={!availableLetters.has(letter)}
                className={cn('w-7 h-7 rounded-md text-xs font-bold transition-all',
                  activeLetter === letter ? 'bg-[#007850] text-white' :
                  availableLetters.has(letter) ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed')}>
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Ingredients tab */}
        {tab === 'Ingredients' && (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} ingredient{filtered.length !== 1 ? 's' : ''} found</p>
            {Object.keys(grouped).length === 0 ? (
              <div className="text-center py-16 text-slate-400">No ingredients found matching your filters.</div>
            ) : (
              Object.entries(grouped).map(([letter, items]) => (
                <div key={letter} ref={el => letterRefs.current[letter] = el} className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#007850] flex items-center justify-center">
                      <span className="text-white font-black text-base">{letter}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{items.length} ingredient{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:border-[#007850]/30 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              <p className="text-xs text-[#007850] font-medium">{item.supplier}</p>
                              {item.verified && <CheckCircle2 className="w-3 h-3 text-[#007850] flex-shrink-0" />}
                            </div>
                          </div>
                          <div className={cn('text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 whitespace-nowrap',
                            item.avail === 'in_stock' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                            {item.avail === 'in_stock' ? 'In stock' : 'On request'}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.desc}</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-[#EDF7F2] rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Safety</p>
                            <p className={cn('text-base font-bold', item.safety >= 90 ? 'text-green-600' : item.safety >= 75 ? 'text-amber-600' : 'text-red-600')}>{item.safety}</p>
                          </div>
                          <div className="bg-[#EDF7F2] rounded-lg p-2 text-center">
                            <p className="text-xs text-slate-400">Sustainability</p>
                            <p className={cn('text-base font-bold', item.sustain >= 85 ? 'text-emerald-600' : 'text-amber-600')}>{item.sustain}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{item.category}</span>
                          {item.certs.map(c => <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{c}</span>)}
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-semibold">{item.price}</span>
                          <button onClick={() => handleContact(item.id)}
                            className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all',
                              contactedId === item.id ? 'bg-green-100 text-green-700' : 'bg-[#007850] text-white hover:bg-[#005f3d]')}>
                            {contactedId === item.id ? 'Request sent' : 'Request Sample'}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Suppliers tab */}
        {tab === 'Suppliers' && (
          <>
            <p className="text-xs text-slate-400 mb-4">{filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuppliers.map((s, i) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col hover:border-[#007850]/30 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF7F2] border border-[#007850]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#007850]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                        {s.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#007850] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{s.country}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 font-medium">{s.speciality}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {s.certs.map(c => <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{c}</span>)}
                    {!s.verified && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Unverified</span>}
                  </div>
                  <div className="mt-auto">
                    <button className="w-full text-xs py-2 rounded-lg font-semibold bg-[#EDF7F2] text-[#007850] border border-[#007850]/20 hover:bg-[#007850] hover:text-white transition-all flex items-center justify-center gap-1">
                      View Catalogue <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}