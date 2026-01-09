import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Globe, CheckSquare, Square, Sparkles, FlaskConical, ShieldCheck, AlertCircle, Search, Package, Upload, FileText, X, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ComplianceResultDisplay from './ComplianceResultDisplay';

// Large local product database for instant search
const PRODUCT_DATABASE = [
  // Skincare
  { product_name: "CeraVe Moisturizing Cream", brand: "CeraVe", category: "Moisturizer", description: "Rich, non-greasy moisturizer with ceramides and hyaluronic acid", ingredients: ["Aqua", "Glycerin", "Cetearyl Alcohol", "Caprylic/Capric Triglyceride", "Cetyl Alcohol", "Ceteareth-20", "Petrolatum", "Potassium Phosphate", "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Carbomer", "Dimethicone", "Behentrimonium Methosulfate", "Sodium Lauroyl Lactylate", "Sodium Hyaluronate", "Cholesterol", "Phenoxyethanol", "Disodium EDTA", "Dipotassium Phosphate", "Tocopherol", "Phytosphingosine", "Xanthan Gum", "Ethylhexylglycerin"] },
  { product_name: "Neutrogena Hydro Boost Gel-Cream", brand: "Neutrogena", category: "Moisturizer", description: "Lightweight water gel moisturizer with hyaluronic acid", ingredients: ["Water", "Dimethicone", "Glycerin", "Dimethicone/Vinyl Dimethicone Crosspolymer", "Phenoxyethanol", "Polyacrylamide", "Cetearyl Olivate", "Sorbitan Olivate", "Dimethiconol", "C13-14 Isoparaffin", "Dimethicone Crosspolymer", "Chlorphenesin", "Carbomer", "Laureth-7", "Sodium Hyaluronate", "Ethylhexylglycerin", "C12-14 Pareth-12", "Sodium Hydroxide", "Blue 1"] },
  { product_name: "La Roche-Posay Toleriane Double Repair Face Moisturizer", brand: "La Roche-Posay", category: "Moisturizer", description: "48-hour moisturizer with ceramide-3 and niacinamide", ingredients: ["Aqua", "Glycerin", "Dimethicone", "Isocetyl Stearate", "Niacinamide", "Glyceryl Stearate", "Propanediol", "Cetyl Alcohol", "Ammonium Polyacryloyldimethyl Taurate", "Behenyl Alcohol", "Sodium Hydroxide", "Ceramide NP", "Tocopherol", "Disodium EDTA", "Capryloyl Glycine", "Panthenol", "Caprylyl Glycol"] },
  { product_name: "The Ordinary Niacinamide 10% + Zinc 1%", brand: "The Ordinary", category: "Serum", description: "High-strength vitamin and mineral blemish formula", ingredients: ["Aqua", "Niacinamide", "Pentylene Glycol", "Zinc PCA", "Dimethyl Isosorbide", "Tamarindus Indica Seed Gum", "Xanthan Gum", "Isoceteth-20", "Ethoxydiglycol", "Phenoxyethanol", "Chlorphenesin"] },
  { product_name: "The Ordinary Hyaluronic Acid 2% + B5", brand: "The Ordinary", category: "Serum", description: "Multi-weight hyaluronic acid hydration support formula", ingredients: ["Aqua", "Sodium Hyaluronate", "Sodium Hyaluronate Crosspolymer", "Panthenol", "Ahnfeltia Concinna Extract", "Glycerin", "Pentylene Glycol", "Propanediol", "Polyacrylate Crosspolymer-6", "PPG-26-Buteth-26", "PEG-40 Hydrogenated Castor Oil", "Trisodium Ethylenediamine Disuccinate", "Citric Acid", "Ethoxydiglycol", "Hexylene Glycol", "1,2-Hexanediol", "Phenoxyethanol", "Caprylyl Glycol"] },
  { product_name: "Drunk Elephant Protini Polypeptide Cream", brand: "Drunk Elephant", category: "Moisturizer", description: "Protein moisturizer with signal peptides and growth factors", ingredients: ["Water", "Dicaprylyl Carbonate", "Glycerin", "Cetearyl Alcohol", "Cetearyl Olivate", "Sorbitan Olivate", "Acetyl SH-Polypeptide-1", "SH-Polypeptide-1", "SH-Polypeptide-9", "SH-Polypeptide-11", "Copper Palmitoyl Heptapeptide-14", "Palmitoyl Tetrapeptide-7", "Palmitoyl Tripeptide-1", "Palmitoyl Hexapeptide-12", "Sclerocarya Birrea Seed Oil", "Sodium Hyaluronate", "Pygmy Waterlily Extract", "Chrysanthemum Morifolium Flower Extract"] },
  { product_name: "Olay Regenerist Micro-Sculpting Cream", brand: "Olay", category: "Anti-Aging Cream", description: "Advanced anti-aging moisturizer with amino-peptide complex", ingredients: ["Water", "Glycerin", "Niacinamide", "Isohexadecane", "Dimethicone", "Panthenol", "Palmitoyl Pentapeptide-4", "Tocopheryl Acetate", "Camellia Sinensis Leaf Extract", "Allantoin", "Sodium Hyaluronate", "DMDM Hydantoin", "Carbomer", "Titanium Dioxide", "PEG-100 Stearate", "Cetyl Alcohol", "Benzyl Alcohol", "Stearic Acid", "Polymethyl Methacrylate", "Fragrance"] },
  { product_name: "Clinique Dramatically Different Moisturizing Lotion+", brand: "Clinique", category: "Moisturizer", description: "Dermatologist-developed face moisturizer", ingredients: ["Water", "Glycerin", "Sesamum Indicum Seed Oil", "Helianthus Annuus Seed Oil", "Glyceryl Stearate", "PEG-100 Stearate", "Squalane", "Butyrospermum Parkii Butter", "Triticum Vulgare Germ Oil", "Hordeum Vulgare Extract", "Cucumis Sativus Fruit Extract", "Helianthus Annuus Seed Extract", "Sodium Hyaluronate", "Trehalose", "Tocopheryl Acetate", "Caffeine", "Carbomer", "Petrolatum", "Steareth-21", "Dimethicone", "Phenoxyethanol", "Yellow 6", "Red 4"] },
  { product_name: "Kiehl's Ultra Facial Cream", brand: "Kiehl's", category: "Moisturizer", description: "24-hour daily facial moisturizer for all skin types", ingredients: ["Water", "Squalane", "Glycerin", "Cyclohexasiloxane", "Sucrose Stearate", "Stearyl Alcohol", "PEG-8 Stearate", "Myristyl Myristate", "Prunus Armeniaca Kernel Oil", "Phenoxyethanol", "Persea Gratissima Oil", "Olea Europaea Fruit Oil", "Glyceryl Stearate", "Pentaerythrityl Tetraethylhexanoate", "Cetyl Alcohol", "Butyrospermum Parkii Butter", "Oryza Sativa Bran Oil", "Pseudoalteromonas Ferment Extract", "Chlorphenesin", "Carbomer", "Disodium EDTA", "Imperata Cylindrica Root Extract", "Sodium Hydroxide", "Tocopherol"] },
  { product_name: "SK-II Facial Treatment Essence", brand: "SK-II", category: "Essence", description: "Signature essence with over 90% PITERA", ingredients: ["Galactomyces Ferment Filtrate", "Butylene Glycol", "Pentylene Glycol", "Water", "Sodium Benzoate", "Methylparaben", "Sorbic Acid"] },
  { product_name: "Estée Lauder Advanced Night Repair", brand: "Estée Lauder", category: "Serum", description: "Synchronized multi-recovery complex serum", ingredients: ["Water", "Bifida Ferment Lysate", "Methyl Gluceth-20", "PEG-75", "Bis-PEG-18 Methyl Ether Dimethyl Silane", "Butylene Glycol", "Propanediol", "Cola Acuminata Seed Extract", "Hydrolyzed Algin", "Pantethine", "Caffeine", "Lecithin", "Tripeptide-32", "Ethylhexylglycerin", "Sodium RNA", "Bisabolol", "Glycereth-26", "Squalane", "Sodium Hyaluronate", "Oleth-3 Phosphate", "Caprylyl Glycol", "Lactobacillus Ferment", "Oleth-3", "Oleth-5", "Anthemis Nobilis Flower Oil", "Sodium Hydroxide", "Carbomer", "Trisodium EDTA", "BHT", "Adenosine", "Xanthan Gum", "Hexylene Glycol", "Phenoxyethanol", "Red 4", "Yellow 5"] },

  // Cleansers
  { product_name: "CeraVe Hydrating Facial Cleanser", brand: "CeraVe", category: "Cleanser", description: "Gentle, non-foaming daily cleanser for normal to dry skin", ingredients: ["Aqua", "Glycerin", "Cetearyl Alcohol", "PEG-40 Stearate", "Stearyl Alcohol", "Potassium Phosphate", "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Carbomer", "Glyceryl Stearate", "Behentrimonium Methosulfate", "Sodium Lauroyl Lactylate", "Sodium Hyaluronate", "Cholesterol", "Phenoxyethanol", "Disodium EDTA", "Dipotassium Phosphate", "Tocopherol", "Phytosphingosine", "Xanthan Gum", "Ethylhexylglycerin"] },
  { product_name: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", category: "Cleanser", description: "Mild, soap-free formula for all skin types", ingredients: ["Water", "Cetyl Alcohol", "Propylene Glycol", "Sodium Lauryl Sulfate", "Stearyl Alcohol", "Methylparaben", "Propylparaben", "Butylparaben"] },
  { product_name: "La Roche-Posay Toleriane Hydrating Gentle Cleanser", brand: "La Roche-Posay", category: "Cleanser", description: "Hydrating face wash for normal to dry sensitive skin", ingredients: ["Aqua", "Glycerin", "Pentaerythrityl Tetraethylhexanoate", "Propylene Glycol", "Ammonium Polyacryloyldimethyl Taurate", "Polysorbate 60", "Ceramide NP", "Niacinamide", "Sodium Chloride", "Coco-Betaine", "Disodium EDTA", "Caprylyl Glycol", "Panthenol", "T-Butyl Alcohol", "Tocopherol"] },
  { product_name: "Fresh Soy Face Cleanser", brand: "Fresh", category: "Cleanser", description: "Gentle gel cleanser with amino acid-rich soy proteins", ingredients: ["Water", "Glycerin", "Sodium Cocoyl Isethionate", "Stearic Acid", "Palmitic Acid", "Sodium Chloride", "Glycine Soja Protein", "Prunus Amygdalus Dulcis Protein", "Cucumis Sativus Fruit Extract", "Rosa Damascena Flower Water", "Aloe Barbadensis Leaf Juice", "Sodium Isethionate", "Cocamidopropyl Betaine", "Sodium Stearate", "Sodium Myristate", "Aqua", "Parfum", "Limonene", "Linalool", "Geraniol", "Citronellol", "Eugenol", "Phenoxyethanol", "Methylparaben", "Propylparaben"] },
  { product_name: "Philosophy Purity Made Simple Cleanser", brand: "Philosophy", category: "Cleanser", description: "One-step facial cleanser that removes makeup", ingredients: ["Water", "Sodium Laureth Sulfate", "Acrylates Copolymer", "Glycerin", "Sodium Chloride", "Cocamidopropyl Betaine", "Phenoxyethanol", "Sodium Hydroxide", "Disodium EDTA", "Ethylhexylglycerin", "Sodium Hyaluronate", "Anthemis Nobilis Flower Extract", "Thymus Serpillum Extract", "Melissa Officinalis Leaf Extract", "Fragrance"] },

  // Sunscreens
  { product_name: "EltaMD UV Clear Broad-Spectrum SPF 46", brand: "EltaMD", category: "Sunscreen", description: "Oil-free sunscreen for acne-prone skin with niacinamide", ingredients: ["Active Ingredients: Zinc Oxide 9.0%, Octinoxate 7.5%", "Inactive Ingredients: Purified Water", "Cyclomethicone", "Niacinamide", "Octyldodecyl Neopentanoate", "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer", "Polyisobutene", "PEG-7 Trimethylolpropane Coconut Ether", "Sodium Hyaluronate", "Tocopheryl Acetate", "Lactic Acid", "Oleth-3 Phosphate", "Phenoxyethanol", "Iodopropynyl Butylcarbamate"] },
  { product_name: "La Roche-Posay Anthelios Melt-in Milk Sunscreen SPF 60", brand: "La Roche-Posay", category: "Sunscreen", description: "Fast-absorbing sunscreen lotion for face and body", ingredients: ["Active Ingredients: Avobenzone 3%, Homosalate 10%, Octisalate 5%, Octocrylene 7%", "Inactive Ingredients: Water", "Isopropyl Palmitate", "Glycerin", "Alcohol Denat.", "Silica", "Styrene/Acrylates Copolymer", "Dimethicone", "Potassium Cetyl Phosphate", "PEG-100 Stearate", "Glyceryl Stearate", "Triethanolamine", "Caprylyl Glycol", "Disodium EDTA", "Tocopherol", "Phenoxyethanol"] },
  { product_name: "Supergoop! Unseen Sunscreen SPF 40", brand: "Supergoop!", category: "Sunscreen", description: "Invisible, weightless, scentless sunscreen primer", ingredients: ["Active Ingredients: Avobenzone 3.0%, Homosalate 8.0%, Octisalate 5.0%, Octocrylene 4.0%", "Inactive Ingredients: Isododecane", "Dimethicone", "Silica", "Dimethicone/Vinyl Dimethicone Crosspolymer", "Isononyl Isononanoate", "Bis-PEG/PPG-14/14 Dimethicone", "Polymethylsilsesquioxane", "Lauryl PEG-8 Dimethicone", "Glycerin", "Meadowfoam Estolide", "Caprylic/Capric Triglyceride", "Rubus Fruticosus Fruit Extract", "Punica Granatum Extract", "Frankincense Oil", "Dimethicone Crosspolymer", "Tocopherol", "Sodium Chloride", "Disodium Stearoyl Glutamate", "Alumina", "Triethoxycaprylylsilane", "Phenoxyethanol", "Ethylhexylglycerin"] },
  { product_name: "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 55", brand: "Neutrogena", category: "Sunscreen", description: "Lightweight, non-greasy sunscreen with Helioplex technology", ingredients: ["Active Ingredients: Avobenzone 3%, Homosalate 10%, Octisalate 5%, Octocrylene 2.8%, Oxybenzone 6%", "Inactive Ingredients: Water", "Sorbitol", "Silica", "VP/Hexadecene Copolymer", "Styrene/Acrylates Copolymer", "Dimethicone", "Triethanolamine", "Polymethyl Methacrylate", "Phenoxyethanol", "BHT", "Caprylyl Glycol", "Ethylhexylglycerin", "Disodium EDTA", "Fragrance", "Methylparaben"] },

  // Hair Care
  { product_name: "Olaplex No. 3 Hair Perfector", brand: "Olaplex", category: "Hair Treatment", description: "Weekly at-home treatment that reduces breakage and strengthens hair", ingredients: ["Water", "Bis-Aminopropyl Diglycol Dimaleate", "Propylene Glycol", "Cetearyl Alcohol", "Behentrimonium Methosulfate", "Cetyl Alcohol", "Phenoxyethanol", "Glycerin", "Hydroxyethyl Ethylcellulose", "Stearamidopropyl Dimethylamine", "Quaternium-91", "Sodium Benzoate", "Cetrimonium Methosulfate", "Panthenol", "Etidronic Acid", "Polyquaternium-37", "Tetrasodium EDTA", "Propylparaben", "PPG-1 Trideceth-6", "Butylphenyl Methylpropional", "Hexyl Cinnamal", "Linalool", "Limonene", "Fragrance"] },
  { product_name: "Moroccanoil Treatment", brand: "Moroccanoil", category: "Hair Oil", description: "Argan oil-infused hair treatment for all hair types", ingredients: ["Cyclomethicone", "Dimethicone", "Argania Spinosa Kernel Oil", "Linum Usitatissimum Seed Extract", "Parfum", "CI 26100", "CI 47000"] },
  { product_name: "Kerastase Elixir Ultime L'Huile Originale", brand: "Kérastase", category: "Hair Oil", description: "Beautifying hair oil for all hair types", ingredients: ["Cyclopentasiloxane", "Dimethiconol", "Argania Spinosa Kernel Oil", "Zea Mays Germ Oil", "Camellia Oleifera Seed Oil", "Helianthus Annuus Seed Oil", "Parfum", "Tocopherol", "Linalool", "Alpha-Isomethyl Ionone", "Benzyl Salicylate", "Hexyl Cinnamal", "Hydroxycitronellal", "Limonene", "CI 26100", "CI 47000"] },
  { product_name: "Briogeo Don't Despair, Repair! Deep Conditioning Mask", brand: "Briogeo", category: "Hair Mask", description: "Weekly deep conditioning treatment for damaged hair", ingredients: ["Water", "Cetyl Alcohol", "Cetearyl Alcohol", "Behentrimonium Chloride", "Rosmarinus Officinalis Leaf Extract", "Algae Extract", "Biotin", "Panthenol", "Avena Sativa Kernel Protein", "Cocos Nucifera Oil", "Helianthus Annuus Seed Oil", "Argania Spinosa Kernel Oil", "Macadamia Ternifolia Seed Oil", "Aloe Barbadensis Leaf Juice", "Rosa Canina Fruit Oil", "Tocopheryl Acetate", "Glycerin", "Isopropyl Alcohol", "Phenoxyethanol", "Ethylhexylglycerin", "Fragrance"] },
  { product_name: "Head & Shoulders Classic Clean Shampoo", brand: "Head & Shoulders", category: "Shampoo", description: "Anti-dandruff shampoo with pyrithione zinc", ingredients: ["Active Ingredient: Pyrithione Zinc 1%", "Inactive Ingredients: Water", "Sodium Lauryl Sulfate", "Sodium Laureth Sulfate", "Glycol Distearate", "Zinc Carbonate", "Sodium Chloride", "Sodium Xylenesulfonate", "Cocamidopropyl Betaine", "Dimethicone", "Fragrance", "Sodium Benzoate", "Guar Hydroxypropyltrimonium Chloride", "Magnesium Carbonate Hydroxide", "Methylchloroisothiazolinone", "Methylisothiazolinone"] },
  { product_name: "Pantene Pro-V Daily Moisture Renewal Shampoo", brand: "Pantene", category: "Shampoo", description: "Moisturizing shampoo for dry and damaged hair", ingredients: ["Water", "Sodium Lauryl Sulfate", "Sodium Laureth Sulfate", "Glycol Distearate", "Cocamidopropyl Betaine", "Dimethicone", "Fragrance", "Sodium Citrate", "Sodium Xylenesulfonate", "Citric Acid", "Sodium Benzoate", "Sodium Chloride", "Tetrasodium EDTA", "Panthenol", "Panthenyl Ethyl Ether", "Methylchloroisothiazolinone", "Methylisothiazolinone"] },

  // Oils
  { product_name: "Bio-Oil Skincare Oil", brand: "Bio-Oil", category: "Body Oil", description: "Specialist skincare oil for scars, stretch marks, and uneven skin tone", ingredients: ["Paraffinum Liquidum", "Triisononanoin", "Cetearyl Ethylhexanoate", "Isopropyl Myristate", "Retinyl Palmitate", "Helianthus Annuus Seed Oil", "Tocopheryl Acetate", "Anthemis Nobilis Flower Oil", "Lavandula Angustifolia Oil", "Rosmarinus Officinalis Leaf Oil", "Calendula Officinalis Flower Extract", "Glycine Soja Oil", "BHT", "Bisabolol", "Parfum", "Alpha-Isomethyl Ionone", "Amyl Cinnamal", "Benzyl Salicylate", "Citronellol", "Coumarin", "Eugenol", "Farnesol", "Geraniol", "Hydroxycitronellal", "Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde", "Limonene", "Linalool", "CI 26100"] },
  { product_name: "The Ordinary 100% Organic Cold-Pressed Rose Hip Seed Oil", brand: "The Ordinary", category: "Face Oil", description: "Pure, cold-pressed rosehip seed oil rich in linoleic acid", ingredients: ["Rosa Canina Seed Oil"] },
  { product_name: "Josie Maran 100% Pure Argan Oil", brand: "Josie Maran", category: "Face Oil", description: "Organic argan oil for face, body and hair", ingredients: ["Argania Spinosa Kernel Oil"] },
  { product_name: "Sunday Riley Luna Sleeping Night Oil", brand: "Sunday Riley", category: "Face Oil", description: "Retinoid sleeping night oil", ingredients: ["Oenothera Biennis Oil", "Simmondsia Chinensis Seed Oil", "Caprylic/Capric Triglyceride", "C12-15 Alkyl Benzoate", "Blue Tansy Oil", "Propanediol", "Avena Sativa Kernel Oil", "Hydrogenated Retinol", "Tocopheryl Acetate", "Bisabolol", "Beta-Carotene", "Echium Plantagineum Seed Oil", "Vaccinium Macrocarpon Seed Oil", "Hippophae Rhamnoides Oil", "Borago Officinalis Seed Oil", "Fragrance", "Linalool", "Limonene"] },
  { product_name: "Palmer's Cocoa Butter Formula", brand: "Palmer's", category: "Body Lotion", description: "Rich daily body lotion with cocoa butter and vitamin E", ingredients: ["Water", "Theobroma Cacao Seed Butter", "Glycerin", "Stearic Acid", "Isopropyl Myristate", "Glyceryl Stearate", "Petrolatum", "Cetyl Alcohol", "Dimethicone", "Mineral Oil", "Zea Mays Starch", "Phenoxyethanol", "Tocopheryl Acetate", "Carbomer", "Sodium Hydroxide", "Ethylhexylglycerin", "Theobroma Cacao Extract", "Fragrance", "Benzyl Benzoate", "Benzyl Alcohol", "Coumarin", "Limonene", "Linalool"] },
  { product_name: "Coconut Oil (Organic Virgin)", brand: "Nutiva", category: "Cooking Oil", description: "100% organic virgin coconut oil for cooking and skincare", ingredients: ["Cocos Nucifera Oil"] },
  { product_name: "Extra Virgin Olive Oil", brand: "California Olive Ranch", category: "Cooking Oil", description: "100% California extra virgin olive oil", ingredients: ["Olea Europaea Fruit Oil"] },
  { product_name: "Avocado Oil", brand: "Chosen Foods", category: "Cooking Oil", description: "100% pure avocado oil, naturally refined", ingredients: ["Persea Gratissima Oil"] },
  { product_name: "Jojoba Oil", brand: "NOW Solutions", category: "Body Oil", description: "100% pure organic jojoba oil", ingredients: ["Simmondsia Chinensis Seed Oil"] },
  { product_name: "Sweet Almond Oil", brand: "NOW Solutions", category: "Body Oil", description: "100% pure sweet almond oil", ingredients: ["Prunus Amygdalus Dulcis Oil"] },
  { product_name: "Castor Oil", brand: "Sky Organics", category: "Body Oil", description: "USDA organic cold-pressed castor oil", ingredients: ["Ricinus Communis Seed Oil"] },
  { product_name: "Tea Tree Oil", brand: "The Body Shop", category: "Essential Oil", description: "Community Trade tea tree oil", ingredients: ["Melaleuca Alternifolia Leaf Oil"] },

  // Makeup
  { product_name: "Maybelline Fit Me! Matte + Poreless Foundation", brand: "Maybelline", category: "Foundation", description: "Lightweight matte foundation for normal to oily skin", ingredients: ["Water", "Cyclopentasiloxane", "Glycerin", "Isododecane", "Alcohol Denat.", "Dimethicone", "PEG-10 Dimethicone", "Cyclohexasiloxane", "Nylon-12", "Aluminum Starch Octenylsuccinate", "Phenoxyethanol", "Sodium Chloride", "Synthetic Fluorphlogopite", "Magnesium Sulfate", "Disteardimonium Hectorite", "Disodium Stearoyl Glutamate", "Methylparaben", "Alumina", "Silica", "Propylene Carbonate", "Ethylparaben", "Tocopherol", "BHT", "CI 77891", "CI 77492", "CI 77491", "CI 77499"] },
  { product_name: "L'Oreal Paris True Match Super-Blendable Foundation", brand: "L'Oreal Paris", category: "Foundation", description: "Blendable liquid foundation that matches skin tone and texture", ingredients: ["Water", "Isododecane", "Alcohol Denat.", "Dimethicone", "Isohexadecane", "Glycerin", "Peg-10 Dimethicone", "Disteardimonium Hectorite", "Propylene Carbonate", "Disodium Stearoyl Glutamate", "Dimethiconol", "Silica Dimethyl Silylate", "Aluminum Hydroxide", "Methicone", "Phenoxyethanol", "Tetrasodium EDTA", "BHT", "Ascorbyl Glucoside", "Tocopherol", "CI 77891", "CI 77491", "CI 77492", "CI 77499", "Fragrance"] },
  { product_name: "NARS Radiant Creamy Concealer", brand: "NARS", category: "Concealer", description: "Award-winning medium-to-buildable coverage concealer", ingredients: ["Water", "Dimethicone", "Isododecane", "Hydrogenated Polyisobutene", "Cetyl PEG/PPG-10/1 Dimethicone", "Trimethylsiloxysilicate", "Glycerin", "PEG-10 Dimethicone", "Disteardimonium Hectorite", "Cyclomethicone", "Phenoxyethanol", "Tocopheryl Acetate", "Isopropyl Titanium Triisostearate", "Sodium Chloride", "Magnesium Silicate", "Propylene Carbonate", "Hydrogen Dimethicone", "Chlorphenesin", "Ethylhexylglycerin", "Calcium Aluminum Borosilicate", "Tin Oxide", "Silica", "CI 77891", "CI 77491", "CI 77492", "CI 77499"] },
  { product_name: "MAC Prep + Prime Fix+", brand: "MAC", category: "Setting Spray", description: "Lightweight mist that refreshes and sets makeup", ingredients: ["Water", "Glycerin", "Butylene Glycol", "Cucumis Sativus Fruit Extract", "Chamomilla Recutita Flower Extract", "Camellia Sinensis Leaf Extract", "Tocopheryl Acetate", "Caffeine", "Panthenol", "Arginine", "PEG-40 Hydrogenated Castor Oil", "PPG-26-Buteth-26", "Fragrance", "Disodium EDTA", "Phenoxyethanol"] },
  { product_name: "Urban Decay All Nighter Setting Spray", brand: "Urban Decay", category: "Setting Spray", description: "Long-lasting makeup setting spray", ingredients: ["Water", "Alcohol Denat.", "PVP", "Methacryloyl Ethyl Betaine/Acrylates Copolymer", "Sodium Benzoate", "Limonene", "Fragrance"] },

  // Household Cleaners
  { product_name: "Method All-Purpose Cleaner", brand: "Method", category: "Household Cleaner", description: "Non-toxic, biodegradable all-purpose surface cleaner", ingredients: ["Water", "Decyl Glucoside", "Sodium Carbonate", "Lactic Acid", "Potassium Hydrate", "Fragrance", "Colorant"] },
  { product_name: "Mrs. Meyer's Clean Day Multi-Surface Cleaner", brand: "Mrs. Meyer's", category: "Household Cleaner", description: "Plant-derived multi-surface everyday cleaner", ingredients: ["Water", "Decyl Glucoside", "Caprylyl/Myristyl Glucoside", "Lactic Acid", "Sodium Citrate", "Glycerin", "Fragrance", "Essential Oils", "Methylisothiazolinone", "Colorant"] },
  { product_name: "Seventh Generation Disinfecting Multi-Surface Cleaner", brand: "Seventh Generation", category: "Household Cleaner", description: "EPA-registered botanical disinfectant cleaner", ingredients: ["Active Ingredient: Thymol 0.05%", "Inactive Ingredients: Water", "Citric Acid", "Sodium Citrate", "Essential Oils", "Isopropyl Alcohol", "Potassium Sorbate"] },
  { product_name: "Lysol All Purpose Cleaner", brand: "Lysol", category: "Household Cleaner", description: "Multi-surface antibacterial cleaner", ingredients: ["Water", "C10-12 Alcohol Ethoxylate", "Dipropylene Glycol Butyl Ether", "Citric Acid", "Sodium C14-17 Sec-Alkyl Sulfonate", "Fragrance", "Dimethicone", "Colorant"] },
  { product_name: "Clorox Clean-Up Cleaner + Bleach", brand: "Clorox", category: "Household Cleaner", description: "All-purpose cleaner with bleach", ingredients: ["Water", "Sodium Hypochlorite", "Sodium Hydroxide", "C12-14 Alkyl Dimethyl Amine Oxide", "Sodium Chloride", "Sodium Silicate", "Fragrance"] },
  { product_name: "Pine-Sol Original Multi-Surface Cleaner", brand: "Pine-Sol", category: "Household Cleaner", description: "Pine-scented multi-surface cleaner and deodorizer", ingredients: ["Water", "C10-12 Alcohol Ethoxylates", "Pine Oil", "Isopropyl Alcohol", "Sodium Petroleum Sulfonate", "Sulfuric Acid", "Sodium Hydroxide", "Xanthan Gum", "Fragrance", "Colorant"] },
  { product_name: "Dawn Ultra Dishwashing Liquid", brand: "Dawn", category: "Dish Soap", description: "Grease-fighting dish soap", ingredients: ["Water", "Sodium Lauryl Sulfate", "Sodium Laureth Sulfate", "Lauramine Oxide", "Sodium Chloride", "PEI-14 PEG-10/PPG-7 Copolymer", "Phenoxyethanol", "Methylisothiazolinone", "Fragrance", "Colorant"] },
  { product_name: "Tide Original Laundry Detergent", brand: "Tide", category: "Laundry Detergent", description: "Original scent liquid laundry detergent", ingredients: ["Water", "Alcohol Ethoxysulfate", "Linear Alkylbenzene Sulfonate", "Propylene Glycol", "Citric Acid", "Sodium Hydroxide", "Borax", "Ethanolamine", "Sodium Fatty Acids", "Polyethyleneimine Ethoxylate", "Diquaternium Ethoxysulfate", "Protease", "Sodium Formate", "Calcium Formate", "Fragrance", "Colorants"] },

  // Baby Products
  { product_name: "Johnson's Baby Shampoo", brand: "Johnson's", category: "Baby Care", description: "Gentle, tear-free baby shampoo", ingredients: ["Water", "Cocamidopropyl Betaine", "PEG-80 Sorbitan Laurate", "Sodium Trideceth Sulfate", "PEG-150 Distearate", "Glycerin", "Polyquaternium-10", "Tetrasodium EDTA", "Quaternium-15", "Citric Acid", "Fragrance", "Yellow 10", "Orange 4"] },
  { product_name: "Aveeno Baby Daily Moisture Lotion", brand: "Aveeno", category: "Baby Care", description: "Fragrance-free baby lotion with natural colloidal oatmeal", ingredients: ["Water", "Glycerin", "Distearyldimonium Chloride", "Petrolatum", "Isopropyl Palmitate", "Cetyl Alcohol", "Avena Sativa Kernel Flour", "Benzyl Alcohol", "Sodium Chloride"] },
  { product_name: "Aquaphor Baby Healing Ointment", brand: "Aquaphor", category: "Baby Care", description: "Multi-purpose baby healing ointment", ingredients: ["Petrolatum", "Mineral Oil", "Ceresin", "Lanolin Alcohol", "Panthenol", "Glycerin", "Bisabolol"] },

  // Deodorants & Body Care
  { product_name: "Dove Advanced Care Antiperspirant", brand: "Dove", category: "Deodorant", description: "48-hour antiperspirant with moisturizers", ingredients: ["Aluminum Zirconium Tetrachlorohydrex Gly", "Cyclopentasiloxane", "PPG-14 Butyl Ether", "Stearyl Alcohol", "C12-15 Alkyl Benzoate", "Hydrogenated Castor Oil", "PEG-8 Distearate", "Fragrance", "Helianthus Annuus Seed Oil", "BHT"] },
  { product_name: "Native Deodorant", brand: "Native", category: "Deodorant", description: "Aluminum-free natural deodorant", ingredients: ["Caprylic/Capric Triglyceride", "Tapioca Starch", "Ozokerite", "Sodium Bicarbonate", "Magnesium Hydroxide", "Cocos Nucifera Oil", "Cyclodextrin", "Helianthus Annuus Seed Oil", "Dextrose", "Butyrospermum Parkii Butter", "Tocopherol", "Fragrance"] },
  { product_name: "Nivea Essentially Enriched Body Lotion", brand: "Nivea", category: "Body Lotion", description: "48-hour moisture for very dry skin", ingredients: ["Water", "Glycerin", "Urea", "Isohexadecane", "Cetearyl Alcohol", "Caprylic/Capric Triglyceride", "Helianthus Annuus Seed Oil", "Glyceryl Glucoside", "Dimethicone", "PEG-40 Stearate", "Glyceryl Stearate", "Carbomer", "Sodium Hydroxide", "Phenoxyethanol", "Methylparaben", "Propylparaben", "Fragrance"] },
  { product_name: "Eucerin Original Healing Cream", brand: "Eucerin", category: "Body Cream", description: "Rich moisturizing cream for very dry skin", ingredients: ["Water", "Petrolatum", "Mineral Oil", "Ceresin", "Lanolin Alcohol", "Phenoxyethanol", "Piroctone Olamine"] },
  { product_name: "Vaseline Intensive Care Deep Moisture Lotion", brand: "Vaseline", category: "Body Lotion", description: "Fast-absorbing lotion for dry skin", ingredients: ["Water", "Glycerin", "Stearic Acid", "Isopropyl Isostearate", "Glycol Stearate", "Petrolatum", "Glyceryl Stearate", "Dimethicone", "Stearamide AMP", "Tapioca Starch", "Cetyl Alcohol", "Magnesium Aluminum Silicate", "Stearyl Alcohol", "DMDM Hydantoin", "Fragrance", "Methylparaben", "Iodopropynyl Butylcarbamate", "Disodium EDTA", "Titanium Dioxide"] },

  // Acne & Treatment
  { product_name: "Paula's Choice 2% BHA Liquid Exfoliant", brand: "Paula's Choice", category: "Exfoliant", description: "Leave-on exfoliant with salicylic acid for unclogging pores", ingredients: ["Water", "Methylpropanediol", "Butylene Glycol", "Salicylic Acid", "Polysorbate 20", "Camellia Oleifera Leaf Extract", "Sodium Hydroxide", "Tetrasodium EDTA"] },
  { product_name: "Differin Adapalene Gel 0.1%", brand: "Differin", category: "Acne Treatment", description: "Prescription-strength retinoid acne treatment", ingredients: ["Active Ingredient: Adapalene 0.1%", "Inactive Ingredients: Carbomer 940", "Edetate Disodium", "Methylparaben", "Poloxamer 182", "Propylene Glycol", "Purified Water", "Sodium Hydroxide"] },
  { product_name: "Neutrogena Oil-Free Acne Wash", brand: "Neutrogena", category: "Acne Cleanser", description: "Salicylic acid acne treatment cleanser", ingredients: ["Active Ingredient: Salicylic Acid 2%", "Inactive Ingredients: Water", "Sodium C14-16 Olefin Sulfonate", "Cocamidopropyl Betaine", "Sodium Chloride", "PEG-80 Sorbitan Laurate", "C12-15 Alkyl Lactate", "Cocamidopropyl PG-Dimonium Chloride Phosphate", "Disodium EDTA", "Aloe Barbadensis Leaf Extract", "Anthemis Nobilis Flower Extract", "Chamomilla Recutita Extract", "Sodium Hydroxide", "Fragrance", "Ext. D&C Violet 2"] },
  { product_name: "La Roche-Posay Effaclar Duo", brand: "La Roche-Posay", category: "Acne Treatment", description: "Dual action acne treatment with benzoyl peroxide", ingredients: ["Active Ingredient: Benzoyl Peroxide 5.5%", "Inactive Ingredients: Water", "Glycerin", "Dimethicone", "Isocetyl Stearate", "Cyclohexasiloxane", "Niacinamide", "Silica", "PEG-100 Stearate", "Glyceryl Stearate", "Lactic Acid", "Cetyl Alcohol", "Poloxamer 338", "Sodium Hydroxide", "Xanthan Gum", "Caprylyl Glycol", "Tocopherol", "Disodium EDTA", "Capryloyl Glycine", "Panthenol"] },

  // Lip Care
  { product_name: "Burt's Bees Beeswax Lip Balm", brand: "Burt's Bees", category: "Lip Care", description: "100% natural moisturizing lip balm", ingredients: ["Cera Alba", "Cocos Nucifera Oil", "Helianthus Annuus Seed Oil", "Mentha Piperita Oil", "Lanolin", "Tocopheryl Acetate", "Rosmarinus Officinalis Leaf Extract", "Glycine Soja Oil", "Canola Oil", "Limonene"] },
  { product_name: "Aquaphor Lip Repair", brand: "Aquaphor", category: "Lip Care", description: "Immediate relief for severely dry lips", ingredients: ["Petrolatum", "Cera Microcristallina", "Ceresin", "Lanolin", "Glycerin", "Panthenol", "Bisabolol", "Castor Isostearate Succinate", "Shea Butter Ethyl Esters", "Octyldodecanol", "Euphorbia Cerifera Cera", "Ozokerite"] },
  { product_name: "Laneige Lip Sleeping Mask", brand: "Laneige", category: "Lip Care", description: "Leave-on overnight lip mask", ingredients: ["Diisostearyl Malate", "Hydrogenated Polyisobutene", "Phytosteryl Isostearyl Dimer Dilinoleate", "Hydrogenated Poly(C6-14 Olefin)", "Polyglyceryl-2 Triisostearate", "Synthetic Beeswax", "Shea Butter", "Murumuru Butter", "Microcrystalline Wax", "Astrocaryum Murumuru Seed Butter", "Cocos Nucifera Oil", "Sapindus Mukorossi Peel Extract", "Lactobacillus/Pear Juice Ferment Filtrate", "Beta-Glucan", "Ascorbyl Glucoside", "Tocopheryl Acetate", "Ethylhexyl Palmitate", "Sorbitan Sesquioleate", "Fragrance", "CI 15850"] },

  // Men's Grooming
  { product_name: "Gillette Fusion ProGlide Shaving Gel", brand: "Gillette", category: "Shaving", description: "Clear shave gel for sensitive skin", ingredients: ["Water", "Palmitic Acid", "Triethanolamine", "Isopentane", "Glycerin", "Sorbitol", "Stearic Acid", "Isobutane", "PEG-90M", "Myristic Acid", "PEG-23M", "PVP", "Menthol", "PEG-14M", "Fragrance"] },
  { product_name: "Nivea Men Sensitive Post Shave Balm", brand: "Nivea Men", category: "Aftershave", description: "Alcohol-free aftershave balm for sensitive skin", ingredients: ["Water", "Glycerin", "Isopropyl Palmitate", "Cetearyl Alcohol", "Octyldodecanol", "Chamomilla Recutita Flower Extract", "Tocopheryl Acetate", "Glycyrrhiza Inflata Root Extract", "Panthenol", "PEG-40 Stearate", "Glyceryl Stearate", "Carbomer", "Potassium Cetyl Phosphate", "Ethylhexylglycerin", "Sodium Hydroxide", "Phenoxyethanol", "Fragrance"] },
  { product_name: "Jack Black Double-Duty Face Moisturizer SPF 20", brand: "Jack Black", category: "Men's Moisturizer", description: "Lightweight facial moisturizer with sun protection", ingredients: ["Active Ingredients: Avobenzone 2.7%, Octinoxate 7.5%, Oxybenzone 4%", "Inactive Ingredients: Water", "Glycerin", "C12-15 Alkyl Benzoate", "Butylene Glycol", "Niacinamide", "Dimethicone", "Polyglyceryl-3 Methylglucose Distearate", "Glyceryl Stearate", "PEG-100 Stearate", "Cetearyl Alcohol", "Cyclomethicone", "Polysorbate 60", "Camellia Sinensis Leaf Extract", "Chamomilla Recutita Flower Extract", "Glycyrrhiza Glabra Root Extract", "Tocopheryl Acetate", "Carbomer", "Aminomethyl Propanol", "Disodium EDTA", "Phenoxyethanol", "Ethylhexylglycerin"] },

  // Dr. Hauschka Products
  { product_name: "Dr. Hauschka Rose Day Cream", brand: "Dr. Hauschka", category: "Moisturizer", description: "Calming, protecting face cream for sensitive skin", ingredients: ["Water", "Rosa Damascena Flower Extract", "Prunus Amygdalus Dulcis Oil", "Avocado Oil", "Shea Butter", "Beeswax", "Jojoba Oil", "Cetearyl Glucoside", "Rosa Damascena Flower Wax", "Rosa Damascena Flower Oil", "Xanthan Gum", "Fragrance"] },
  { product_name: "Dr. Hauschka Cleansing Cream", brand: "Dr. Hauschka", category: "Cleanser", description: "Gentle, creamy facial cleanser", ingredients: ["Water", "Prunus Amygdalus Dulcis Oil", "Cetearyl Alcohol", "Anthyllis Vulneraria Extract", "Chamomilla Recutita Flower Extract", "Calendula Officinalis Flower Extract", "Kaolin", "Bentonite", "Beeswax", "Fragrance", "Limonene", "Linalool", "Citronellol", "Geraniol"] },
  { product_name: "Dr. Hauschka Soothing Cleansing Milk", brand: "Dr. Hauschka", category: "Cleanser", description: "Gentle cleansing milk for sensitive and dry skin", ingredients: ["Water", "Sesamum Indicum Seed Oil", "Alcohol", "Prunus Amygdalus Dulcis Oil", "Anthyllis Vulneraria Extract", "Arachis Hypogaea Oil", "Glycerin", "Beeswax", "Cetearyl Glucoside", "Xanthan Gum", "Fragrance"] },
  { product_name: "Dr. Hauschka Revitalising Day Cream", brand: "Dr. Hauschka", category: "Moisturizer", description: "Moisturizing day cream for mature skin", ingredients: ["Water", "Macadamia Ternifolia Seed Oil", "Alcohol", "Ricinus Communis Seed Oil", "Glycerin", "Simmondsia Chinensis Seed Oil", "Beeswax", "Carthamus Tinctorius Seed Oil", "Cetearyl Glucoside", "Panax Ginseng Root Extract", "Bryophyllum Pinnatum Leaf Extract", "Xanthan Gum", "Fragrance", "Limonene", "Linalool", "Citronellol", "Geraniol"] },
];

const REGIONS = [
  { id: 'EU', name: 'European Union (EU)', regulations: ['REACH', 'CLP', 'EU Cosmetics Regulation'] },
  { id: 'USA', name: 'United States (All Federal & State)', regulations: ['FDA', 'EPA', 'TSCA', 'CPSC', 'OSHA', 'Prop 65', 'ASTM', 'FD&C Act'] },
  { id: 'Canada', name: 'Canada', regulations: ['WHMIS', 'CEPA', 'Health Canada', 'Cosmetic Regulations'] },
  { id: 'Global_GHS', name: 'Global (GHS)', regulations: ['GHS', 'OECD Guidelines'] },
  { id: 'Asia_Pacific', name: 'Asia Pacific', regulations: ['China NMPA', 'Japan PMDA', 'Korea MFDS'] },
];

const NewComplianceCheck = ({ onBack, onComplete }) => {
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [extractedIngredients, setExtractedIngredients] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [isAnalyzingCompliance, setIsAnalyzingCompliance] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [documentContext, setDocumentContext] = useState('');
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.compliance_preferences?.default_regions) {
        setSelectedRegions(user.compliance_preferences.default_regions);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (productSearch.trim().length > 0) {
      // Instant search - only 100ms debounce for typing
      timeoutRef.current = setTimeout(() => {
        searchProducts(productSearch);
      }, 100);
    } else {
      setProductSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [productSearch]);

  const searchProducts = (query) => {
    setIsSearching(true);
    setShowSuggestions(true);

    const searchLower = query.toLowerCase().trim();

    // Instant local search
    const results = PRODUCT_DATABASE.filter(product => {
      const searchFields = [
        product.product_name,
        product.brand,
        product.category,
        product.description,
        ...product.ingredients
      ].join(' ').toLowerCase();

      return searchFields.includes(searchLower);
    });

    setProductSuggestions(results);
    setIsSearching(false);
  };

  const handleSelectProduct = (product) => {
    // Close suggestions first to prevent UI glitch
    setShowSuggestions(false);

    // Then update state
    setTimeout(() => {
      setSelectedProduct(product);
      setProductSearch(`${product.brand} ${product.product_name}`);

      if (product.ingredients && product.ingredients.length > 0) {
        setExtractedIngredients(product.ingredients);
      }
    }, 50);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploadingFile(true);
    setError(null);

    try {
      const uploadedFileData = [];
      
      for (const file of files) {
        // Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        // Try to extract data from the file
        try {
          const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' } },
                hazard_information: { type: 'string' },
                regulatory_info: { type: 'string' },
                cas_numbers: { type: 'array', items: { type: 'string' } }
              }
            }
          });

          if (extractResult.status === 'success' && extractResult.output) {
            const data = extractResult.output;
            
            // Add extracted ingredients
            if (data.ingredients && Array.isArray(data.ingredients)) {
              setExtractedIngredients(prev => [...new Set([...prev, ...data.ingredients])]);
            }
            
            // Build document context
            let context = `Document: ${file.name}\n`;
            if (data.product_name) context += `Product: ${data.product_name}\n`;
            if (data.hazard_information) context += `Hazards: ${data.hazard_information}\n`;
            if (data.regulatory_info) context += `Regulatory: ${data.regulatory_info}\n`;
            if (data.cas_numbers) context += `CAS Numbers: ${data.cas_numbers.join(', ')}\n`;
            
            setDocumentContext(prev => prev + '\n' + context);
            
            uploadedFileData.push({
              name: file.name,
              url: file_url,
              extracted: true
            });
          } else {
            uploadedFileData.push({
              name: file.name,
              url: file_url,
              extracted: false
            });
          }
        } catch (extractError) {
          console.log('Could not extract data from file, but uploaded successfully');
          uploadedFileData.push({
            name: file.name,
            url: file_url,
            extracted: false
          });
        }
      }
      
      setUploadedFiles(prev => [...prev, ...uploadedFileData]);
    } catch (err) {
      setError(`Failed to upload files: ${err.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRegion = (regionId) => {
    setSelectedRegions(prev =>
      prev.includes(regionId) ? prev.filter(id => id !== regionId) : [...prev, regionId]
    );
  };

  const handleAnalyzeCompliance = async () => {
    if (extractedIngredients.length === 0) {
      setError('No ingredients found for analysis. Please select a product first.');
      return;
    }
    if (selectedRegions.length === 0) {
      setError('Please select at least one target market region.');
      return;
    }

    setIsAnalyzingCompliance(true);
    setError(null);

    try {
      // Fetch real-time regulatory data from external databases
      let regulatoryContext = '';
      try {
        const regDataResponse = await base44.functions.invoke('fetchRegulatoryData', {
          ingredients: extractedIngredients,
          regions: selectedRegions
        });
        
        if (regDataResponse.data?.success && regDataResponse.data?.data) {
          const regData = regDataResponse.data.data;
          regulatoryContext = `\n\nREAL-TIME REGULATORY DATABASE RESULTS:\n${regData.map(item => {
            let info = `- ${item.ingredient}: Status=${item.status}`;
            if (item.sources.length > 0) info += `, Sources: ${item.sources.join(', ')}`;
            if (item.restrictions.length > 0) {
              info += `\n  Restrictions: ${item.restrictions.map(r => `${r.region}: ${r.type} - ${r.details}`).join('; ')}`;
            }
            if (item.pubchem_data) {
              info += `\n  Chemical: ${item.pubchem_data.IUPACName || 'N/A'}, Formula: ${item.pubchem_data.MolecularFormula || 'N/A'}`;
            }
            return info;
          }).join('\n')}`;
        }
      } catch (regErr) {
        console.log('Regulatory database fetch completed with partial data:', regErr.message);
      }

      const ingredientsList = extractedIngredients.join(', ');
      const regionsStr = selectedRegions.map(rId => {
        const region = REGIONS.find(r => r.id === rId);
        return region ? `${region.name} - Regulations: ${region.regulations.join(', ')}` : rId;
      }).join('; ');

      const productInfo = selectedProduct 
        ? `${selectedProduct.brand} ${selectedProduct.product_name} (${selectedProduct.category})`
        : 'Selected Product';

      const documentInfo = documentContext ? `\n\nADDITIONAL DOCUMENT CONTEXT:\n${documentContext}` : '';
      
      const prompt = `You are a regulatory compliance expert with predictive analysis capabilities. Analyze these ingredients for regulatory compliance.
${regulatoryContext}${documentInfo}

Product: ${productInfo}
Ingredients: ${ingredientsList}
Target Markets: ${regionsStr}

For EACH ingredient listed, provide a detailed compliance analysis. You must analyze ALL ingredients.

ADDITIONALLY, provide predictive insights:
1. Analyze current regulatory trends in the selected markets
2. Predict potential future regulatory changes (next 1-3 years)
3. Identify ingredients that may face increased scrutiny
4. Provide proactive recommendations to future-proof the formula

Provide a comprehensive JSON response with:
1. A summary of overall compliance status
2. The regions you checked
3. Detailed analysis for EACH ingredient including:
   - Compliance status (Compliant/Restricted/Banned/Requires Warning)
   - Specific regulatory details and restrictions
   - Actionable recommendations
4. Predictive insights including:
   - Emerging regulatory trends
   - Potential future restrictions
   - Proactive formulation recommendations
   - Timeline for potential changes

CRITICAL: Ensure compliance_details array has an entry for EVERY ingredient provided.`;

      const responseSchema = {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          checked_regions: { type: 'array', items: { type: 'string' } },
          compliance_details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ingredient: { type: 'string' },
                status: { type: 'string', enum: ['Compliant', 'Restricted', 'Banned', 'Requires Warning', 'Unknown'] },
                details: { type: 'string' },
                recommendation: { type: 'string' }
              },
              required: ['ingredient', 'status', 'details', 'recommendation']
            }
          },
          predictive_insights: {
            type: 'object',
            properties: {
              emerging_trends: { type: 'array', items: { type: 'string' } },
              potential_restrictions: { type: 'array', items: { 
                type: 'object',
                properties: {
                  ingredient: { type: 'string' },
                  risk_level: { type: 'string' },
                  timeline: { type: 'string' },
                  rationale: { type: 'string' }
                }
              }},
              proactive_recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['summary', 'checked_regions', 'compliance_details']
      };

      const aiResult = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: responseSchema,
        add_context_from_internet: true
      });

      const validatedResult = {
        summary: aiResult.summary || 'Compliance analysis completed. Review ingredient details below.',
        checked_regions: Array.isArray(aiResult.checked_regions) && aiResult.checked_regions.length > 0
          ? aiResult.checked_regions 
          : selectedRegions.map(rId => REGIONS.find(r => r.id === rId)?.name || rId),
        compliance_details: []
      };

      if (Array.isArray(aiResult.compliance_details) && aiResult.compliance_details.length > 0) {
        validatedResult.compliance_details = aiResult.compliance_details
          .filter(detail => detail && detail.ingredient)
          .map(detail => ({
            ingredient: detail.ingredient,
            status: detail.status || 'Unknown',
            details: detail.details || 'Review regulatory requirements for this ingredient.',
            recommendation: detail.recommendation || 'Consult regulatory specialist for detailed guidance.'
          }));
      }

      if (validatedResult.compliance_details.length < extractedIngredients.length) {
        const analyzedIngredients = new Set(
          validatedResult.compliance_details.map(d => d.ingredient.toLowerCase())
        );
        
        extractedIngredients.forEach(ing => {
          if (!analyzedIngredients.has(ing.toLowerCase())) {
            validatedResult.compliance_details.push({
              ingredient: ing,
              status: 'Unknown',
              details: `Regulatory status for ${ing} requires verification against ${selectedRegions.length} selected market(s).`,
              recommendation: 'Verify ingredient approval status in target markets.'
            });
          }
        });
      }

      if (validatedResult.compliance_details.length === 0) {
        validatedResult.compliance_details = extractedIngredients.map(ing => ({
          ingredient: ing,
          status: 'Unknown',
          details: `Compliance analysis in progress for ${ing}.`,
          recommendation: 'Please verify this ingredient against regulatory requirements.'
        }));
      }

      await base44.entities.ComplianceCheck.create({
        product_name: selectedProduct?.product_name || 'Unknown Product',
        product_brand: selectedProduct?.brand,
        product_category: selectedProduct?.category,
        ingredients: extractedIngredients,
        selected_regions: selectedRegions,
        summary: validatedResult.summary,
        checked_regions: validatedResult.checked_regions,
        compliance_details: validatedResult.compliance_details,
        overall_status: validatedResult.compliance_details.some(d => d.status === 'Banned') ? 'Restricted' : 
                       validatedResult.compliance_details.some(d => d.status === 'Restricted') ? 'Restricted' :
                       validatedResult.compliance_details.some(d => d.status === 'Requires Warning') ? 'Requires Review' : 'Compliant',
        predictive_insights: validatedResult.predictive_insights || null,
        uploaded_documents: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.name).join(', ') : null
      });

      // Award 25 points for completing a compliance check
      try {
        const currentUser = await base44.auth.me();
        const currentPoints = currentUser.reward_points || 0;
        await base44.auth.updateMe({ reward_points: currentPoints + 25 });
      } catch (pointsErr) {
        console.log('Points update skipped:', pointsErr.message);
      }

      setResult(validatedResult);
    } catch (err) {
      console.error('Compliance analysis failed:', err);
      setError(`Compliance analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzingCompliance(false);
    }
  };

  if (result) {
    return <ComplianceResultDisplay result={result} onBack={() => { setResult(null); onBack(); }} productName={selectedProduct ? `${selectedProduct.brand} ${selectedProduct.product_name}` : 'Product'} />;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-slate-100">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <Card className="border-0 shadow-xl overflow-visible max-w-5xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">AI Compliance Co-Pilot</CardTitle>
              <CardDescription className="text-white/90 text-sm">Search products and analyze regulatory compliance</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-3 relative" ref={searchRef}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-semibold text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Product Search
              </label>
              <Badge variant="outline" className="text-xs self-start sm:self-auto">AI-Powered</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Input 
                value={productSearch} 
                onChange={e => setProductSearch(e.target.value)}
                onFocus={() => productSuggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for products... e.g., 'Head & Shoulders shampoo'"
                className="text-base border-2 border-slate-200 focus:border-purple-400 rounded-xl pl-12 pr-12 py-6 font-normal"
                disabled={isAnalyzingCompliance}
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-purple-600 pointer-events-none z-10" />
              )}
            </div>

            <AnimatePresence>
              {showSuggestions && productSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-purple-200 rounded-2xl shadow-2xl max-h-[28rem] overflow-y-auto z-50 overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {productSuggestions.map((product, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectProduct(product)}
                      className="p-4 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors active:bg-purple-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          <Package className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base text-slate-900 mb-1 leading-tight">
                            {product.product_name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className="bg-purple-600 text-white text-xs font-semibold px-2.5 py-0.5">
                              {product.brand}
                            </Badge>
                            <Badge variant="outline" className="text-purple-700 border-purple-300 text-xs font-medium px-2.5 py-0.5">
                              {product.category}
                            </Badge>
                          </div>
                          {product.description && (
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <FlaskConical className="w-4 h-4" />
                            <span className="text-sm font-semibold">{product.ingredients?.length || 0} ingredients</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2">
                    {selectedProduct.product_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-purple-600 text-white font-semibold">{selectedProduct.brand}</Badge>
                    <Badge variant="outline" className="text-purple-700 border-purple-300 font-medium">{selectedProduct.category}</Badge>
                  </div>
                  {selectedProduct.description && (
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{selectedProduct.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Document Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Documentation
              </label>
              <Badge variant="outline" className="text-xs">SDS Sheets, PDFs</Badge>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile || isAnalyzingCompliance}
              className="w-full border-2 border-dashed border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 py-6"
            >
              {isUploadingFile ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading & Analyzing...</>
              ) : (
                <><Upload className="w-5 h-5 mr-2" /> Upload Product Documentation</>
              )}
            </Button>

            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{file.name}</p>
                        {file.extracted && (
                          <Badge className="bg-green-100 text-green-700 text-xs mt-1">Data Extracted</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}

            <p className="text-xs text-slate-500">
              Upload SDS sheets or product documentation for enhanced analysis with extracted ingredient data
            </p>
          </div>

          <AnimatePresence>
            {extractedIngredients.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200"
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <FlaskConical className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Product Ingredients</h3>
                  <Badge className="bg-blue-600 text-white font-semibold">{extractedIngredients.length} Identified</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedIngredients.map((ingredient, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="px-3 py-1.5 text-sm bg-white border-2 border-blue-300 text-blue-900 hover:bg-blue-50 font-medium"
                    >
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Target Market Regions
              </h3>
              {selectedRegions.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {selectedRegions.length} selected
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGIONS.map(region => (
                <motion.div 
                  key={region.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleRegion(region.id)} 
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedRegions.includes(region.id) 
                      ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 shadow-md' 
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedRegions.includes(region.id) 
                      ? <CheckSquare className="w-6 h-6 text-indigo-600 flex-shrink-0" /> 
                      : <Square className="w-6 h-6 text-slate-300 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm leading-tight">{region.name}</div>
                      <p className="text-xs text-slate-600 mt-1">{region.regulations.join(', ')}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm flex-1">{error}</p>
            </motion.div>
          )}

          <Button 
            onClick={handleAnalyzeCompliance} 
            disabled={isAnalyzingCompliance || extractedIngredients.length === 0 || selectedRegions.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
          >
            {isAnalyzingCompliance ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing {selectedRegions.length} Region{selectedRegions.length !== 1 ? 's' : ''}...</>
            ) : (
              <><ShieldCheck className="w-5 h-5 mr-2" /> Run Compliance Analysis</>
            )}
          </Button>

          {!selectedProduct && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm leading-relaxed">
                    <li>Search for any commercial product by name or brand</li>
                    <li>Select a product from the suggestions to view ingredients</li>
                    <li>Optionally upload SDS sheets or documentation for deeper analysis</li>
                    <li>Choose your target market regions for compliance checking</li>
                    <li>Get detailed regulatory analysis with predictive insights</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-2">Predictive Analysis:</p>
                  <p className="text-xs leading-relaxed">
                    Our AI analyzes current regulatory trends to predict potential future changes, helping you stay ahead of compliance requirements and proactively reformulate products.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NewComplianceCheck;