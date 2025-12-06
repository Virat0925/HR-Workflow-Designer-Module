import { NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { StartNodeData } from '../../types/workflow.types';

export const StartNode = (props: NodeProps<StartNodeData>) => {
  return (
    <BaseNode
      {...props}
      icon={Play}
      color="bg-green-600"
      showTargetHandle={false}
    />
  );
};
