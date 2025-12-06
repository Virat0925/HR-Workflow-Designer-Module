import { AutomationAction, SimulationResult, SimulationStep } from '../types/workflow.types';
import { Node, Edge } from 'reactflow';
import { validateWorkflow } from '../utils/validateWorkflow';

const mockAutomations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'create_ticket', label: 'Create Ticket', params: ['system', 'priority', 'description'] },
  { id: 'update_database', label: 'Update Database', params: ['table', 'field', 'value'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'duration', 'topic'] },
];

export const getAutomations = async (): Promise<AutomationAction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAutomations);
    }, 300);
  });
};

export const simulateWorkflow = async (
  nodes: Node[],
  edges: Edge[]
): Promise<SimulationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const validation = validateWorkflow(nodes as Node[], edges as Edge[]);
      const steps: SimulationStep[] = [];
      const errors: string[] = [...validation.errors];

      if (validation.cycleNodes.length > 0 || validation.errors.length > 0) {
        resolve({ success: false, steps, errors });
        return;
      }

      const sortedNodes = topologicalSort(nodes, edges);

      sortedNodes.forEach((node, index) => {
        const nodeData = (node as any).data;
        let message = '';

        switch (nodeData.type) {
          case 'start':
            message = `Workflow started: ${nodeData.title}`;
            break;
          case 'task':
            message = `Task "${nodeData.title}" assigned to ${nodeData.assignee || 'unassigned'}`;
            break;
          case 'approval':
            message = `Approval requested from ${nodeData.approverRole || 'unspecified role'}`;
            break;
          case 'automated':
            const action = mockAutomations.find((a) => a.id === nodeData.actionId);
            message = `Executed: ${action?.label || 'Unknown action'}`;
            break;
          case 'end':
            message = `Workflow completed: ${nodeData.endMessage || 'Success'}`;
            break;
        }

        steps.push({
          nodeId: node.id,
          nodeTitle: nodeData.title || nodeData.type,
          nodeType: nodeData.type,
          status: 'completed',
          message,
          timestamp: new Date(Date.now() + index * 1000).toISOString(),
        });
      });

      resolve({ success: errors.length === 0, steps, errors });
    }, 500);
  });
};

function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });

  // Kahn's algorithm: use in-degree to process nodes in order
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => inDegree.set(n.id, 0));
  edges.forEach((e) => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue: string[] = [];
  nodes.forEach((n) => {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id);
    }
  });

  const sorted: Node[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find((n) => n.id === nodeId);
    if (node) sorted.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sorted;
}
