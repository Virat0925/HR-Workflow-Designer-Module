import { NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { AutomatedNodeData } from '../../types/workflow.types';

export const AutomatedNode = (props: NodeProps<AutomatedNodeData>) => {
  return <BaseNode {...props} icon={Zap} color="bg-purple-600" />;
};
