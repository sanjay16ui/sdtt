/**
 * Global domain type shapes for SDTT AI Safety & Governance.
 */

export const DECISIONS = {
  ALLOWED: 'ALLOWED',
  TRANSFORMED: 'TRANSFORMED',
  BLOCKED: 'BLOCKED',
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const CHANNELS = {
  TOOL_OUTPUT: 'tool_output',
  MODEL_OUTPUT: 'model_output',
  API_RESPONSE: 'api_response',
  MEMORY: 'memory',
  AGENT_REFLECTION: 'agent_reflection',
};
