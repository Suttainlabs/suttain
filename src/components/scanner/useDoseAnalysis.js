import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export default function useDoseAnalysis(product) {
  const [analyses, setAnalyses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (analyses || loading) return;
    if (!product?.ingredients?.length) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('analyzeIngredientDoses', {
        ingredients: product.ingredients.map(i => ({ name: i.name, purpose: i.purpose })),
        product_name: product.name,
        category: product.category
      });
      setAnalyses(data?.analyses || []);
    } catch (err) {
      setError(err.message || 'Failed to load dose analysis');
    } finally {
      setLoading(false);
    }
  }, [product, analyses, loading]);

  const getAnalysis = useCallback((ingredientName) => {
    if (!analyses) return null;
    return analyses.find(a =>
      (a.ingredient_name || '').toLowerCase() === (ingredientName || '').toLowerCase()
    ) || null;
  }, [analyses]);

  return { analyses, loading, error, load, getAnalysis };
}