import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { StartNodeData, MetadataField } from '../../types/workflow.types';

interface StartNodeFormProps {
  data: StartNodeData;
  onUpdate: (data: StartNodeData) => void;
}

export const StartNodeForm = ({ data, onUpdate }: StartNodeFormProps) => {
  const [formData, setFormData] = useState<StartNodeData>(data);

  const handleChange = (field: keyof StartNodeData, value: string | MetadataField[]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const addMetadata = () => {
    const updated = [...formData.metadata, { key: '', value: '' }];
    handleChange('metadata', updated);
  };

  const updateMetadata = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...formData.metadata];
    updated[index][field] = value;
    handleChange('metadata', updated);
  };

  const removeMetadata = (index: number) => {
    const updated = formData.metadata.filter((_, i) => i !== index);
    handleChange('metadata', updated);
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
          placeholder="Enter start title"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Metadata Fields
          </label>
          <button
            onClick={addMetadata}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Add Field
          </button>
        </div>
        {isDuplicateKey(formData.metadata.map((f) => f.key)) && (
          <div className="text-xs text-red-600 mb-2">⚠ Duplicate keys detected</div>
        )}
        <div className="space-y-2">
          {formData.metadata.map((field, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={field.key}
                onChange={(e) => updateMetadata(index, 'key', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Key"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateMetadata(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Value"
              />
              <button
                onClick={() => removeMetadata(index)}
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
