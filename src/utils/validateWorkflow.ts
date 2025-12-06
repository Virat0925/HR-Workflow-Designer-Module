import { Node, Edge } from 'reactflow';
import {
  WorkflowNodeData,
  ValidationError,
} from '../types/workflow.types';
import {
  validateStructure,
  validateNodeContent,
  detectCycles,
  validateReachability,
} from './validateWorkflowRefactored';

interface ValidationResult {
  errors: string[];
  nodeErrors: ValidationError[];
  cycleNodes: string[];
  unreachableNodes: string[];
}

/**
 * Main workflow validation function
 * Delegates to specialized validation functions for better maintainability
 */
export function validateWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const nodeErrors: ValidationError[] = [];
  const cycleNodes: string[] = [];
  const unreachableNodes: string[] = [];

  // Structural validation
  const structureValidation = validateStructure(nodes, edges);
  errors.push(...structureValidation.errors);

  // Node content validation
  const contentErrors = validateNodeContent(nodes);
  nodeErrors.push(...contentErrors);

  // Cycle detection
  const cycleDetection = detectCycles(nodes, edges);
  if (cycleDetection.hasCycle) {
    errors.push('Cycle detected in workflow');
    cycleDetection.cycleNodes.forEach((id) => {
      cycleNodes.push(id);
      nodeErrors.push({
        nodeId: id,
        message: 'Node is part of a cycle',
        type: 'error',
      });
    });
  }

  // Reachability validation
  const unreachable = validateReachability(
    nodes,
    edges,
    structureValidation.startNodeId
  );
  unreachable.forEach((id) => {
    unreachableNodes.push(id);
    nodeErrors.push({
      nodeId: id,
      message: 'Node is not reachable from Start',
      type: 'error',
    });
  });

  return { errors, nodeErrors, cycleNodes, unreachableNodes };
}
