import { useState, useCallback } from 'react';
import { WorkflowNodeData } from '../types/workflow.types';

/**
 * Custom hook for managing node form state
 * Provides controlled component pattern with proper typing
 */
export function useNodeForm<T extends WorkflowNodeData>(
  initialData: T,
  onUpdate: (data: T) => void
) {
  const [formData, setFormData] = useState<T>(initialData);

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      const updated = { ...formData, [field]: value } as T;
      setFormData(updated);
      onUpdate(updated);
    },
    [formData, onUpdate]
  );

  const handleArrayChange = useCallback(
    (field: keyof T, newArray: any[]) => {
      const updated = { ...formData, [field]: newArray } as T;
      setFormData(updated);
      onUpdate(updated);
    },
    [formData, onUpdate]
  );

  const handleObjectChange = useCallback(
    (field: keyof T, newObject: Record<string, any>) => {
      const updated = { ...formData, [field]: newObject } as T;
      setFormData(updated);
      onUpdate(updated);
    },
    [formData, onUpdate]
  );

  return {
    formData,
    setFormData,
    handleChange,
    handleArrayChange,
    handleObjectChange,
  };
}

/**
 * Custom hook for managing metadata/custom fields
 */
export function useMetadataFields(
  initialFields: Array<{ key: string; value: string }>
) {
  const [fields, setFields] = useState(initialFields);

  const addField = useCallback(() => {
    setFields((prev) => [...prev, { key: '', value: '' }]);
  }, []);

  const updateField = useCallback((index: number, key: 'key' | 'value', value: string) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  }, []);

  const removeField = useCallback((index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const hasDuplicateKeys = useCallback(() => {
    const keys = fields.map((f) => f.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [fields]);

  return {
    fields,
    setFields,
    addField,
    updateField,
    removeField,
    hasDuplicateKeys,
  };
}
