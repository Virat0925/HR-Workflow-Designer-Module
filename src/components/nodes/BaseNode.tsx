import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '../../types/workflow.types';
import { LucideIcon } from 'lucide-react';

interface BaseNodeProps extends NodeProps {
  data: WorkflowNodeData & { label?: string };
  icon: LucideIcon;
  color: string;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
}

export const BaseNode = ({
  data,
  icon: Icon,
  color,
  selected,
  showSourceHandle = true,
  showTargetHandle = true,
}: BaseNodeProps) => {
  const getTitle = (): string => {
    const nodeData = data as any;
    if (nodeData.title) {
      return nodeData.title;
    }
    if (nodeData.endMessage) {
      return 'End';
    }
    return data.type.charAt(0).toUpperCase() + data.type.slice(1);
  };

  const title = getTitle();

  const hasErrors = (data as any).validationErrors && (data as any).validationErrors.length > 0;
  const errorTooltip = hasErrors ? (data as any).validationErrors.map((v: any) => v.message).join('; ') : undefined;

  return (
    <div
      title={errorTooltip}
      className={`bg-white rounded-lg shadow-md border-2 transition-all ${
        hasErrors
          ? 'border-red-500 ring-2 ring-red-100'
          : selected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200'
      }`}
      style={{ minWidth: '200px' }}
    >
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400"
        />
      )}

      <div className={`px-4 py-2 rounded-t-lg ${color}`}>
        <div className="flex items-center gap-2 text-white">
          <Icon size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {data.type}
          </span>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        {data.type === 'task' && (
          <div className="mt-1 text-xs text-gray-500">
            {data.assignee && `Assigned to: ${data.assignee}`}
          </div>
        )}
        {data.type === 'approval' && (
          <div className="mt-1 text-xs text-gray-500">
            {data.approverRole && `Approver: ${data.approverRole}`}
          </div>
        )}
      </div>

      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400"
        />
      )}
    </div>
  );
};
