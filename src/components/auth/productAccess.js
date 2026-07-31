import { Beaker, Microscope, Terminal, Sprout } from 'lucide-react';

// One shared signup across all four domains. The answer to "What are you here for?"
// maps directly to the User.product_access values.
export const ACCESS_OPTIONS = [
  {
    value: 'consumer',
    label: 'Formulating and compliance for my brand',
    description: 'Formula generator, chemical simulator, compliance and scanning',
    icon: Beaker,
    subdomain: '',
    path: '/Dashboard',
  },
  {
    value: 'research',
    label: 'Scientific and molecular research',
    description: 'Molecular intelligence, simulation suite and structural biology',
    icon: Microscope,
    subdomain: 'research',
    path: '/ResearchDashboard',
  },
  {
    value: 'api',
    label: 'Developer and API access',
    description: 'REST endpoints, SDKs and enterprise integrations',
    icon: Terminal,
    subdomain: 'api',
    path: '/APIPortal',
  },
  {
    value: 'farm',
    label: 'Farm and agriculture tools',
    description: 'Crop advisory, photo diagnosis, weather and yields',
    icon: Sprout,
    subdomain: 'farm',
    path: '/AgroDashboard',
  },
];

export function getAccessOption(value) {
  return ACCESS_OPTIONS.find((o) => o.value === value) || ACCESS_OPTIONS[0];
}

// Builds the post-signup destination. On a suttain.com host we hop to the
// matching subdomain; anywhere else (preview, custom host) we stay put and
// just use the path so the redirect never dead-ends.
export function buildAccessRedirect(value) {
  const option = getAccessOption(value);
  const host = window.location.hostname;
  if (host === 'suttain.com' || host.endsWith('.suttain.com')) {
    const target = option.subdomain ? `${option.subdomain}.suttain.com` : 'suttain.com';
    return `https://${target}${option.path}`;
  }
  return option.path;
}