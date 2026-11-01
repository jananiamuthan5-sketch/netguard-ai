/**
 * NetGuard AI - Global Constants & Route Definitions
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ANALYZE: '/analyze',
  RESULTS: '/results',
  ANALYTICS: '/analytics',
  MODEL_PERFORMANCE: '/model-performance',
};

export const TRAFFIC_CLASSES = {
  NORMAL: {
    id: 0,
    label: 'NORMAL / BENIGN TRAFFIC',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  INTRUSION: {
    id: 1,
    label: 'POTENTIAL INTRUSION / MALICIOUS TRAFFIC',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
};

export const APP_INFO = {
  name: 'NETGUARD AI',
  tagline: 'AI-Powered Network Intrusion Detection System',
  phase: 'Phase 1 Foundation',
  version: '1.0.0-alpha',
};
