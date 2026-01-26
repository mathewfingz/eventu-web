'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMapEditor } from './hooks/useMapEditor';
import { useKeyboard } from './hooks/useKeyboard';
import { Toolbar } from './panels/Toolbar';
import { ToolsPanel } from './panels/ToolsPanel';
import { PropertiesPanel } from './panels/PropertiesPanel';
import { SeatGenerator } from './generators/SeatGenerator';
import { TableGenerator } from './generators/TableGenerator';
import { VenueMap, MapSeat, MapTable } from './types';
import { Loader2 } from 'lucide-react';

// Dynamically import EditorCanvas to avoid SSR issues with Konva
const EditorCanvas = dynamic(
  () => import('./EditorCanvas').then(mod => mod.EditorCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
      </div>
    ),
  }
);

interface MapEditorProps {
  initialMap?: VenueMap;
  onSave?: (map: VenueMap) => Promise<void>;
  eventId?: string;
  venueId?: string;
  onChange?: (map: VenueMap) => void;
  onSectionSelect?: (id: string | null) => void;
  showGrid?: boolean;
}

export function MapEditor({ initialMap, onSave, eventId: _eventId, venueId: _venueId, onChange, onSectionSelect, showGrid }: MapEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showSeatGenerator, setShowSeatGenerator] = useState(false);
  const [showTableGenerator, setShowTableGenerator] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const editor = useMapEditor({
    initialMap,
    onSave,
  });

  // Setup keyboard shortcuts
  useKeyboard(editor);

  // Sync state with parent
  useEffect(() => {
    onChange?.(editor.map);
  }, [editor.map, onChange]);

  useEffect(() => {
    if (onSectionSelect) {
      const sectionId = editor.selectedType === 'section' && editor.selectedIds.length === 1
        ? editor.selectedIds[0]
        : null;
      onSectionSelect(sectionId);
    }
  }, [editor.selectedIds, editor.selectedType, onSectionSelect]);

  useEffect(() => {
    if (showGrid !== undefined && editor.map.showGrid !== showGrid) {
      editor.updateMapProperties({ showGrid });
    }
  }, [showGrid, editor]);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Get selected section for generators
  const selectedSection = editor.selectedType === 'section' && editor.selectedIds.length === 1
    ? editor.map.sections.find(s => s.id === editor.selectedIds[0])
    : null;

  const handleGenerateSeats = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowSeatGenerator(true);
  };

  const handleGenerateTables = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setShowTableGenerator(true);
  };

  const handleSeatsGenerated = (seats: Omit<MapSeat, 'id' | 'sectionId'>[]) => {
    if (selectedSectionId) {
      editor.addSeatsToSection(selectedSectionId, seats);
      // Update section capacity
      const section = editor.map.sections.find(s => s.id === selectedSectionId);
      if (section) {
        editor.updateSection(selectedSectionId, {
          capacity: seats.length,
        });
      }
    }
  };

  const handleTablesGenerated = (tables: Omit<MapTable, 'id' | 'sectionId'>[]) => {
    if (selectedSectionId) {
      editor.addTablesToSection(selectedSectionId, tables);
      // Update section capacity
      const totalSeats = tables.reduce((sum, t) => sum + t.seats, 0);
      editor.updateSection(selectedSectionId, {
        capacity: totalSeats,
      });
    }
  };

  const sectionForGenerator = selectedSectionId
    ? editor.map.sections.find(s => s.id === selectedSectionId)
    : null;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Toolbar */}
      <Toolbar editor={editor} />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tools Panel */}
        <ToolsPanel editor={editor} />

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden bg-gray-200 relative"
        >
          {/* Preview mode banner */}
          {editor.isPreviewMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Vista Previa - Modo Comprador
            </div>
          )}

          <EditorCanvas
            editor={editor}
            width={dimensions.width}
            height={dimensions.height}
          />

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow px-3 py-1.5 text-sm text-gray-600">
            {Math.round(editor.canvasState.zoom * 100)}%
          </div>

          {/* Selection info */}
          {editor.selectedIds.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow px-3 py-1.5 text-sm text-gray-600">
              {editor.selectedIds.length} elemento{editor.selectedIds.length > 1 ? 's' : ''} seleccionado{editor.selectedIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel
          editor={editor}
          onGenerateSeats={handleGenerateSeats}
          onGenerateTables={handleGenerateTables}
        />
      </div>

      {/* Seat Generator Modal */}
      {sectionForGenerator && (
        <SeatGenerator
          open={showSeatGenerator}
          onClose={() => {
            setShowSeatGenerator(false);
            setSelectedSectionId(null);
          }}
          section={sectionForGenerator}
          onGenerate={handleSeatsGenerated}
        />
      )}

      {/* Table Generator Modal */}
      {sectionForGenerator && (
        <TableGenerator
          open={showTableGenerator}
          onClose={() => {
            setShowTableGenerator(false);
            setSelectedSectionId(null);
          }}
          section={sectionForGenerator}
          onGenerate={handleTablesGenerated}
        />
      )}

      {/* Keyboard shortcuts help (hidden by default) */}
      <div className="hidden">
        <div className="text-xs text-gray-500 p-4">
          <p><strong>V</strong> - Seleccionar</p>
          <p><strong>R</strong> - Rectángulo</p>
          <p><strong>C</strong> - Círculo</p>
          <p><strong>H/Space</strong> - Mover</p>
          <p><strong>Delete</strong> - Eliminar</p>
          <p><strong>Ctrl+Z</strong> - Deshacer</p>
          <p><strong>Ctrl+Y</strong> - Rehacer</p>
          <p><strong>Ctrl+D</strong> - Duplicar</p>
          <p><strong>Ctrl+S</strong> - Guardar</p>
          <p><strong>G</strong> - Cuadrícula</p>
        </div>
      </div>
    </div>
  );
}

export default MapEditor;
