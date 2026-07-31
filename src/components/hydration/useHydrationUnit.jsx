import { useState, useCallback } from 'react';

const ML_PER_OZ = 29.5735;

export function mlToOz(ml) {
    return Math.round((ml / ML_PER_OZ) * 10) / 10;
}

export function ozToMl(oz) {
    return Math.round(oz * ML_PER_OZ);
}

export function formatAmount(ml, unit) {
    if (unit === 'oz') return `${mlToOz(ml)} oz`;
    return `${ml} ml`;
}

export function useHydrationUnit() {
    const [unit, setUnitState] = useState(() => {
        return localStorage.getItem('hydration_unit') || 'ml';
    });

    const toggleUnit = useCallback(() => {
        setUnitState(prev => {
            const next = prev === 'ml' ? 'oz' : 'ml';
            localStorage.setItem('hydration_unit', next);
            return next;
        });
    }, []);

    return { unit, toggleUnit };
}