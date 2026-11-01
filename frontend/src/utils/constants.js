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

export const APP_INFO = {
  name: 'NETGUARD AI',
  subtitle: 'AI-Powered Network Intrusion Detection System',
  description:
    'An intelligent cybersecurity platform designed to analyze network traffic and identify potential intrusions using Machine Learning.',
  version: 'v0.2.0 (Phase 2)',
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

export const SUPPORTED_FEATURES = [
  { name: 'duration', type: 'Integer / Float', desc: 'Length of network flow connection in seconds' },
  { name: 'protocol_type', type: 'Categorical', desc: 'Transport layer protocol (e.g. tcp, udp, icmp)' },
  { name: 'service', type: 'Categorical', desc: 'Destination network service (e.g. http, smtp, dns, ftp)' },
  { name: 'flag', type: 'Categorical', desc: 'Normal or error connection status flag (e.g. SF, S0, REJ)' },
  { name: 'src_bytes', type: 'Integer', desc: 'Number of data bytes sent from source to destination' },
  { name: 'dst_bytes', type: 'Integer', desc: 'Number of data bytes sent from destination to source' },
  { name: 'count', type: 'Integer', desc: 'Number of connections to the same host in past 2 seconds' },
  { name: 'srv_count', type: 'Integer', desc: 'Number of connections to the same service in past 2 seconds' },
  { name: 'serror_rate', type: 'Float [0.0 - 1.0]', desc: 'Percentage of connections having SYN errors' },
  { name: 'dst_host_count', type: 'Integer', desc: 'Number of destination host connections recorded' },
];
