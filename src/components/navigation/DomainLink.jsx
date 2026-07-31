import React from 'react';
import { Link } from 'react-router-dom';
import { productUrl } from '@/components/auth/productAccess';

// Links to a page that may live on another Suttain subdomain. Renders a plain
// anchor for cross-domain hops and a router Link when we stay in the app.
export default function DomainLink({ product, to, children, ...rest }) {
  const url = productUrl(product, to);
  if (url.startsWith('http')) {
    return <a href={url} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>;
  }
  return <Link to={url} {...rest}>{children}</Link>;
}