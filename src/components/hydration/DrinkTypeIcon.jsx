import { Droplets } from 'lucide-react';

const DRINK_LABELS = {
    water: 'Water',
    sparkling_water: 'Sparkling',
    herbal_tea: 'Herbal Tea',
    green_tea: 'Green Tea',
    coconut_water: 'Coconut',
    electrolyte_drink: 'Electrolyte',
    other: 'Other'
};

const DRINK_COLORS = {
    water: 'text-blue-500',
    sparkling_water: 'text-cyan-500',
    herbal_tea: 'text-amber-500',
    green_tea: 'text-green-500',
    coconut_water: 'text-emerald-500',
    electrolyte_drink: 'text-violet-500',
    other: 'text-slate-400'
};

export { DRINK_LABELS, DRINK_COLORS };

export default function DrinkTypeIcon({ type = 'water', size = 16 }) {
    const color = DRINK_COLORS[type] || 'text-blue-500';
    return <Droplets size={size} className={color} />;
}