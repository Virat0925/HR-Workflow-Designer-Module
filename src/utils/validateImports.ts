export function validateImportedWorkflow(
  data: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Workflow must be a JSON object');
    return { valid: false, errors };
  }

  const workflow = data as any;

  if (!Array.isArray(workflow.nodes)) {
    errors.push('Workflow must have a "nodes" array');
  }
  if (!Array.isArray(workflow.edges)) {
    errors.push('Workflow must have an "edges" array');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  (workflow.nodes as any[]).forEach((node, idx) => {
    if (!node.id) {
      errors.push(`Node ${idx}: missing "id" field`);
    }
    if (!node.type) {
      errors.push(`Node ${idx}: missing "type" field`);
    }
    if (!['start', 'task', 'approval', 'automated', 'end'].includes(node.type)) {
      errors.push(`Node ${idx}: invalid type "${node.type}"`);
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      errors.push(`Node ${idx}: invalid or missing "position"`);
    }
    if (!node.data) {
      errors.push(`Node ${idx}: missing "data" field`);
    }
  });

  (workflow.edges as any[]).forEach((edge, idx) => {
    if (!edge.id) {
      errors.push(`Edge ${idx}: missing "id" field`);
    }
    if (!edge.source) {
      errors.push(`Edge ${idx}: missing "source" field`);
    }
    if (!edge.target) {
      errors.push(`Edge ${idx}: missing "target" field`);
    }
  });

  return { valid: errors.length === 0, errors };
}
