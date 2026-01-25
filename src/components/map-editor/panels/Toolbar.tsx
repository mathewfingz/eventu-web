'use client';

import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapEditorHook } from '../hooks/useMapEditor';

interface ToolbarProps {
  editor: MapEditorHook;
}

export function Toolbar({ editor }: ToolbarProps) {
  const {
    canvasState,
    map,
    isDirty,
    isSaving,
    canUndo,
    canRedo,
    isPreviewMode,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleGrid,
    save,
    setIsPreviewMode,
  } = editor;

  const zoomPercentage = Math.round(canvasState.zoom * 100);

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left side - File operations */}
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={isSaving || !isDirty}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isDirty
              ? 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isDirty ? (
            <Save className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isSaving ? 'Guardando...' : isDirty ? 'Guardar' : 'Guardado'}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canUndo
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          )}
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canRedo
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          )}
          title="Rehacer (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Center - Map name */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{map.name}</span>
        <span className="text-xs text-gray-400">
          {map.width}x{map.height}px
        </span>
      </div>

      {/* Right side - View controls */}
      <div className="flex items-center gap-2">
        {/* Preview toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isPreviewMode
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-4 h-4" />
              Salir Vista Previa
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Vista Previa
            </>
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Grid toggle */}
        <button
          onClick={toggleGrid}
          className={cn(
            'p-2 rounded-lg transition-colors',
            map.showGrid
              ? 'bg-gray-200 text-gray-700'
              : 'hover:bg-gray-100 text-gray-500'
          )}
          title="Mostrar/Ocultar Cuadrícula (G)"
        >
          <Grid3X3 className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        {/* Zoom controls */}
        <button
          onClick={zoomOut}
          disabled={canvasState.zoom <= 0.25}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canvasState.zoom > 0.25
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          )}
          title="Alejar (Ctrl+-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetZoom}
          className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[60px]"
          title="Restablecer zoom (Ctrl+0)"
        >
          {zoomPercentage}%
        </button>

        <button
          onClick={zoomIn}
          disabled={canvasState.zoom >= 4}
          className={cn(
            'p-2 rounded-lg transition-colors',
            canvasState.zoom < 4
              ? 'hover:bg-gray-100 text-gray-700'
              : 'text-gray-300 cursor-not-allowed'
          )}
          title="Acercar (Ctrl++)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={resetZoom}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          title="Ajustar a pantalla"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
