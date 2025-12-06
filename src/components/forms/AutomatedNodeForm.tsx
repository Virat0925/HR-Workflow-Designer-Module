import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { AutomatedNodeData, AutomationAction } from '../../types/workflow.types';
import { getAutomations } from '../../api/mockApi';
import { showToast } from '../../utils/toast';
import { useNodeForm } from '../../hooks/useNodeForm';

interface AutomatedNodeFormProps {
  data: AutomatedNodeData;
  onUpdate: (data: AutomatedNodeData) => void;
}

export const AutomatedNodeForm = ({ data, onUpdate }: AutomatedNodeFormProps) => {
  const { formData, handleChange } = useNodeForm(data, onUpdate);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<AutomationAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActions = async () => {
      try {
        setError(null);
        const availableActions = await getAutomations();
        setActions(availableActions);
        if (formData.actionId) {
          const action = availableActions.find((a) => a.id === formData.actionId);
          setSelectedAction(action || null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        showToast(`Failed to load actions: ${msg}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadActions();
  }, [formData.actionId]);

  const handleActionChange = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    setSelectedAction(action || null);
    handleChange('actionId', actionId);
    handleChange('actionParams', {});
  };

  const handleParamChange = (paramName: string, value: string) => {
    const updated = { ...formData.actionParams, [paramName]: value };
    handleChange('actionParams', updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-900 text-sm">Error loading actions</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

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
          placeholder="Enter automation title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Action <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.actionId}
          onChange={(e) => handleActionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select an action</option>
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </select>
      </div>

      {selectedAction && selectedAction.params.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Parameters
          </label>
          <div className="space-y-3">
            {selectedAction.params.map((param) => (
              <div key={param}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {param.charAt(0).toUpperCase() + param.slice(1)}
                </label>
                <input
                  type="text"
                  value={formData.actionParams[param] || ''}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder={`Enter ${param}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
