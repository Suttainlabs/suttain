import React from "react";

/**
 * Decorative inline SVG of organic chemistry skeletal structures
 * (benzene rings, naphthalene, purine/caffeine-type ring systems)
 * rendered as thin line art behind the homepage hero content.
 *
 * - pointer-events: none, z-index below content
 * - non-repeating composed arrangement
 * - hidden on screens < 768px to avoid crowding text
 */
export default function HeroMoleculeBackground() {
  const purple = "#6B3FA0";
  const teal = "#007850";
  const stroke = 1.5;

  // Shared style for all structure groups
  const common = {
    fill: "none",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 hidden md:block"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        style={{ opacity: 0.1 }}
      >
        {/* ── Benzene ring — upper left, small, rotated ── */}
        <g transform="translate(80,90) rotate(-15)" stroke={teal} {...common}>
          <polygon points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17" />
          {/* inner double-bond lines */}
          <line x1="-22" y1="-13" x2="-22" y2="13" />
          <line x1="22" y1="-13" x2="22" y2="13" />
          <line x1="-18" y1="-29" x2="18" y2="-29" />
        </g>

        {/* ── Naphthalene (fused bicyclic) — far left edge, large, bleeding off ── */}
        <g transform="translate(-20,420) rotate(12)" stroke={purple} {...common}>
          {/* left ring */}
          <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" />
          {/* right ring (shares right edge) */}
          <polygon points="70,-40 105,-20 105,20 70,40 35,20 35,-20" />
          {/* double bonds left ring */}
          <line x1="-27" y1="-15" x2="-27" y2="15" />
          <line x1="-22" y1="-34" x2="22" y2="-34" />
          {/* double bonds right ring */}
          <line x1="77" y1="-15" x2="77" y2="15" />
          <line x1="82" y1="-34" x2="120" y2="-15" />
          <line x1="82" y1="34" x2="120" y2="15" />
        </g>

        {/* ── Caffeine / purine-type ring system — lower left ── */}
        <g transform="translate(120,560) rotate(-8)" stroke={teal} {...common}>
          {/* fused 6-membered + 5-membered ring (purine skeleton) */}
          {/* 6-membered ring */}
          <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" />
          {/* 5-membered ring fused on right side */}
          <polygon points="52,-15 72,-28 92,-8 78,14 52,15" />
          {/* double bonds in 6-ring */}
          <line x1="-19" y1="-11" x2="-19" y2="11" />
          <line x1="19" y1="-11" x2="19" y2="11" />
          {/* double bond in 5-ring */}
          <line x1="58" y1="-8" x2="74" y2="-20" />
          {/* methyl substituent bond */}
          <line x1="0" y1="-30" x2="-10" y2="-50" />
          <text x="-20" y="-48" fontSize="9" fill={teal} stroke="none" fontWeight="600">CH₃</text>
          {/* N labels */}
          <text x="48" y="-12" fontSize="8" fill={teal} stroke="none" fontWeight="700">N</text>
          <text x="88" y="-4" fontSize="8" fill={teal} stroke="none" fontWeight="700">N</text>
          <text x="-4" y="4" fontSize="8" fill={teal} stroke="none" fontWeight="700">N</text>
          {/* O label (carbonyl) */}
          <line x1="-26" y1="15" x2="-42" y2="28" />
          <text x="-52" y="32" fontSize="8" fill={teal} stroke="none" fontWeight="700">O</text>
        </g>

        {/* ── Single benzene ring — lower left-center, medium ── */}
        <g transform="translate(300,620) rotate(20)" stroke={purple} {...common}>
          <polygon points="0,-26 22,-13 22,13 0,26 -22,13 -22,-13" />
          <line x1="-16" y1="-10" x2="-16" y2="10" />
          <line x1="16" y1="-10" x2="16" y2="10" />
          <line x1="-13" y1="-22" x2="13" y2="-22" />
        </g>

        {/* ── Fused bicyclic (indole-type) — right side, large ── */}
        <g transform="translate(1180,140) rotate(18)" stroke={teal} {...common}>
          {/* 6-membered ring */}
          <polygon points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19" />
          {/* 5-membered ring fused on left */}
          <polygon points="-66,-19 -88,-2 -78,28 -46,19 -33,19 -33,-19" />
          {/* double bonds 6-ring */}
          <line x1="-25" y1="-14" x2="-25" y2="14" />
          <line x1="25" y1="-14" x2="25" y2="14" />
          <line x1="-20" y1="-32" x2="20" y2="-32" />
          {/* N label in 5-ring */}
          <text x="-92" y="-6" fontSize="9" fill={teal} stroke="none" fontWeight="700">N</text>
          {/* bond from N */}
          <line x1="-88" y1="-2" x2="-104" y2="-14" />
          <text x="-118" y="-12" fontSize="8" fill={teal} stroke="none" fontWeight="600">H</text>
        </g>

        {/* ── Caffeine/purine variant — lower right, medium ── */}
        <g transform="translate(1230,500) rotate(-12)" stroke={purple} {...common}>
          <polygon points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14" />
          <polygon points="48,-14 67,-26 86,-7 73,13 48,14" />
          <line x1="-18" y1="-10" x2="-18" y2="10" />
          <line x1="18" y1="-10" x2="18" y2="10" />
          <line x1="54" y1="-7" x2="69" y2="-19" />
          {/* N + O labels */}
          <text x="44" y="-11" fontSize="8" fill={purple} stroke="none" fontWeight="700">N</text>
          <text x="82" y="-3" fontSize="8" fill={purple} stroke="none" fontWeight="700">N</text>
          <text x="-4" y="3" fontSize="8" fill={purple} stroke="none" fontWeight="700">N</text>
          <line x1="-24" y1="14" x2="-40" y2="26" />
          <text x="-50" y="30" fontSize="8" fill={purple} stroke="none" fontWeight="700">O</text>
          <line x1="0" y1="-28" x2="-8" y2="-46" />
          <text x="-18" y="-44" fontSize="8" fill={purple} stroke="none" fontWeight="600">CH₃</text>
        </g>

        {/* ── Small benzene ring — far right edge, bleeding off ── */}
        <g transform="translate(1420,380) rotate(-25)" stroke={teal} {...common}>
          <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" />
          <line x1="-20" y1="-11" x2="-20" y2="11" />
          <line x1="20" y1="-11" x2="20" y2="11" />
          <line x1="-16" y1="-26" x2="16" y2="-26" />
        </g>

        {/* ── Small single ring — upper right ── */}
        <g transform="translate(1100,60) rotate(8)" stroke={purple} {...common}>
          <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" />
          <line x1="-14" y1="-8" x2="-14" y2="8" />
          <line x1="14" y1="-8" x2="14" y2="8" />
        </g>

        {/* ── Benzene with O substituent — lower right corner ── */}
        <g transform="translate(980,640) rotate(15)" stroke={teal} {...common}>
          <polygon points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12" />
          <line x1="-16" y1="-9" x2="-16" y2="9" />
          <line x1="16" y1="-9" x2="16" y2="9" />
          <line x1="0" y1="-24" x2="0" y2="-42" />
          <text x="-5" y="-46" fontSize="9" fill={teal} stroke="none" fontWeight="700">O</text>
          <line x1="0" y1="-42" x2="14" y2="-52" />
        </g>
      </svg>
    </div>
  );
}