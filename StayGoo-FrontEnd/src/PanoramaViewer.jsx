import { useEffect, useRef } from "react";
import "./PanoramaViewer.css";

const loadScript = (src) => new Promise((resolve, reject) => {
  if (document.querySelector(`script[src="${src}"]`)) {
    return resolve();
  }
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onload = () => resolve();
  s.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.head.appendChild(s);
});

export default function PanoramaViewer({ src }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (!window.THREE) {
          await loadScript('https://unpkg.com/three/build/three.min.js');
        }
        if (!window.PANOLENS) {
          await loadScript('https://unpkg.com/panolens/build/panolens.min.js');
        }

        if (!mounted) return;

        // Clean previous viewer
        if (viewerRef.current && viewerRef.current.dispose) {
          try { viewerRef.current.dispose(); } catch (e) { /* ignore */ }
        }

        const panorama = new window.PANOLENS.ImagePanorama(src || '');
        const viewer = new window.PANOLENS.Viewer({ container: containerRef.current, output: 'console' });
        viewer.add(panorama);

        // subtle auto-rotate to give 3D feel
        if (viewer && viewer.tweenControlCenter) {
          // panolens exposes some controls; keep reference
        }

        viewerRef.current = viewer;

        // Observe container size changes and notify Panolens/Three to resize renderer
        if (containerRef.current && window.ResizeObserver) {
          const ro = new window.ResizeObserver(() => {
            try {
              if (viewerRef.current && typeof viewerRef.current.onWindowResize === 'function') {
                viewerRef.current.onWindowResize();
              } else {
                // Fallback: dispatch resize event
                window.dispatchEvent(new Event('resize'));
              }
            } catch (e) {
              window.dispatchEvent(new Event('resize'));
            }
          });
          ro.observe(containerRef.current);
          // store observer to disconnect on cleanup
          viewerRef.current._resizeObserver = ro;
        }
      } catch (err) {
        // If CDN load fails, leave a developer-friendly fallback
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="panorama-error">No se pudo cargar el visor 360°.</div>`;
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (viewerRef.current) {
        try {
          if (viewerRef.current._resizeObserver) {
            try { viewerRef.current._resizeObserver.disconnect(); } catch (e) { /* ignore */ }
          }
          if (viewerRef.current.dispose) viewerRef.current.dispose();
        } catch (e) { /* ignore */ }
      }
    };
  }, [src]);

  return (
    <div className="panorama-root">
      <div ref={containerRef} className="panorama-container" />
    </div>
  );
}
