import { Play, CheckSquare, UserCheck, Zap, Flag, LucideIcon } from 'lucide-react';
import { NodeType } from '../types/workflow.types';

interface NodeTypeConfig {
  type: NodeType;
  label: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

const nodeTypes: NodeTypeConfig[] = [
  {
    type: 'start',
    label: 'Start',
    icon: Play,
    color: 'bg-green-600',
    description: 'Workflow entry point',
  },
  {
    type: 'task',
    label: 'Task',
    icon: CheckSquare,
    color: 'bg-blue-600',
    description: 'Human task step',
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: UserCheck,
    color: 'bg-orange-600',
    description: 'Approval step',
  },
  {
    type: 'automated',
    label: 'Automated',
    icon: Zap,
    color: 'bg-purple-600',
    description: 'System automation',
  },
  {
    type: 'end',
    label: 'End',
    icon: Flag,
    color: 'bg-red-600',
    description: 'Workflow completion',
  },
];

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Node Palette</h2>
        <p className="text-sm text-gray-500 mt-1">
          Drag nodes onto the canvas
        </p>
      </div>

      <div className="space-y-2">
        {nodeTypes.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <div
              key={nodeType.type}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.type)}
              className="p-3 border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`${nodeType.color} p-1.5 rounded text-white`}>
                  <Icon size={16} />
                </div>
                <span className="font-medium text-gray-900 text-sm">
                  {nodeType.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 ml-8">{nodeType.description}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
