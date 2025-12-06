import { useState } from 'react';
import { ApprovalNodeData } from '../../types/workflow.types';

interface ApprovalNodeFormProps {
  data: ApprovalNodeData;
  onUpdate: (data: ApprovalNodeData) => void;
}

export const ApprovalNodeForm = ({ data, onUpdate }: ApprovalNodeFormProps) => {
  const [formData, setFormData] = useState<ApprovalNodeData>(data);

  const handleChange = (field: keyof ApprovalNodeData, value: string | number) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter approval title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Approver Role <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.approverRole}
          onChange={(e) => handleChange('approverRole', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select role</option>
          <option value="Manager">Manager</option>
          <option value="HRBP">HR Business Partner</option>
          <option value="Director">Director</option>
          <option value="VP">Vice President</option>
          <option value="C-Level">C-Level Executive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Auto-Approve Threshold
        </label>
        <input
          type="number"
          value={formData.autoApproveThreshold}
          onChange={(e) => handleChange('autoApproveThreshold', Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter threshold amount"
          min="0"
        />
        <p className="mt-1 text-xs text-gray-500">
          Requests below this amount will be automatically approved
        </p>
      </div>
    </div>
  );
};
