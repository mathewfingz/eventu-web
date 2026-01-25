'use client';

import {
  MousePointer2,
  Square,
  Circle,
  Hexagon,
  Minus,
  Type,
  Hand,
  Theater,
  Wine,
  Bath,
  DoorOpen,
  DoorClosed,
  Music,
  Headphones,
  Crown,
  ArrowUpFromLine,
  Trash2,
  Copy,
  Layers,
  Lock,
  Unlock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapEditorHook } from '../hooks/useMapEditor';
import { Tool, ElementType, ELEMENT_DEFAULTS } from '../types';

interface ToolsPanelProps {
  editor: MapEditorHook;
}

const drawingTools: { tool: Tool; icon: typeof Square; label: string; shortcut: string }[] = [
  { tool: 'select', icon: MousePointer2, label: 'Seleccionar', shortcut: 'V' },
  { tool: 'pan', icon: Hand, label: 'Mover', shortcut: 'H' },
  { tool: 'rectangle', icon: Square, label: 'Rectángulo', shortcut: 'R' },
  { tool: 'circle', icon: Circle, label: 'Círculo', shortcut: 'C' },
  { tool: 'polygon', icon: Hexagon, label: 'Polígono', shortcut: 'P' },
  { tool: 'line', icon: Minus, label: 'Línea', shortcut: 'L' },
  { tool: 'text', icon: Type, label: 'Texto', shortcut: 'T' },
];

const elementLibrary: { type: ElementType; icon: typeof Theater; label: string }[] = [
  { type: 'STAGE', icon: Theater, label: 'Escenario' },
  { type: 'BAR', icon: Wine, label: 'Barra' },
  { type: 'BATHROOM', icon: Bath, label: 'Baños' },
  { type: 'EXIT', icon: DoorOpen, label: 'Salida' },
  { type: 'ENTRANCE', icon: DoorClosed, label: 'Entrada' },
  { type: 'DANCE_FLOOR', icon: Music, label: 'Pista' },
  { type: 'DJ_BOOTH', icon: Headphones, label: 'DJ Booth' },
  { type: 'VIP_LOUNGE', icon: Crown, label: 'VIP Lounge' },
  { type: 'ELEVATOR', icon: ArrowUpFromLine, label: 'Ascensor' },
];

export function ToolsPanel({ editor }: ToolsPanelProps) {
  const {
    activeTool,
    setActiveTool,
    selectedIds,
    selectedType,
    addElement,
    deleteSelected,
    duplicateSelected,
    getSelectedElements,
    updateElement,
    map,
  } = editor;

  const handleAddElement = (type: ElementType) => {
    const defaults = ELEMENT_DEFAULTS[type];
    addElement({
      type,
      x: map.width / 2 - defaults.width / 2,
      y: map.height / 2 - defaults.height / 2,
      width: defaults.width,
      height: defaults.height,
      color: defaults.color,
      rotation: 0,
      layer: type === 'STAGE' ? 0 : 1,
      isLocked: false,
    });
  };

  const selectedElement = selectedType === 'element' && selectedIds.length === 1
    ? map.elements.find(e => e.id === selectedIds[0])
    : null;

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-1">
      {/* Drawing Tools */}
      <div className="flex flex-col gap-1">
        {drawingTools.map(({ tool, icon: Icon, label, shortcut }) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative',
              activeTool === tool
                ? 'bg-[#E53935] text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
            title={`${label} (${shortcut})`}
          >
            <Icon className="w-5 h-5" />
            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              {label} ({shortcut})
            </span>
          </button>
        ))}
      </div>

      <div className="w-8 h-px bg-gray-700 my-3" />

      {/* Element Library */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 rotate-[-90deg] w-16 text-center">

        </span>
        {elementLibrary.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => handleAddElement(type)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors group relative"
            title={label}
          >
            <Icon className="w-5 h-5" />
            {/* Tooltip */}
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Selection Actions */}
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="w-8 h-px bg-gray-700 mb-2" />

          <button
            onClick={duplicateSelected}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors group relative"
            title="Duplicar (Ctrl+D)"
          >
            <Copy className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              Duplicar
            </span>
          </button>

          {selectedElement && (
            <button
              onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
              className={cn(
                'w-10 h-10 flex items-center justify-center rounded-lg transition-colors group relative',
                selectedElement.isLocked
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
              title={selectedElement.isLocked ? 'Desbloquear' : 'Bloquear'}
            >
              {selectedElement.isLocked ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Unlock className="w-5 h-5" />
              )}
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                {selectedElement.isLocked ? 'Desbloquear' : 'Bloquear'}
              </span>
            </button>
          )}

          <button
            onClick={deleteSelected}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-colors group relative"
            title="Eliminar (Delete)"
          >
            <Trash2 className="w-5 h-5" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              Eliminar
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
