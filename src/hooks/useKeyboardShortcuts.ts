import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

/**
 * Custom hook for handling keyboard shortcuts
 * Implements common shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo), Ctrl+S (export), etc.
 */
export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts if user is typing in an input
      const isInputElement =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement;

      if (isInputElement && event.key !== 'Escape') {
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        config.onUndo?.();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        config.onRedo?.();
      }

      // Ctrl/Cmd + S: Export (save)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        config.onExport?.();
      }

      // Ctrl/Cmd + Enter: Test workflow
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        config.onTest?.();
      }

      // Delete: Delete selected node
      if (event.key === 'Delete') {
        event.preventDefault();
        config.onDelete?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config]);
}
