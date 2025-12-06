import { X } from 'lucide-react';
import { Node } from 'reactflow';
import { WorkflowNodeData } from '../../types/workflow.types';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedNodeForm } from './AutomatedNodeForm';
import { EndNodeForm } from './EndNodeForm';

interface NodeConfigPanelProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: WorkflowNodeData) => void;
}

export const NodeConfigPanel = ({
  selectedNode,
  onClose,
  onUpdate,
}: NodeConfigPanelProps) => {
  if (!selectedNode) return null;

  const handleUpdate = (data: WorkflowNodeData) => {
    onUpdate(selectedNode.id, data);
  };

  const renderForm = () => {
    switch (selectedNode.data.type) {
      case 'start':
        return <StartNodeForm data={selectedNode.data} onUpdate={handleUpdate} />;
      case 'task':
        return <TaskNodeForm data={selectedNode.data} onUpdate={handleUpdate} />;
      case 'approval':
        return <ApprovalNodeForm data={selectedNode.data} onUpdate={handleUpdate} />;
      case 'automated':
        return <AutomatedNodeForm data={selectedNode.data} onUpdate={handleUpdate} />;
      case 'end':
        return <EndNodeForm data={selectedNode.data} onUpdate={handleUpdate} />;
      default:
        return <div>Unknown node type</div>;
    }
  };

  return (
    <div className="absolute right-4 top-4 bottom-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Node Configuration</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{renderForm()}</div>
    </div>
  );
};
