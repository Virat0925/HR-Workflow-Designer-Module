import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
const getToastId = () => `toast_${toastId++}`;

let listeners: ((toast: Toast) => void)[] = [];
let removeListeners: ((id: string) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info', duration = 4000) => {
  const id = getToastId();
  const toast: Toast = { id, type, message, duration };
  listeners.forEach((cb) => cb(toast));
  if (duration > 0) {
    setTimeout(() => {
      removeListeners.forEach((cb) => cb(id));
    }, duration);
  }
};

export const useToasts = () => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const onAdd = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    const onRemove = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    listeners.push(onAdd);
    removeListeners.push(onRemove);

    return () => {
      listeners = listeners.filter((l) => l !== onAdd);
      removeListeners = removeListeners.filter((l) => l !== onRemove);
    };
  }, []);

  return toasts;
};

export const ToastContainer = () => {
  const toasts = useToasts();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border ${getBgColor(
            toast.type
          )} shadow-lg animate-slideIn`}
        >
          {getIcon(toast.type)}
          <p className={`text-sm font-medium ${getTextColor(toast.type)}`}>
            {toast.message}
          </p>
          <button
            onClick={() => {
              removeListeners.forEach((cb) => cb(toast.id));
            }}
            className="ml-auto p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X size={16} className="text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  );
};
