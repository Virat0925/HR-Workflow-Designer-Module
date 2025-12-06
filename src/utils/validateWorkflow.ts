import { Node, Edge } from 'reactflow';
import {
  WorkflowNodeData,
  ValidationError,
  NodeType,
} from '../types/workflow.types';

interface ValidationResult {
  errors: string[];
  nodeErrors: ValidationError[];
  cycleNodes: string[];
  unreachableNodes: string[];
}

export function validateWorkflow(nodes: Node<WorkflowNodeData>[], edges: Edge[]): ValidationResult {
  const errors: string[] = [];
  const nodeErrors: ValidationError[] = [];
  const cycleNodes: string[] = [];
  const unreachableNodes: string[] = [];

  const startNodes = nodes.filter((n) => n.data.type === 'start');
  if (startNodes.length === 0) {
    errors.push('Workflow must have a Start Node');
  }
  if (startNodes.length > 1) {
    errors.push('Workflow must have only one Start Node');
    startNodes.forEach((n) => nodeErrors.push({ nodeId: n.id, message: 'Multiple start nodes present', type: 'error' }));
  }

  const endNodes = nodes.filter((n) => n.data.type === 'end');
  if (endNodes.length === 0) {
    errors.push('Workflow must have at least one End Node');
  }

  nodes.forEach((node) => {
    const d = node.data as any;
    switch (d.type as NodeType) {
      case 'start':
      case 'task':
      case 'approval':
      case 'automated':
        if (!d.title || d.title.trim() === '') {
          nodeErrors.push({ nodeId: node.id, message: 'Title is required', type: 'error' });
        }
        break;
      case 'end':
        if (!d.endMessage || d.endMessage.trim() === '') {
          nodeErrors.push({ nodeId: node.id, message: 'End message is required', type: 'error' });
        }
        break;
    }

    if (d.type === 'approval') {
      if (!d.approverRole || String(d.approverRole).trim() === '') {
        nodeErrors.push({ nodeId: node.id, message: 'Approver role is required', type: 'error' });
      }
    }

    if (d.type === 'automated') {
      if (!d.actionId) {
        nodeErrors.push({ nodeId: node.id, message: 'Automated node must have an action selected', type: 'error' });
      } else if (d.actionParams) {
        
        Object.entries(d.actionParams).forEach(([k, v]) => {
          if (v == null || String(v).trim() === '') {
            nodeErrors.push({ nodeId: node.id, message: `Action parameter "${k}" is required`, type: 'error' });
          }
        });
      }
    }
  });

  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => adjacency.set(n.id, []));
  edges.forEach((e) => {
    const arr = adjacency.get(e.source) || [];
    arr.push(e.target);
    adjacency.set(e.source, arr);
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
    const neighbors = adjacency.get(nodeId) || [];
    for (const nb of neighbors) {
      dfs(nb);
      if (foundCycle) cycleFoundNodes.add(nodeId);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  if (startNodes.length > 0) {
    dfs(startNodes[0].id);
  }

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      dfs(n.id);
    }
  });

  if (foundCycle) {
    errors.push('Cycle detected in workflow');
    cycleFoundNodes.forEach((id) => cycleNodes.push(id));
    cycleFoundNodes.forEach((id) => nodeErrors.push({ nodeId: id, message: 'Node is part of a cycle', type: 'error' }));
  }

  if (startNodes.length > 0) {
    const reachable = new Set<string>();
    const q: string[] = [startNodes[0].id];
    while (q.length > 0) {
      const cur = q.shift()!;
      if (reachable.has(cur)) continue;
      reachable.add(cur);
      const nbrs = adjacency.get(cur) || [];
      nbrs.forEach((n) => q.push(n));
    }
    nodes.forEach((n) => {
      if (n.data.type === 'start') return;
      if (!reachable.has(n.id)) {
        unreachableNodes.push(n.id);
        nodeErrors.push({ nodeId: n.id, message: 'Node is not reachable from Start', type: 'error' });
      }
    });
  }

  return { errors, nodeErrors, cycleNodes, unreachableNodes };
}
