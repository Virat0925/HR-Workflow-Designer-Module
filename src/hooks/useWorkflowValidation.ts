import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowNodeData } from '../types/workflow.types';
import { validateWorkflow } from '../utils/validateWorkflow';
import { DEBOUNCE_DELAYS } from '../constants/nodeConfig';

/**
 * Custom hook for managing workflow validation with debouncing
 * Prevents excessive validation runs and improves performance
 * Automatically updates nodes with validation errors
 */
export function useWorkflowValidation(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  setNodes: (updater: (nds: Node[]) => Node[]) => void
) {
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      setIsValidating(true);
      try {
        const validation = validateWorkflow(nodes, edges);

        // Update nodes with validation errors
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            const errs = validation.nodeErrors.filter((e) => e.nodeId === n.id);
            const current = (n.data as any).validationErrors || [];
            const same = current.length === errs.length && current.every((c: any, i: number) => c.message === errs[i]?.message);
            if (same) return n;
            return { ...n, data: { ...(n.data as any), validationErrors: errs } };
          })
        );
      } finally {
        setIsValidating(false);
      }
    }, DEBOUNCE_DELAYS.WORKFLOW_VALIDATION);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [nodes, edges, setNodes]);

  return { isValidating };
}

/**
 * Custom hook for managing undo/redo with history limit
 */
export function useWorkflowHistory(maxEntries = 50) {
  const [past, setPast] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);

  const addToHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      setPast((prevPast) => {
        const newHistory = [{ nodes, edges }, ...prevPast];
        // Limit history to max entries to prevent memory issues
        return newHistory.slice(0, maxEntries);
      });
      setFuture([]); // Clear future when new action is taken
    },
    [maxEntries]
  );

  const undo = useCallback(
    (
      currentNodes: Node[],
      currentEdges: Edge[],
      setNodes: (nodes: Node[]) => void,
      setEdges: (edges: Edge[]) => void
    ) => {
      setPast((prevPast) => {
        if (prevPast.length === 0) return prevPast;

        const lastState = prevPast[prevPast.length - 1];
        setFuture((prevFuture) => [{ nodes: currentNodes, edges: currentEdges }, ...prevFuture]);
        setNodes(lastState.nodes);
        setEdges(lastState.edges);

        return prevPast.slice(0, prevPast.length - 1);
      });
    },
    []
  );

  const redo = useCallback(
    (
      currentNodes: Node[],
      currentEdges: Edge[],
      setNodes: (nodes: Node[]) => void,
      setEdges: (edges: Edge[]) => void
    ) => {
      setFuture((prevFuture) => {
        if (prevFuture.length === 0) return prevFuture;

        const nextState = prevFuture[0];
        setPast((prevPast) => [...prevPast, { nodes: currentNodes, edges: currentEdges }]);
        setNodes(nextState.nodes);
        setEdges(nextState.edges);

        return prevFuture.slice(1);
      });
    },
    []
  );

  return {
    past,
    future,
    addToHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
