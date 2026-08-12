import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Cross-origin isolation SOLO donde hace falta (ADR-04).
 *
 * WebContainers exige COOP:same-origin + COEP:require-corp para poder usar
 * SharedArrayBuffer. Aplicarlo a toda la app rompería fuentes, imágenes y
 * cualquier embed de terceros, así que se limita a las rutas de juego de
 * backend y devops — las únicas que arrancan un WebContainer.
 *
 * Sandpack (frontend) y Pyodide funcionan sin aislamiento y quedan fuera.
 */
const CROSS_ORIGIN_ISOLATION = [
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/:locale/play/backend/:path*', headers: CROSS_ORIGIN_ISOLATION },
      { source: '/:locale/play/devops/:path*', headers: CROSS_ORIGIN_ISOLATION },
    ];
  },
};

export default withNextIntl(nextConfig);
