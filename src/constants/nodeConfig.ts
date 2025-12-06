// Node type constants
export const NODE_TYPES = {
  START: 'start',
  TASK: 'task',
  APPROVAL: 'approval',
  AUTOMATED: 'automated',
  END: 'end',
} as const;

// Node colors for visualization
export const NODE_COLORS = {
  start: '#16a34a',
  task: '#2563eb',
  approval: '#ea580c',
  automated: '#9333ea',
  end: '#dc2626',
  default: '#6b7280',
} as const;

// Tailwind color classes for node headers
export const NODE_TAILWIND_COLORS = {
  start: 'bg-green-600',
  task: 'bg-blue-600',
  approval: 'bg-orange-600',
  automated: 'bg-purple-600',
  end: 'bg-red-600',
} as const;

// Auto-approve threshold presets (for UI hints)
export const AUTO_APPROVE_THRESHOLDS = {
  SMALL: 1000,
  MEDIUM: 5000,
  LARGE: 10000,
} as const;

// Approver roles
export const APPROVER_ROLES = [
  'Manager',
  'HR Business Partner',
  'Director',
  'Vice President',
  'C-Level Executive',
] as const;

// Validation error types
export const VALIDATION_ERROR_TYPES = {
  MISSING_TITLE: 'Title is required',
  MISSING_APPROVER_ROLE: 'Approver role is required',
  MISSING_ACTION: 'Automated node must have an action selected',
  MISSING_PARAMETER: 'Action parameter is required',
  MISSING_END_MESSAGE: 'End message is required',
  MISSING_START_NODE: 'Workflow must have a Start Node',
  MULTIPLE_START_NODES: 'Workflow must have only one Start Node',
  MISSING_END_NODE: 'Workflow must have at least one End Node',
  CYCLE_DETECTED: 'Cycle detected in workflow',
  UNREACHABLE_NODE: 'Node is not reachable from Start',
  PART_OF_CYCLE: 'Node is part of a cycle',
} as const;

// Debounce delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  FORM_VALIDATION: 300,
  WORKFLOW_VALIDATION: 500,
  SEARCH: 200,
  AUTOSAVE: 1000,
} as const;

// History/undo-redo settings
export const HISTORY_SETTINGS = {
  MAX_ENTRIES: 50,
  DEBOUNCE_SAVE: 100,
} as const;

// Toast durations
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 4000,
  LONG: 6000,
  PERMANENT: -1,
} as const;

// API timeouts
export const API_TIMEOUTS = {
  GET_AUTOMATIONS: 5000,
  SIMULATE_WORKFLOW: 10000,
  DEFAULT: 5000,
} as const;
