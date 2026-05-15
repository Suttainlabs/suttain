import { useState, useEffect } from 'react';

const CURRENCY_MAP = {
  GB: { currency: 'gbp', symbol: '£', monthly: 3.99, yearly: 39.99, lifetime: 79.99, country: 'United Kingdom' },
  DE: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Germany' },
  FR: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'France' },
  IT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Italy' },
  ES: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Spain' },
  NL: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Netherlands' },
  BE: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Belgium' },
  AT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Austria' },
  PT: { currency: 'eur', symbol: '€', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Portugal' },
  SE: { currency: 'sek', symbol: 'kr', monthly: 52, yearly: 519, lifetime: 1049, country: 'Sweden' },
  NO: { currency: 'nok', symbol: 'kr', monthly: 54, yearly: 539, lifetime: 1079, country: 'Norway' },
  DK: { currency: 'dkk', symbol: 'kr', monthly: 34, yearly: 339, lifetime: 679, country: 'Denmark' },
  CH: { currency: 'chf', symbol: 'CHF', monthly: 4.59, yearly: 45.99, lifetime: 89.99, country: 'Switzerland' },
  PL: { currency: 'pln', symbol: 'zł', monthly: 19.99, yearly: 199, lifetime: 399, country: 'Poland' },
  AU: { currency: 'aud', symbol: 'A$', monthly: 7.99, yearly: 79.99, lifetime: 149.99, country: 'Australia' },
  NZ: { currency: 'nzd', symbol: 'NZ$', monthly: 8.49, yearly: 84.99, lifetime: 159.99, country: 'New Zealand' },
  JP: { currency: 'jpy', symbol: '¥', monthly: 749, yearly: 7499, lifetime: 14999, country: 'Japan' },
  SG: { currency: 'sgd', symbol: 'S$', monthly: 6.79, yearly: 67.99, lifetime: 134.99, country: 'Singapore' },
  HK: { currency: 'hkd', symbol: 'HK$', monthly: 38.99, yearly: 389, lifetime: 779, country: 'Hong Kong' },
  IN: { currency: 'inr', symbol: '₹', monthly: 399, yearly: 3999, lifetime: 7999, country: 'India' },
  MY: { currency: 'myr', symbol: 'RM', monthly: 21.99, yearly: 219, lifetime: 439, country: 'Malaysia' },
  PH: { currency: 'php', symbol: '₱', monthly: 279, yearly: 2799, lifetime: 5599, country: 'Philippines' },
  TH: { currency: 'thb', symbol: '฿', monthly: 175, yearly: 1749, lifetime: 3499, country: 'Thailand' },
  KR: { currency: 'krw', symbol: '₩', monthly: 6599, yearly: 65999, lifetime: 129999, country: 'South Korea' },
  CA: { currency: 'cad', symbol: 'CA$', monthly: 6.79, yearly: 67.99, lifetime: 134.99, country: 'Canada' },
  MX: { currency: 'mxn', symbol: 'MX$', monthly: 87.99, yearly: 879, lifetime: 1759, country: 'Mexico' },
  BR: { currency: 'brl', symbol: 'R$', monthly: 24.99, yearly: 249, lifetime: 499, country: 'Brazil' },
  AE: { currency: 'aed', symbol: 'AED', monthly: 18.39, yearly: 183.99, lifetime: 367.99, country: 'UAE' },
  SA: { currency: 'sar', symbol: 'SAR', monthly: 18.79, yearly: 187.99, lifetime: 375.99, country: 'Saudi Arabia' },
  ZA: { currency: 'zar', symbol: 'R', monthly: 90.99, yearly: 909, lifetime: 1819, country: 'South Africa' },
  NG: { currency: 'ngn', symbol: '₦', monthly: 3999, yearly: 39999, lifetime: 79999, country: 'Nigeria' },
  EG: { currency: 'egp', symbol: 'E£', monthly: 249, yearly: 2499, lifetime: 4999, country: 'Egypt' },
  KE: { currency: 'kes', symbol: 'KSh', monthly: 649, yearly: 6499, lifetime: 12999, country: 'Kenya' },
  DEFAULT: { currency: 'usd', symbol: '$', monthly: 4.99, yearly: 49.99, lifetime: 99.99, country: null },
};

export default function useLocalPricing() {
  const [pricing, setPricing] = useState(CURRENCY_MAP.DEFAULT);
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          const code = data.country_code?.toUpperCase();
          if (code && CURRENCY_MAP[code]) {
            setPricing(CURRENCY_MAP[code]);
            setCountryCode(code);
          }
        }
      } catch (_) {
        // fallback to USD
      } finally {
        setLoading(false);
      }
    }
    detect();
  }, []);

  const formatPrice = (amount) => {
    // For large integer currencies, no decimal
    const INTEGER_CURRENCIES = ['jpy', 'krw', 'idr', 'clp', 'gnf', 'pyg', 'rwf', 'ugx', 'xaf', 'xof', 'ngn', 'kes', 'egp', 'ars', 'cop'];
    if (INTEGER_CURRENCIES.includes(pricing.currency)) {
      return `${pricing.symbol}${Number(amount).toLocaleString()}`;
    }
    return `${pricing.symbol}${Number(amount).toFixed(2)}`;
  };

  return { pricing, countryCode, loading, formatPrice, CURRENCY_MAP };
}