const generateId = () => Math.random().toString(36).substring(2, 9).toUpperCase();

export const mockSystemStatus = {
  coreOperational: true,
  activePolicies: 24,
  activeIntegrations: 8,
  lastPolicyEvaluation: '0.4s ago',
  environment: 'Production',
};

export const mockMetrics = [
  { label: 'Protected Interactions', value: '142,891', trend: '+12.4%', trendUp: true, status: 'safe' },
  { label: 'Sensitive Releases', value: '24,192', trend: '-4.1%', trendUp: false, status: 'info' },
  { label: 'High-Risk Events', value: '312', trend: '+2.1%', trendUp: true, status: 'warning' },
  { label: 'Blocked Releases', value: '1,492', trend: '-1.2%', trendUp: false, status: 'safe' },
  { label: 'Active Subjects', value: '4,192', trend: '+5.4%', trendUp: true, status: 'info' },
  { label: 'Policy Violations', value: '84', trend: '-12.0%', trendUp: false, status: 'safe' },
];

export const mockRiskFactors = [
  { id: 'rf-1', label: 'Sensitive data density', contribution: 31 },
  { id: 'rf-2', label: 'Recipient exposure', contribution: 24 },
  { id: 'rf-3', label: 'Cross-context movement', contribution: 19 },
  { id: 'rf-4', label: 'Historical behavior', contribution: 14 },
  { id: 'rf-5', label: 'Policy sensitivity', contribution: 12 },
];

export const generateMockEvent = () => {
  const subjects = ['SUB-20491', 'SUB-19924', 'SUB-8812A', 'SUB-77X91', 'SUB-9944B', 'SUB-5510C'];
  const channels = ['tool_output', 'model_output', 'api_response', 'memory', 'agent_reflection'];
  const decisions = ['ALLOWED', 'TRANSFORMED', 'BLOCKED'];
  const recipients = ['External Vendor API', 'Customer Support Bot', 'Analytics Pipeline', 'Vector DB Cache', 'LLM Provider'];
  
  const decision = decisions[Math.floor(Math.random() * decisions.length)];
  let riskScore = Math.random() * 100;
  
  if (decision === 'ALLOWED') riskScore = Math.random() * 25;
  if (decision === 'TRANSFORMED') riskScore = 30 + Math.random() * 40;
  if (decision === 'BLOCKED') riskScore = 75 + Math.random() * 25;

  return {
    id: `REL-${generateId()}`,
    subjectId: subjects[Math.floor(Math.random() * subjects.length)],
    timestamp: new Date().toISOString(),
    principal: 'Agent-Gateway-Prod',
    recipient: recipients[Math.floor(Math.random() * recipients.length)],
    channel: channels[Math.floor(Math.random() * channels.length)],
    modality: 'TEXT',
    policyVersion: 'POL-09.2',
    estimatorVersion: 'RES-v4.1',
    riskScore: Math.round(riskScore * 10) / 10,
    credibleInterval: [Math.max(0, Math.round((riskScore - 4) * 10) / 10), Math.min(100, Math.round((riskScore + 4) * 10) / 10)],
    decision,
    transformationSignature: `SIG-${generateId()}`,
    retentionHorizon: '7 days',
    detectedInfo: [
      { type: 'Direct Identifier', label: 'EMAIL', value: 'executive@company.com', maskedValue: 'ex***@company.com', sensitivity: 'High' },
      { type: 'Sensitive Attribute', label: 'FINANCIAL', value: '$4.2M Revenue', maskedValue: '[REDACTED_FINANCIAL]', sensitivity: 'Critical' },
    ]
  };
};

export const getInitialLiveEvents = (count = 25) => {
  return Array.from({ length: count }, () => {
    const event = generateMockEvent();
    event.timestamp = new Date(Date.now() - Math.random() * 180000).toISOString();
    return event;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const mockSubjects = [
  { id: 'SUB-20491', risk: 'HIGH', sessions: 14, channels: 4, qids: 12, lastSeen: '2m ago', retention: '30 days', status: 'Protected' },
  { id: 'SUB-19924', risk: 'MEDIUM', sessions: 32, channels: 3, qids: 8, lastSeen: '15m ago', retention: '7 days', status: 'Protected' },
  { id: 'SUB-8812A', risk: 'LOW', sessions: 2, channels: 1, qids: 1, lastSeen: '1h ago', retention: '24 hours', status: 'Protected' },
  { id: 'SUB-9944B', risk: 'CRITICAL', sessions: 84, channels: 5, qids: 24, lastSeen: 'Just now', retention: '90 days', status: 'Vulnerable' },
  { id: 'SUB-5510C', risk: 'MEDIUM', sessions: 19, channels: 2, qids: 5, lastSeen: '4m ago', retention: '14 days', status: 'Protected' },
  { id: 'SUB-3319X', risk: 'LOW', sessions: 6, channels: 2, qids: 2, lastSeen: '3h ago', retention: '7 days', status: 'Protected' },
];

export const mockAlerts = [
  {
    id: 'ALT-1092',
    severity: 'CRITICAL',
    title: 'High-Density PII Exfiltration Attempt in Tool Call',
    subject: 'SUB-9944B',
    source: 'tool_output:crm_fetch_customer',
    timestamp: '2 mins ago',
    status: 'ACTIVE',
    detail: 'Detected 4 direct identifiers (SSN, credit card, home address) unredacted in raw agent prompt.'
  },
  {
    id: 'ALT-1091',
    severity: 'HIGH',
    title: 'Cross-Context Memory Contamination',
    subject: 'SUB-20491',
    source: 'semantic_memory:kv_cache',
    timestamp: '14 mins ago',
    status: 'INVESTIGATING',
    detail: 'Sensitive financial credentials persisted in global session cache across user boundary.'
  },
  {
    id: 'ALT-1088',
    severity: 'MEDIUM',
    title: 'Differential Privacy Epsilon Threshold Warning',
    subject: 'GLOBAL_POOL',
    source: 'evaluator:res_v4',
    timestamp: '42 mins ago',
    status: 'RESOLVED',
    detail: 'Epsilon budget reached 82% of allowable cumulative risk for cohort #A-9.'
  },
  {
    id: 'ALT-1082',
    severity: 'LOW',
    title: 'Unverified Model Provider Response Signature',
    subject: 'SUB-8812A',
    source: 'provider:claude-3-5-sonnet',
    timestamp: '2 hours ago',
    status: 'RESOLVED',
    detail: 'Response hash mismatch resolved on automatic retry.'
  }
];

export const mockPolicies = [
  { id: 'POL-01', name: 'GDPR Article 9 Special Category Guard', status: 'Enforcing', mode: 'Block & Mask', threshold: '0.15 Epsilon', updated: '2 days ago' },
  { id: 'POL-02', name: 'HIPAA Safe Harbor De-identification', status: 'Enforcing', mode: 'Surrogate Mask', threshold: 'Zero Tolerance', updated: '1 week ago' },
  { id: 'POL-03', name: 'EU AI Act High-Risk Inference Boundary', status: 'Enforcing', mode: 'Differential Taint', threshold: '0.25 Delta', updated: '3 days ago' },
  { id: 'POL-04', name: 'Cross-Tenant Context Isolation', status: 'Enforcing', mode: 'Strict Partition', threshold: '0.00 Leakage', updated: '5 hours ago' },
  { id: 'POL-05', name: 'Financial PCI-DSS Cardholder Scrub', status: 'Enforcing', mode: 'Tokenization', threshold: '100% Redact', updated: 'Yesterday' },
];

export const mockAuditLedger = [
  { txId: '0x8849...a31e', block: 198240, timestamp: '10s ago', action: 'TRANSFORM_RELEASE', hash: 'sha256:d8a2...3f1c', operator: 'SDTT_AUTOMATION' },
  { txId: '0x7120...b902', block: 198239, timestamp: '24s ago', action: 'BLOCK_SENSITIVE_QID', hash: 'sha256:12ef...98bc', operator: 'POLICY_ENGINE' },
  { txId: '0x4311...c55a', block: 198238, timestamp: '1m ago', action: 'POLICY_HASH_UPDATE', hash: 'sha256:c941...23aa', operator: 'ADMIN_KEY_01' },
  { txId: '0x1290...e812', block: 198237, timestamp: '3m ago', action: 'TAINT_REGISTERED', hash: 'sha256:77fa...810a', operator: 'PROVENANCE_TRACKER' },
];
