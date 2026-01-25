'use client';

import { useState, useCallback, useRef } from 'react';
import {
  VenueMap,
  MapSection,
  MapElement,
  MapSeat,
  MapTable,
  Tool,
  EditorState,
  CanvasState,
  Position,
  SECTION_COLORS,
} from '../types';

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default empty map
const createEmptyMap = (): VenueMap => ({
  id: generateId(),
  name: 'Nuevo Mapa',
  width: 1200,
  height: 800,
  backgroundColor: '#f5f5f5',
  gridSize: 20,
  showGrid: true,
  isTemplate: false,
  version: 1,
  sections: [],
  elements: [],
});

interface UseMapEditorOptions {
  initialMap?: VenueMap;
  onSave?: (map: VenueMap) => Promise<void>;
}

export function useMapEditor(options: UseMapEditorOptions = {}) {
  const { initialMap, onSave } = options;

  // Main state
  const [map, setMap] = useState<VenueMap>(initialMap || createEmptyMap());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'section' | 'element' | 'seat' | 'table' | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<Position[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });

  // History for undo/redo
  const historyRef = useRef<{
    past: VenueMap[];
    future: VenueMap[];
  }>({
    past: [],
    future: [],
  });

  // Save to history before changes
  const saveToHistory = useCallback(() => {
    historyRef.current.past.push(JSON.parse(JSON.stringify(map)));
    historyRef.current.future = [];
    // Keep only last 50 states
    if (historyRef.current.past.length > 50) {
      historyRef.current.past.shift();
    }
  }, [map]);

  // Undo
  const undo = useCallback(() => {
    if (historyRef.current.past.length === 0) return;
    const previous = historyRef.current.past.pop()!;
    historyRef.current.future.unshift(JSON.parse(JSON.stringify(map)));
    setMap(previous);
    setSelectedIds([]);
    setSelectedType(null);
  }, [map]);

  // Redo
  const redo = useCallback(() => {
    if (historyRef.current.future.length === 0) return;
    const next = historyRef.current.future.shift()!;
    historyRef.current.past.push(JSON.parse(JSON.stringify(map)));
    setMap(next);
    setSelectedIds([]);
    setSelectedType(null);
  }, [map]);

  // Can undo/redo
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  // Update map properties
  const updateMapProperties = useCallback((updates: Partial<VenueMap>) => {
    saveToHistory();
    setMap(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Add section
  const addSection = useCallback((section: Omit<MapSection, 'id'>) => {
    saveToHistory();
    const newSection: MapSection = {
      ...section,
      id: generateId(),
    };
    setMap(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setSelectedIds([newSection.id]);
    setSelectedType('section');
    setIsDirty(true);
    return newSection;
  }, [saveToHistory]);

  // Update section
  const updateSection = useCallback((id: string, updates: Partial<MapSection>) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Delete section
  const deleteSection = useCallback((id: string) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (selectedIds.includes(id) && selectedIds.length === 1) {
      setSelectedType(null);
    }
    setIsDirty(true);
  }, [saveToHistory, selectedIds]);

  // Add element
  const addElement = useCallback((element: Omit<MapElement, 'id'>) => {
    saveToHistory();
    const newElement: MapElement = {
      ...element,
      id: generateId(),
    };
    setMap(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedIds([newElement.id]);
    setSelectedType('element');
    setIsDirty(true);
    return newElement;
  }, [saveToHistory]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<MapElement>) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      elements: prev.elements.map(e =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      elements: prev.elements.filter(e => e.id !== id),
    }));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (selectedIds.includes(id) && selectedIds.length === 1) {
      setSelectedType(null);
    }
    setIsDirty(true);
  }, [saveToHistory, selectedIds]);

  // Add seats to section
  const addSeatsToSection = useCallback((sectionId: string, seats: Omit<MapSeat, 'id' | 'sectionId'>[]) => {
    saveToHistory();
    const newSeats: MapSeat[] = seats.map(seat => ({
      ...seat,
      id: generateId(),
      sectionId,
    }));
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, seats: [...(s.seats || []), ...newSeats] }
          : s
      ),
    }));
    setIsDirty(true);
    return newSeats;
  }, [saveToHistory]);

  // Update seat
  const updateSeat = useCallback((sectionId: string, seatId: string, updates: Partial<MapSeat>) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              seats: s.seats?.map(seat =>
                seat.id === seatId ? { ...seat, ...updates } : seat
              )
            }
          : s
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Delete seat
  const deleteSeat = useCallback((sectionId: string, seatId: string) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, seats: s.seats?.filter(seat => seat.id !== seatId) }
          : s
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Add tables to section
  const addTablesToSection = useCallback((sectionId: string, tables: Omit<MapTable, 'id' | 'sectionId'>[]) => {
    saveToHistory();
    const newTables: MapTable[] = tables.map(table => ({
      ...table,
      id: generateId(),
      sectionId,
    }));
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, tables: [...(s.tables || []), ...newTables] }
          : s
      ),
    }));
    setIsDirty(true);
    return newTables;
  }, [saveToHistory]);

  // Update table
  const updateTable = useCallback((sectionId: string, tableId: string, updates: Partial<MapTable>) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              tables: s.tables?.map(table =>
                table.id === tableId ? { ...table, ...updates } : table
              )
            }
          : s
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Delete table
  const deleteTable = useCallback((sectionId: string, tableId: string) => {
    saveToHistory();
    setMap(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, tables: s.tables?.filter(table => table.id !== tableId) }
          : s
      ),
    }));
    setIsDirty(true);
  }, [saveToHistory]);

  // Selection
  const select = useCallback((id: string, type: 'section' | 'element' | 'seat' | 'table', addToSelection = false) => {
    if (addToSelection && selectedType === type) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
      setSelectedType(type);
    }
  }, [selectedType]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectedType(null);
  }, []);

  const selectAll = useCallback(() => {
    const allIds = [
      ...map.sections.map(s => s.id),
      ...map.elements.map(e => e.id),
    ];
    setSelectedIds(allIds);
    setSelectedType(null); // Mixed selection
  }, [map]);

  // Delete selected
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    saveToHistory();

    setMap(prev => ({
      ...prev,
      sections: prev.sections.filter(s => !selectedIds.includes(s.id)),
      elements: prev.elements.filter(e => !selectedIds.includes(e.id)),
    }));

    setSelectedIds([]);
    setSelectedType(null);
    setIsDirty(true);
  }, [selectedIds, saveToHistory]);

  // Duplicate selected
  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    saveToHistory();

    const newIds: string[] = [];

    setMap(prev => {
      const newSections = prev.sections
        .filter(s => selectedIds.includes(s.id))
        .map(s => {
          const newId = generateId();
          newIds.push(newId);
          return {
            ...s,
            id: newId,
            name: `${s.name} (copia)`,
            x: s.x + 20,
            y: s.y + 20,
            seats: s.seats?.map(seat => ({ ...seat, id: generateId(), sectionId: newId })),
            tables: s.tables?.map(table => ({ ...table, id: generateId(), sectionId: newId })),
          };
        });

      const newElements = prev.elements
        .filter(e => selectedIds.includes(e.id))
        .map(e => {
          const newId = generateId();
          newIds.push(newId);
          return {
            ...e,
            id: newId,
            name: e.name ? `${e.name} (copia)` : undefined,
            x: e.x + 20,
            y: e.y + 20,
          };
        });

      return {
        ...prev,
        sections: [...prev.sections, ...newSections],
        elements: [...prev.elements, ...newElements],
      };
    });

    setSelectedIds(newIds);
    setIsDirty(true);
  }, [selectedIds, saveToHistory]);

  // Canvas operations
  const setZoom = useCallback((zoom: number) => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.min(Math.max(zoom, 0.25), 4)
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 4)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.25)
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setCanvasState({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setCanvasState(prev => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));
  }, []);

  // Grid operations
  const toggleGrid = useCallback(() => {
    setMap(prev => ({ ...prev, showGrid: !prev.showGrid }));
    setIsDirty(true);
  }, []);

  const setGridSize = useCallback((size: number) => {
    setMap(prev => ({ ...prev, gridSize: size }));
    setIsDirty(true);
  }, []);

  // Snap to grid helper
  const snapToGrid = useCallback((value: number) => {
    if (!map.showGrid) return value;
    return Math.round(value / map.gridSize) * map.gridSize;
  }, [map.showGrid, map.gridSize]);

  // Save
  const save = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(map);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [map, onSave]);

  // Get selected items
  const getSelectedSections = useCallback(() => {
    return map.sections.filter(s => selectedIds.includes(s.id));
  }, [map.sections, selectedIds]);

  const getSelectedElements = useCallback(() => {
    return map.elements.filter(e => selectedIds.includes(e.id));
  }, [map.elements, selectedIds]);

  // Get next color for new section
  const getNextSectionColor = useCallback(() => {
    const usedColors = map.sections.map(s => s.color);
    const availableColor = SECTION_COLORS.find(c => !usedColors.includes(c));
    return availableColor || SECTION_COLORS[map.sections.length % SECTION_COLORS.length];
  }, [map.sections]);

  // Load map
  const loadMap = useCallback((newMap: VenueMap) => {
    historyRef.current = { past: [], future: [] };
    setMap(newMap);
    setSelectedIds([]);
    setSelectedType(null);
    setIsDirty(false);
  }, []);

  // Reset to empty
  const resetMap = useCallback(() => {
    historyRef.current = { past: [], future: [] };
    setMap(createEmptyMap());
    setSelectedIds([]);
    setSelectedType(null);
    setIsDirty(false);
  }, []);

  return {
    // State
    map,
    selectedIds,
    selectedType,
    activeTool,
    isDrawing,
    drawingPoints,
    canvasState,
    isDirty,
    isPreviewMode,
    isSaving,
    canUndo,
    canRedo,

    // Setters
    setActiveTool,
    setIsDrawing,
    setDrawingPoints,
    setIsPreviewMode,

    // Map operations
    updateMapProperties,
    loadMap,
    resetMap,
    save,

    // Section operations
    addSection,
    updateSection,
    deleteSection,

    // Element operations
    addElement,
    updateElement,
    deleteElement,

    // Seat operations
    addSeatsToSection,
    updateSeat,
    deleteSeat,

    // Table operations
    addTablesToSection,
    updateTable,
    deleteTable,

    // Selection
    select,
    clearSelection,
    selectAll,
    deleteSelected,
    duplicateSelected,
    getSelectedSections,
    getSelectedElements,

    // Canvas operations
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    pan,

    // Grid
    toggleGrid,
    setGridSize,
    snapToGrid,

    // History
    undo,
    redo,

    // Helpers
    getNextSectionColor,
  };
}

export type MapEditorHook = ReturnType<typeof useMapEditor>;
