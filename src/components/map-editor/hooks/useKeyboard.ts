'use client';

import { useEffect, useCallback } from 'react';
import { MapEditorHook } from './useMapEditor';

export function useKeyboard(editor: MapEditorHook) {
  const {
    setActiveTool,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    selectAll,
    clearSelection,
    save,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
    selectedIds,
    isPreviewMode,
  } = editor;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle if in input/textarea or preview mode
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      isPreviewMode
    ) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Tool shortcuts (single keys)
    if (!cmdOrCtrl && !e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'v':
          e.preventDefault();
          setActiveTool('select');
          break;
        case 'r':
          e.preventDefault();
          setActiveTool('rectangle');
          break;
        case 'c':
          e.preventDefault();
          setActiveTool('circle');
          break;
        case 'p':
          e.preventDefault();
          setActiveTool('polygon');
          break;
        case 'l':
          e.preventDefault();
          setActiveTool('line');
          break;
        case 't':
          e.preventDefault();
          setActiveTool('text');
          break;
        case 'h':
        case ' ':
          e.preventDefault();
          setActiveTool('pan');
          break;
        case 'delete':
        case 'backspace':
          e.preventDefault();
          deleteSelected();
          break;
        case 'escape':
          e.preventDefault();
          clearSelection();
          setActiveTool('select');
          break;
        case 'g':
          e.preventDefault();
          toggleGrid();
          break;
      }
    }

    // Cmd/Ctrl shortcuts
    if (cmdOrCtrl && !e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          undo();
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'a':
          e.preventDefault();
          selectAll();
          break;
        case 'd':
          e.preventDefault();
          duplicateSelected();
          break;
        case 's':
          e.preventDefault();
          save();
          break;
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    }

    // Cmd/Ctrl + Shift shortcuts
    if (cmdOrCtrl && e.shiftKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          redo();
          break;
      }
    }
  }, [
    setActiveTool,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    selectAll,
    clearSelection,
    save,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
    isPreviewMode,
  ]);

  // Handle spacebar for temporary pan
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      setActiveTool('select');
    }
  }, [setActiveTool]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
}
