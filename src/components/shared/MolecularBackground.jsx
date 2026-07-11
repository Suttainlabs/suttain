import React from 'react';

/**
 * Subtle molecular / hex-line background texture.
 * Renders a faint SVG pattern of outlined hexagons, connecting lines,
 * and small nodes — tinted in Suttain purple/teal at very low opacity.
 *
 * Usage: place inside any container with `relative` positioning.
 * <div className="relative">
 *   <MolecularBackground />
 *   ...content...
 * </div>
 */
export default function MolecularBackground({ className = '', opacity = 0.04 }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="suttain-molecular-pattern"
            x="0"
            y="0"
            width="140"
            height="121"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" strokeWidth="0.6">
              {/* Hexagon outlines */}
              <polygon
                points="70,0 105,20 105,60 70,80 35,60 35,20"
                stroke="#6B3FA0"
              />
              <polygon
                points="0,60 35,80 35,121 0,141 -35,121 -35,80"
                stroke="#6B3FA0"
                opacity="0.6"
              />
              <polygon
                points="140,60 175,80 175,121 140,141 105,121 105,80"
                stroke="#6B3FA0"
                opacity="0.6"
              />
              <polygon
                points="70,80 105,100 105,141 70,161 35,141 35,100"
                stroke="#007850"
                opacity="0.5"
              />
              {/* Connecting lines */}
              <line x1="70" y1="0" x2="70" y2="-20" stroke="#007850" strokeDasharray="2,3" />
              <line x1="105" y1="20" x2="140" y2="0" stroke="#007850" strokeDasharray="2,3" />
              <line x1="35" y1="20" x2="0" y2="0" stroke="#007850" strokeDasharray="2,3" />
              <line x1="105" y1="60" x2="140" y2="60" stroke="#6B3FA0" strokeDasharray="2,3" />
              <line x1="35" y1="60" x2="0" y2="60" stroke="#6B3FA0" strokeDasharray="2,3" />
              <line x1="70" y1="80" x2="70" y2="100" stroke="#007850" strokeDasharray="2,3" />
              {/* Nodes */}
              <circle cx="70" cy="0" r="1.8" fill="#6B3FA0" stroke="none" />
              <circle cx="105" cy="20" r="1.8" fill="#007850" stroke="none" />
              <circle cx="35" cy="20" r="1.8" fill="#007850" stroke="none" />
              <circle cx="105" cy="60" r="1.8" fill="#6B3FA0" stroke="none" />
              <circle cx="35" cy="60" r="1.8" fill="#6B3FA0" stroke="none" />
              <circle cx="70" cy="80" r="1.8" fill="#007850" stroke="none" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#suttain-molecular-pattern)" />
      </svg>
    </div>
  );
}