import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TaskNodeData, MetadataField } from '../../types/workflow.types';

interface TaskNodeFormProps {
  data: TaskNodeData;
  onUpdate: (data: TaskNodeData) => void;
}

export const TaskNodeForm = ({ data, onUpdate }: TaskNodeFormProps) => {
  const [formData, setFormData] = useState<TaskNodeData>(data);

  const handleChange = (
    field: keyof TaskNodeData,
    value: string | MetadataField[]
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const addCustomField = () => {
    const updated = [...formData.customFields, { key: '', value: '' }];
    handleChange('customFields', updated);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...formData.customFields];
    updated[index][field] = value;
    handleChange('customFields', updated);
  };

  const removeCustomField = (index: number) => {
    const updated = formData.customFields.filter((_, i) => i !== index);
    handleChange('customFields', updated);
  };

  const isDuplicateKey = (keys: string[]) => {
    return new Set(keys).size !== keys.length;
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
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assignee
        </label>
        <input
          type="text"
          value={formData.assignee}
          onChange={(e) => handleChange('assignee', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter assignee name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Custom Fields
          </label>
          <button
            onClick={addCustomField}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Field
          </button>
        </div>
        {isDuplicateKey(formData.customFields.map((f) => f.key)) && (
          <div className="text-xs text-red-600 mb-2">⚠ Duplicate keys detected</div>
        )}
        <div className="space-y-2">
          {formData.customFields.map((field, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Key"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Value"
              />
              <button
                onClick={() => removeCustomField(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
