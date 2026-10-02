import React from 'react';

export default function LandingElementBadge({ number, symbol, research = false }) {
  return <div aria-hidden="true" className={`home-element ${research ? 'home-element-research' : ''}`}>
    <span className="home-element-number font-mono">{number}</span>
    <span className="home-element-symbol">{symbol}</span>
  </div>;
}