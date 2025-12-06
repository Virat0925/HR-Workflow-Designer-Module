import { NodeProps } from 'reactflow';
import { Flag } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { EndNodeData } from '../../types/workflow.types';

export const EndNode = (props: NodeProps<EndNodeData>) => {
  return (
    <BaseNode
      {...props}
      icon={Flag}
      color="bg-red-600"
      showSourceHandle={false}
    />
  );
};
