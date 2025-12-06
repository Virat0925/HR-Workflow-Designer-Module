import { useState, useEffect } from 'react';
import { Play, X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { simulateWorkflow } from '../api/mockApi';
import { SimulationResult, SimulationStep } from '../types/workflow.types';

interface TestPanelProps {
  nodes: Node[];
  edges: Edge[];
  initialResult?: SimulationResult | null;
  onClose: () => void;
}

export const TestPanel = ({ nodes, edges, initialResult, onClose }: TestPanelProps) => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
    }
  }, [initialResult]);

  const nodeLevelErrors = nodes
    .flatMap((n) => ((n.data as any).validationErrors || []).map((ve: any) => ({ nodeId: n.id, message: ve.message })));

  const runSimulation = async () => {
    setLoading(true);
    try {
      const simulationResult = await simulateWorkflow(nodes, edges);
      setResult(simulationResult);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: SimulationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'executing':
        return <Clock size={16} className="text-blue-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10" style={{ height: '300px' }}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Test Sandbox</h2>
          {result && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                result.success
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {result.success ? 'Valid' : 'Invalid'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            {loading ? 'Running...' : 'Run Test'}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Play size={48} className="mb-2" />
            <p>Click "Run Test" to simulate workflow execution</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.errors.length > 0 || nodeLevelErrors.length > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">Validation Errors</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={`r-${index}`}>• {error}</li>
                      ))}
                      {nodeLevelErrors.map((e, i) => (
                        <li key={`n-${i}`}>• [{e.nodeId}] {e.message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Execution Timeline</h3>
                <div className="space-y-2">
                  {result.steps.length > 0 ? (
                    result.steps.map((step, index) => (
                      <div
                        key={step.nodeId}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getStepIcon(step)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">
                              Step {index + 1}
                            </span>
                            <span className="text-xs font-medium text-gray-600 uppercase">
                              {step.nodeType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {step.nodeTitle}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No steps to display
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
