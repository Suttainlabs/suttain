let pending;
export default function loadMolecularViewer() {
  if (window.$3Dmol) return Promise.resolve();
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => fail(), 15000);
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      pending = null;
      reject(new Error('The molecular viewer could not start. Try loading again.'));
    };
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.1.0/3Dmol-min.js';
    script.onerror = fail;
    script.onload = () => {
      clearTimeout(timer);
      if (window.$3Dmol) resolve(); else fail();
    };
    document.head.appendChild(script);
  });
  return pending;
}