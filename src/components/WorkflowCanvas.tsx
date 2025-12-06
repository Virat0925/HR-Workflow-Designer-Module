import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
  OnConnect,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PlayCircle, TestTube, Loader } from 'lucide-react';

import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from './nodes';
import { NodeConfigPanel } from './forms/NodeConfigPanel';
import { TestPanel } from './TestPanel';
import { WorkflowNodeData, NodeType, SimulationResult } from '../types/workflow.types';
import { validateWorkflow } from '../utils/validateWorkflow';
import { simulateWorkflow } from '../api/mockApi';
import { showToast } from '../utils/toast';
import { validateImportedWorkflow } from '../utils/validateImport';

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

const createDefaultNodeData = (type: NodeType): WorkflowNodeData => {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: 'New Approval',
        approverRole: '',
        autoApproveThreshold: 0,
      };
    case 'automated':
      return {
        type: 'automated',
        title: 'New Automation',
        actionId: '',
        actionParams: {},
      };
    case 'end':
      return { type: 'end', endMessage: 'Workflow completed', summaryFlag: false };
  }
};

export const WorkflowCanvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [initialTestResult, setInitialTestResult] = useState<SimulationResult | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [past, setPast] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [validating, setValidating] = useState(false);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      if (type === 'start' && nodes.some((n) => (n.data as any).type === 'start')) {
        showToast('Only one Start node is allowed', 'warning');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: getNodeId(),
        type,
        position,
        data: createDefaultNodeData(type),
      };

      setPast((p) => p.concat([{ nodes: nodes, edges: edges }]));
      setFuture([]);
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, nodes, edges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<WorkflowNodeData>);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: WorkflowNodeData) => {
      setPast((p) => p.concat([{ nodes: nodes, edges: edges }]));
      setFuture([]);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data };
          }
          return node;
        })
      );
    },
    [setNodes, nodes, edges]
  );

  const clearCanvas = () => {
    if (nodes.length === 0) {
      showToast('Canvas is already empty', 'info');
      return;
    }
    setNodes((nds) => {
      setPast((p) => p.concat([{ nodes: nds, edges }]));
      setFuture([]);
      return [];
    });
    setEdges([]);
    setSelectedNode(null);
  };

  useEffect(() => {
    const validation = validateWorkflow(nodes as Node<WorkflowNodeData>[], edges);

    const updatedNodes = nodes.map((n) => {
      const errs = validation.nodeErrors.filter((e) => e.nodeId === n.id);
      const current = (n.data as any).validationErrors || [];
      const same = current.length === errs.length && current.every((c: any, i: number) => c.message === errs[i]?.message);
      if (same) return n;
      return { ...n, data: { ...(n.data as any), validationErrors: errs } };
    });

    const changed = updatedNodes.some((un, i) => un !== nodes[i]);
    if (changed) {
      setNodes(updatedNodes);
    }
  }, [nodes, edges]);

  const exportWorkflow = () => {
    const payload = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        const validation = validateImportedWorkflow(parsed);
        if (!validation.valid) {
          showToast(`Invalid workflow: ${validation.errors[0]}`, 'error');
          return;
        }
        setNodes((nds) => {
          setPast((p) => p.concat([{ nodes: nds, edges }]));
          setFuture([]);
          return parsed.nodes;
        });
        setEdges(parsed.edges);
        showToast('Workflow imported successfully', 'success');
      } catch (err) {
        showToast(`JSON parse error: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    };
    reader.readAsText(file);
    // reset input
    event.currentTarget.value = '';
  };

  const runValidationOnly = async () => {
    if (validating) return; 
    setValidating(true);
    try {
      const validation = validateWorkflow(nodes as Node<WorkflowNodeData>[], edges);
      const updatedNodes = nodes.map((n) => {
        const errs = validation.nodeErrors.filter((e) => e.nodeId === n.id);
        const current = (n.data as any).validationErrors || [];
        const same = current.length === errs.length && current.every((c: any, i: number) => c.message === errs[i]?.message);
        if (same) return n;
        return { ...n, data: { ...(n.data as any), validationErrors: errs } };
      });
      const changed = updatedNodes.some((un, i) => un !== nodes[i]);
      if (changed) setNodes(updatedNodes);

      setShowTestPanel(true);
      const res = await simulateWorkflow(nodes, edges);
      setInitialTestResult(res);
    } catch (err) {
      console.error('Validation failed', err);
      showToast('Validation error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
      setInitialTestResult({ success: false, steps: [], errors: ['Validation failed'] });
    } finally {
      setValidating(false);
    }
  };

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const last = p[p.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(last.nodes);
      setEdges(last.edges);
      return p.slice(0, p.length - 1);
    });
  }, [nodes, edges]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setPast((p) => p.concat([{ nodes, edges }]));
      setNodes(next.nodes);
      setEdges(next.edges);
      return f.slice(1);
    });
  }, [nodes, edges]);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return '#16a34a';
              case 'task':
                return '#2563eb';
              case 'approval':
                return '#ea580c';
              case 'automated':
                return '#9333ea';
              case 'end':
                return '#dc2626';
              default:
                return '#6b7280';
            }
          }}
          className="bg-white border border-gray-200"
        />
      </ReactFlow>

      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setShowTestPanel(!showTestPanel)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-lg transition-colors"
        >
          <TestTube size={18} />
          Test Workflow
        </button>
        <button
          onClick={runValidationOnly}
          disabled={validating}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? <Loader size={16} className="animate-spin" /> : 'Validate'}
        </button>
        <button
          onClick={exportWorkflow}
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow border border-gray-200 transition-colors"
        >
          Export
        </button>
        <label className="px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow border border-gray-200 transition-colors cursor-pointer">
          Import
          <input type="file" accept="application/json" onChange={importWorkflow} className="hidden" />
        </label>
        <button
          onClick={undo}
          disabled={past.length === 0}
          className="px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={past.length === 0 ? 'No undo history' : 'Undo'}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          className="px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={future.length === 0 ? 'No redo history' : 'Redo'}
        >
          Redo
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-50 shadow-lg border border-gray-200 transition-colors"
        >
          Clear Canvas
        </button>
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <PlayCircle size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Drag nodes from the sidebar to start</p>
            <p className="text-sm mt-1">Build your HR workflow visually</p>
          </div>
        </div>
      )}

      {selectedNode && (
        <NodeConfigPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onUpdate={handleNodeUpdate}
        />
      )}

      {showTestPanel && (
        <TestPanel
          nodes={nodes}
          edges={edges}
          initialResult={initialTestResult}
          onClose={() => { setShowTestPanel(false); setInitialTestResult(null); }}
        />
      )}
    </div>
  );
};
