import { useEffect, useState } from 'react';
export default function useViewerActions({ viewerRef, viewportRef, ready, resetKey, name }) {
  const [rotating, setRotating] = useState(false), [fullscreen, setFullscreen] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    const viewer = viewerRef.current;
    setRotating(false); setError('');
    return () => viewer?.spin(false);
  }, [ready, resetKey]);
  useEffect(() => {
    const update = () => {
      setFullscreen(document.fullscreenElement === viewportRef.current);
      viewerRef.current?.resize(); viewerRef.current?.render();
    };
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, [viewerRef, viewportRef]);
  const rotate = () => {
    if (!viewerRef.current || !ready) return;
    viewerRef.current.spin(rotating ? false : 'y', 0.5);
    setRotating(!rotating);
  };
  const toggleFullscreen = async () => {
    setError('');
    try {
      if (document.fullscreenElement === viewportRef.current) await document.exitFullscreen();
      else await viewportRef.current.requestFullscreen();
    } catch { setError('Fullscreen is unavailable in this browser or embedded preview.'); }
  };
  const download = () => {
    setError('');
    try {
      viewerRef.current.render();
      const link = document.createElement('a');
      link.href = viewerRef.current.pngURI();
      link.download = `${String(name || 'molecule').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80)}.png`;
      link.click();
    } catch { setError('The PNG could not be downloaded. Please try again.'); }
  };
  return { rotating, fullscreen, error, rotate, toggleFullscreen, download };
}