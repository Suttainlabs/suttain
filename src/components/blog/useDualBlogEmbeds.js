import { useEffect, useState } from 'react';

// Soro and Holo both open posts with ?post=<slug>, and each one falls back to its
// list (stripping ?post) when the slug isn't theirs. This hook loads them in an
// order that lets the owning embed claim a deep link, and reports which one is
// currently showing an article so the other can be hidden.
const SORO_SRC = 'https://app.trysoro.com/api/embed/39f34335-ade3-4339-96ec-dd251a44a8dc';
const HOLO_SRC = 'https://prod-api-holo-ai.fly.dev/public/seo/embed/903b95ba-05ee-4234-b176-ac77ce51e666.js';

const getSlug = () => new URLSearchParams(window.location.search).get('post');
const isOpen = (selector) => document.querySelector(selector)?.style.display === 'flex';

function inject(src, onLoad) {
  const script = document.createElement('script');
  script.src = `${src}?v=${Date.now()}`;
  script.async = true;
  script.dataset.blogEmbed = 'true';
  if (onLoad) script.onload = onLoad;
  document.body.appendChild(script);
}

export default function useDualBlogEmbeds() {
  const [active, setActive] = useState(null); // 'soro' | 'holo' | null

  useEffect(() => {
    let soroLoaded = false;
    let resolved = false;
    const loadSoro = () => { if (!soroLoaded) { soroLoaded = true; inject(SORO_SRC); } };
    const initialSlug = getSlug();

    if (initialSlug) {
      // Holo first: if it doesn't own the slug it strips ?post, so restore it for Soro.
      inject(HOLO_SRC, () => {
        resolved = true;
        if (getSlug() !== initialSlug) {
          const url = new URL(window.location.href);
          url.searchParams.set('post', initialSlug);
          window.history.replaceState({ post: initialSlug }, '', url.pathname + url.search);
          loadSoro();
        }
      });
    } else {
      resolved = true;
      inject(HOLO_SRC);
      loadSoro();
    }

    const tick = () => {
      // Load Soro once a Holo article is closed (its list should appear too).
      if (resolved && !getSlug()) loadSoro();
      setActive(getSlug() ? (isOpen('.holo-blog-header') ? 'holo' : isOpen('.soro-blog-header') ? 'soro' : null) : null);
    };
    const timer = setInterval(tick, 300);

    // Both embeds react to back/forward and would strip each other's slug; reload resolves it cleanly.
    const onPop = (e) => { e.stopImmediatePropagation(); window.location.reload(); };
    window.addEventListener('popstate', onPop, true);

    return () => {
      clearInterval(timer);
      window.removeEventListener('popstate', onPop, true);
      document.querySelectorAll('script[data-blog-embed]').forEach((s) => s.remove());
    };
  }, []);

  return active;
}