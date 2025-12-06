import { NodeProps } from 'reactflow';
import { UserCheck } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { ApprovalNodeData } from '../../types/workflow.types';

export const ApprovalNode = (props: NodeProps<ApprovalNodeData>) => {
  return <BaseNode {...props} icon={UserCheck} color="bg-orange-600" />;
};
