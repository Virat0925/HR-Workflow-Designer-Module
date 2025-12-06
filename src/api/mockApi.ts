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

      // Find start node
      const startNode = nodes.find((n) => (n as any).data?.type === 'start');
      if (!startNode) {
        resolve({ success: false, steps, errors: ['No start node found'] });
        return;
      }

      // Build adjacency list
      const adjacencyList = new Map<string, string[]>();
      nodes.forEach((node) => adjacencyList.set(node.id, []));
      edges.forEach((edge) => {
        const targets = adjacencyList.get(edge.source) || [];
        targets.push(edge.target);
        adjacencyList.set(edge.source, targets);
      });

      // Follow the execution path from start to end
      const executedNodeIds = new Set<string>();
      const nodeQueue: string[] = [startNode.id];
      let stepIndex = 0;

      while (nodeQueue.length > 0 && stepIndex < 100) { // Limit to 100 steps to prevent infinite loops
        const nodeId = nodeQueue.shift()!;
        
        // Skip if already executed (prevent revisiting)
        if (executedNodeIds.has(nodeId)) continue;
        executedNodeIds.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

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
          timestamp: new Date(Date.now() + stepIndex * 1000).toISOString(),
        });

        // Stop if we reach an end node
        if (nodeData.type === 'end') {
          break;
        }

        // Add next nodes to queue
        const nextNodeIds = adjacencyList.get(nodeId) || [];
        nodeQueue.push(...nextNodeIds);
        stepIndex++;
      }

      resolve({ success: errors.length === 0, steps, errors });
    }, 500);
  });
};
