import { Node, Edge } from 'reactflow';
import { WorkflowNodeData, ValidationError, NodeType } from '../types/workflow.types';
import { VALIDATION_ERROR_TYPES } from '../constants/nodeConfig';

interface ValidationResult {
  errors: string[];
  nodeErrors: ValidationError[];
  cycleNodes: string[];
  unreachableNodes: string[];
}

/**
 * Validate workflow structure (start node, end node, connectivity)
 */
export function validateStructure(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): { errors: string[]; startNodeId: string | null } {
  const errors: string[] = [];

  const startNodes = nodes.filter((n) => n.data.type === 'start');
  if (startNodes.length === 0) {
    errors.push(VALIDATION_ERROR_TYPES.MISSING_START_NODE);
  }
  if (startNodes.length > 1) {
    errors.push(VALIDATION_ERROR_TYPES.MULTIPLE_START_NODES);
  }

  const endNodes = nodes.filter((n) => n.data.type === 'end');
  if (endNodes.length === 0) {
    errors.push(VALIDATION_ERROR_TYPES.MISSING_END_NODE);
  }

  return {
    errors,
    startNodeId: startNodes.length === 1 ? startNodes[0].id : null,
  };
}

/**
 * Validate individual node content and fields
 */
export function validateNodeContent(
  nodes: Node<WorkflowNodeData>[]
): ValidationError[] {
  const nodeErrors: ValidationError[] = [];

  nodes.forEach((node) => {
    const d = node.data as any;

    // Check title for all nodes except end
    if (['start', 'task', 'approval', 'automated'].includes(d.type)) {
      if (!d.title || d.title.trim() === '') {
        nodeErrors.push({
          nodeId: node.id,
          message: VALIDATION_ERROR_TYPES.MISSING_TITLE,
          type: 'error',
        });
      }
    }

    // End node validation
    if (d.type === 'end') {
      if (!d.endMessage || d.endMessage.trim() === '') {
        nodeErrors.push({
          nodeId: node.id,
          message: VALIDATION_ERROR_TYPES.MISSING_END_MESSAGE,
          type: 'error',
        });
      }
    }

    // Approval node validation
    if (d.type === 'approval') {
      if (!d.approverRole || String(d.approverRole).trim() === '') {
        nodeErrors.push({
          nodeId: node.id,
          message: VALIDATION_ERROR_TYPES.MISSING_APPROVER_ROLE,
          type: 'error',
        });
      }
    }

    // Automated node validation
    if (d.type === 'automated') {
      if (!d.actionId) {
        nodeErrors.push({
          nodeId: node.id,
          message: VALIDATION_ERROR_TYPES.MISSING_ACTION,
          type: 'error',
        });
      } else if (d.actionParams) {
        Object.entries(d.actionParams).forEach(([k, v]) => {
          if (v == null || String(v).trim() === '') {
            nodeErrors.push({
              nodeId: node.id,
              message: `${VALIDATION_ERROR_TYPES.MISSING_PARAMETER} "${k}"`,
              type: 'error',
            });
          }
        });
      }
    }
  });

  return nodeErrors;
}

/**
 * Detect cycles in the workflow graph using DFS
 */
export function detectCycles(
  nodes: Node[],
  edges: Edge[]
): { hasCycle: boolean; cycleNodes: string[] } {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });

  const visited = new Set<string>();
  const visiting = new Set<string>();
  let foundCycle = false;
  const cycleFoundNodes = new Set<string>();

  const dfs = (nodeId: string) => {
    if (visiting.has(nodeId)) {
      foundCycle = true;
      cycleFoundNodes.add(nodeId);
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    const neighbors = adjacencyList.get(nodeId) || [];
    for (const nb of neighbors) {
      dfs(nb);
      if (foundCycle) cycleFoundNodes.add(nodeId);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      dfs(n.id);
    }
  });

  return {
    hasCycle: foundCycle,
    cycleNodes: Array.from(cycleFoundNodes),
  };
}

/**
 * Validate reachability from start node
 */
export function validateReachability(
  nodes: Node[],
  edges: Edge[],
  startNodeId: string | null
): string[] {
  const unreachableNodes: string[] = [];

  if (!startNodeId) return unreachableNodes;

  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((n) => adjacencyList.set(n.id, []));
  edges.forEach((e) => {
    const arr = adjacencyList.get(e.source) || [];
    arr.push(e.target);
    adjacencyList.set(e.source, arr);
  });

  const reachable = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (reachable.has(cur)) continue;
    reachable.add(cur);
    const nbrs = adjacencyList.get(cur) || [];
    nbrs.forEach((n) => queue.push(n));
  }

  nodes.forEach((n) => {
    if (n.data.type === 'start') return;
    if (!reachable.has(n.id)) {
      unreachableNodes.push(n.id);
    }
  });

  return unreachableNodes;
}

/**
 * Main workflow validation function - combines all validations
 */
export function validateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): ValidationResult {
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

  // Add multiple start node errors
  const startNodes = nodes.filter((n) => n.data.type === 'start');
  if (startNodes.length > 1) {
    startNodes.forEach((n) =>
      nodeErrors.push({
        nodeId: n.id,
        message: VALIDATION_ERROR_TYPES.MULTIPLE_START_NODES,
        type: 'error',
      })
    );
  }

  // Cycle detection
  const cycleDetection = detectCycles(nodes, edges);
  if (cycleDetection.hasCycle) {
    errors.push(VALIDATION_ERROR_TYPES.CYCLE_DETECTED);
    cycleDetection.cycleNodes.forEach((id) => {
      cycleNodes.push(id);
      nodeErrors.push({
        nodeId: id,
        message: VALIDATION_ERROR_TYPES.PART_OF_CYCLE,
        type: 'error',
      });
    });
  }

  // Reachability validation
  const unreachable = validateReachability(nodes, edges, structureValidation.startNodeId);
  unreachable.forEach((id) => {
    unreachableNodes.push(id);
    nodeErrors.push({
      nodeId: id,
      message: VALIDATION_ERROR_TYPES.UNREACHABLE_NODE,
      type: 'error',
    });
  });

  return { errors, nodeErrors, cycleNodes, unreachableNodes };
}
