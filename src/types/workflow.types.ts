export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface MetadataField {
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'start';
  title: string;
  metadata: MetadataField[];
  validationErrors?: ValidationError[];
}

export interface TaskNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: MetadataField[];
  validationErrors?: ValidationError[];
}

export interface ApprovalNodeData {
  type: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
  validationErrors?: ValidationError[];
}

export interface AutomatedNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
  validationErrors?: ValidationError[];
}

export interface EndNodeData {
  type: 'end';
  endMessage: string;
  summaryFlag: boolean;
  validationErrors?: ValidationError[];
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  nodeType: NodeType;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
}

export interface ValidationError {
  nodeId?: string;
  message: string;
  type: 'error' | 'warning';
}
