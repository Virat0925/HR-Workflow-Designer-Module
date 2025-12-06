import { EndNodeData } from '../../types/workflow.types';
import { useNodeForm } from '../../hooks/useNodeForm';

interface EndNodeFormProps {
  data: EndNodeData;
  onUpdate: (data: EndNodeData) => void;
}

export const EndNodeForm = ({ data, onUpdate }: EndNodeFormProps) => {
  const { formData, handleChange } = useNodeForm(data, onUpdate);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Message <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.endMessage}
          onChange={(e) => handleChange('endMessage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter completion message"
          rows={3}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.summaryFlag}
            onChange={(e) => handleChange('summaryFlag', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Generate summary report
          </span>
        </label>
        <p className="mt-1 text-xs text-gray-500 ml-6">
          Automatically generate a summary report when workflow completes
        </p>
      </div>
    </div>
  );
};
