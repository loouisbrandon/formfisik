import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: { '/api/students/**': ['./assets/fonts/**/*'], '/api/workouts/**': ['./assets/fonts/**/*'] },
  async headers() {
    return [{ source: '/redefinir-senha', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'no-store' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none'" },
    ] }, { source: '/esqueci-senha', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] }]
  },
};

export default nextConfig;
