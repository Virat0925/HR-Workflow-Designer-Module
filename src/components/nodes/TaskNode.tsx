import { NodeProps } from 'reactflow';
import { CheckSquare } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { TaskNodeData } from '../../types/workflow.types';

export const TaskNode = (props: NodeProps<TaskNodeData>) => {
  return <BaseNode {...props} icon={CheckSquare} color="bg-blue-600" />;
};
