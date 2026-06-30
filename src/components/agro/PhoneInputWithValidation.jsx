import React, { useState, useEffect, useMemo } from 'react';
import { isValidPhoneNumber, getCountryCallingCode } from 'libphonenumber-js';
import { CheckCircle2, XCircle } from 'lucide-react';

// Postal code regex patterns mapped to ISO 3166-1 alpha-2 country codes
const POSTAL_PATTERNS = [
  { code: 'US', pattern: /^\d{5}(-\d{4})?$/ },
  { code: 'GB', pattern: /^(GIR\s?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW])\s?[0-9][ABD-HJLNP-UW-Z]{2})$/i },
  { code: 'IN', pattern: /^[1-9]\d{5}$/ },
  { code: 'CA', pattern: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVXY][ -]?\d[ABCEGHJKLMNPRSTVXY]\d$/i },
  { code: 'AU', pattern: /^\d{4}$/ },
  { code: 'DE', pattern: /^\d{5}$/ },
  { code: 'FR', pattern: /^\d{5}$/ },
  { code: 'ES', pattern: /^\d{5}$/ },
  { code: 'IT', pattern: /^\d{5}$/ },
  { code: 'NL', pattern: /^\d{4}\s?[A-Z]{2}$/i },
  { code: 'KE', pattern: /^\d{5}$/ },
  { code: 'NG', pattern: /^\d{6}$/ },
  { code: 'ZA', pattern: /^\d{4}$/ },
  { code: 'BR', pattern: /^\d{5}-?\d{3}$/ },
  { code: 'MX', pattern: /^\d{5}$/ },
  { code: 'JP', pattern: /^\d{3}-\d{4}$/ },
  { code: 'PH', pattern: /^\d{4}$/ },
];

// Countries to try via zippopotam.us when postal code is ambiguous (e.g. 5-digit codes)
const AMBIGUOUS_5 = ['US', 'DE', 'FR', 'ES', 'IT', 'MX', 'KE'];
const AMBIGUOUS_4 = ['AU', 'ZA', 'PH'];

async function detectCountryFromPostal(postalCode) {
  const pc = postalCode.trim();
  if (!pc) return null;

  const matches = POSTAL_PATTERNS.filter((p) => p.pattern.test(pc));
  const uniqueCodes = [...new Set(matches.map((m) => m.code))];

  if (uniqueCodes.length === 1) {
    return uniqueCodes[0];
  }

  // Disambiguate or find via zippopotam.us
  const codesToTry =
    uniqueCodes.length > 0
      ? uniqueCodes
      : pc.length === 5
        ? AMBIGUOUS_5
        : pc.length === 4
          ? AMBIGUOUS_4
          : AMBIGUOUS_5;

  for (const code of codesToTry) {
    try {
      const res = await fetch(
        `https://api.zippopotam.us/${code}/${encodeURIComponent(pc)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data['country abbreviation']) {
          return data['country abbreviation'];
        }
        return code;
      }
    } catch {
      // try next country
    }
  }

  return uniqueCodes[0] || null;
}

export default function PhoneInputWithValidation({
  phone,
  onPhoneChange,
  postalCode,
  onValidityChange,
}) {
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Debounced country detection from postal code
  useEffect(() => {
    let cancelled = false;
    const pc = (postalCode || '').trim();

    if (!pc || pc.length < 3) {
      setDetectedCountry(null);
      return;
    }

    const timer = setTimeout(() => {
      setDetecting(true);
      detectCountryFromPostal(pc).then((country) => {
        if (!cancelled) {
          setDetectedCountry(country);
          setDetecting(false);
        }
      });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [postalCode]);

  // Real-time phone validation
  const phoneStatus = useMemo(() => {
    const trimmedPhone = (phone || '').trim();
    if (!trimmedPhone) return { state: 'empty', valid: true };

    // International format (+ prefix) — no country needed
    if (trimmedPhone.startsWith('+')) {
      try {
        const valid = isValidPhoneNumber(trimmedPhone);
        return { state: valid ? 'valid' : 'invalid', valid };
      } catch {
        return { state: 'invalid', valid: false };
      }
    }

    // National format — requires detected country
    if (!detectedCountry) return { state: 'no-country', valid: false };

    try {
      const valid = isValidPhoneNumber(trimmedPhone, detectedCountry);
      return {
        state: valid ? 'valid' : 'invalid',
        valid,
        country: detectedCountry,
      };
    } catch {
      return { state: 'invalid', valid: false };
    }
  }, [phone, detectedCountry]);

  // Notify parent of validity
  useEffect(() => {
    onValidityChange?.(phoneStatus.valid);
  }, [phoneStatus.valid, onValidityChange]);

  const isInternational = (phone || '').trim().startsWith('+');
  const showPrefix = !isInternational && detectedCountry;
  let callingCode = null;
  if (showPrefix) {
    try {
      callingCode = getCountryCallingCode(detectedCountry);
    } catch {
      callingCode = null;
    }
  }

  const showStatus = (phone || '').trim().length > 0;

  return (
    <div>
      <div className="relative">
        {showPrefix && callingCode && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5B7553] pointer-events-none z-10">
            +{callingCode}
          </span>
        )}
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={`w-full ${
            showPrefix ? 'pl-12' : 'px-3'
          } py-2.5 pr-3 rounded-lg border min-h-[44px] text-[#2D5016] focus:outline-none focus:ring-2 ${
            showStatus
              ? phoneStatus.valid
                ? 'border-green-500 focus:ring-green-500'
                : 'border-red-400 focus:ring-red-400'
              : 'border-[#D4C5B0] focus:ring-[#4A7C2A]'
          }`}
          placeholder={
            detectedCountry || isInternational
              ? 'Phone number'
              : 'Enter postal code to enable phone'
          }
        />
      </div>

      {detecting && (
        <p className="mt-1 text-xs text-[#8B9D85]">
          Detecting country from postal code...
        </p>
      )}

      {showStatus && (
        <div className="mt-1.5 flex items-center gap-1.5 text-sm">
          {phoneStatus.valid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-green-600">
                Valid phone number
                {phoneStatus.country ? ` (${phoneStatus.country})` : ''}
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-500">
                {phoneStatus.state === 'no-country'
                  ? 'Enter postal code to validate'
                  : 'Invalid phone number'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}