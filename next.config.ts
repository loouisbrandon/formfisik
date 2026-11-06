import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {localPatterns:[{pathname:'/images/**',search:''},{pathname:'/_next/static/media/**',search:''},{pathname:'/icon.png',search:''}],remotePatterns:[]},
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: { '/api/health':['./db/migrations/*.sql'], '/api/students/**': ['./assets/fonts/**/*'], '/api/workouts/**': ['./assets/fonts/**/*'], '/api/students/**/physical-reports': ['./assets/fonts/**/*'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      ...(process.env.NODE_ENV === 'production' && process.env.APP_URL?.startsWith('https://') ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    ] }, { source: '/responder', headers: [{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'},{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'private, no-store'}] }, { source: '/redefinir-senha', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Cache-Control', value: 'no-store' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] }, { source: '/esqueci-senha', headers: [
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] }]
  },
};

export default nextConfig;
