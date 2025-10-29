/**
 * Lighthouse CI Configuration
 * يحدد معايير الأداء المطلوبة
 */

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:3000',
        'http://localhost:3000/shop',
        'http://localhost:3000/academy',
        'http://localhost:3000/profile',
        'http://localhost:3000/plans',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Performance
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'aria-*': 'error',

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'uses-http2': 'warn',
        'uses-passive-event-listeners': 'warn',
        'no-document-write': 'error',

        // SEO
        'categories:seo': ['warn', { minScore: 0.9 }],
        'meta-description': 'error',
        'document-title': 'error',
        'robots-txt': 'warn',

        // PWA (optional)
        'categories:pwa': ['warn', { minScore: 0.5 }],
        'installable-manifest': 'warn',
        'service-worker': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
