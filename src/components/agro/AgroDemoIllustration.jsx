import React from 'react';

export default function AgroDemoIllustration() {
  return (
    <svg
      viewBox="0 0 600 340"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="AgroPocket workflow illustration showing a farmer using AI advisery tools on a phone"
    >
      {/* Background */}
      <rect width="600" height="340" fill="#F5F1E8" />

      {/* Sun */}
      <circle cx="520" cy="60" r="28" fill="#D4A017" opacity="0.3" />
      <circle cx="520" cy="60" r="18" fill="#D4A017" opacity="0.6" />

      {/* Rolling hills */}
      <path d="M0 260 Q150 220 300 250 T600 240 L600 340 L0 340 Z" fill="#4A7C2A" opacity="0.15" />
      <path d="M0 280 Q200 250 400 275 T600 270 L600 340 L0 340 Z" fill="#4A7C2A" opacity="0.25" />

      {/* Crop rows */}
      <g opacity="0.3">
        <line x1="80" y1="290" x2="120" y2="290" stroke="#4A7C2A" strokeWidth="2" />
        <line x1="140" y1="295" x2="180" y2="295" stroke="#4A7C2A" strokeWidth="2" />
        <line x1="200" y1="290" x2="240" y2="290" stroke="#4A7C2A" strokeWidth="2" />
      </g>

      {/* Phone outline */}
      <g transform="translate(210, 70)">
        {/* Phone body */}
        <rect x="0" y="0" width="180" height="200" rx="20" fill="#2D5016" />
        <rect x="6" y="6" width="168" height="188" rx="16" fill="#FFFFFF" />
        {/* Notch */}
        <rect x="70" y="10" width="40" height="5" rx="2.5" fill="#2D5016" />

        {/* Chat bubble 1 — user */}
        <g transform="translate(16, 30)">
          <rect x="0" y="0" width="100" height="28" rx="14" fill="#EBE6D6" />
          <text x="50" y="18" textAnchor="middle" fontSize="9" fill="#5B7553" fontFamily="sans-serif">My tomato leaves...</text>
        </g>

        {/* Chat bubble 2 — AI response */}
        <g transform="translate(16, 68)">
          <rect x="0" y="0" width="130" height="36" rx="14" fill="#4A7C2A" />
          <text x="65" y="15" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontFamily="sans-serif">Early blight detected.</text>
          <text x="65" y="27" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontFamily="sans-serif">Apply copper fungicide.</text>
        </g>

        {/* Mini chart */}
        <g transform="translate(16, 116)">
          <rect x="0" y="0" width="148" height="50" rx="8" fill="#F5F1E8" />
          <text x="8" y="14" fontSize="7" fill="#8B6F47" fontFamily="sans-serif" fontWeight="bold">YIELD (kg)</text>
          <rect x="10" y="30" width="12" height="12" fill="#4A7C2A" rx="2" />
          <rect x="28" y="24" width="12" height="18" fill="#4A7C2A" rx="2" />
          <rect x="46" y="18" width="12" height="24" fill="#4A7C2A" rx="2" />
          <rect x="64" y="22" width="12" height="20" fill="#4A7C2A" rx="2" />
          <rect x="82" y="14" width="12" height="28" fill="#4A7C2A" rx="2" />
          <rect x="100" y="10" width="12" height="32" fill="#4A7C2A" rx="2" />
          <rect x="118" y="8" width="12" height="34" fill="#D4A017" rx="2" />
        </g>

        {/* Nav dots */}
        <circle cx="65" cy="180" r="3" fill="#4A7C2A" />
        <circle cx="80" cy="180" r="3" fill="#D4C5B0" />
        <circle cx="95" cy="180" r="3" fill="#D4C5B0" />
        <circle cx="110" cy="180" r="3" fill="#D4C5B0" />
      </g>

      {/* Farmer figure */}
      <g transform="translate(90, 160)">
        {/* Hat */}
        <ellipse cx="30" cy="8" rx="24" ry="6" fill="#8B6F47" />
        <path d="M18 8 Q30 -8 42 8" fill="#8B6F47" />
        {/* Head */}
        <circle cx="30" cy="20" r="8" fill="#D4A017" opacity="0.6" />
        {/* Body */}
        <path d="M20 28 Q20 50 18 70 L42 70 Q40 50 40 28 Z" fill="#4A7C2A" />
        {/* Arms */}
        <path d="M20 35 Q12 45 14 60" stroke="#4A7C2A" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M40 35 Q48 42 46 55" stroke="#4A7C2A" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>

      {/* Sprout icon accent */}
      <g transform="translate(430, 220)">
        <path d="M0 30 Q0 15 12 15" stroke="#4A7C2A" strokeWidth="2.5" fill="none" />
        <ellipse cx="12" cy="12" rx="8" ry="5" fill="#4A7C2A" transform="rotate(-30 12 12)" />
        <ellipse cx="8" cy="18" rx="8" ry="5" fill="#4A7C2A" transform="rotate(30 8 18)" />
        <line x1="0" y1="30" x2="0" y2="40" stroke="#8B6F47" strokeWidth="2" />
      </g>

      {/* Cloud icons */}
      <g transform="translate(100, 60)" opacity="0.4">
        <ellipse cx="0" cy="0" rx="22" ry="10" fill="#FFFFFF" />
        <circle cx="-12" cy="-2" r="8" fill="#FFFFFF" />
        <circle cx="10" cy="-4" r="10" fill="#FFFFFF" />
      </g>
    </svg>
  );
}