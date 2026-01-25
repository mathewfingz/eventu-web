'use client';

import { useState } from 'react';
import {
  Settings,
  Palette,
  Users,
  Star,
  Layers,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Armchair,
  UtensilsCrossed,
  Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapEditorHook } from '../hooks/useMapEditor';
import { SECTION_COLORS, SectionType } from '../types';

interface PropertiesPanelProps {
  editor: MapEditorHook;
  onGenerateSeats?: (sectionId: string) => void;
  onGenerateTables?: (sectionId: string) => void;
}

const sectionTypes: { value: SectionType; label: string; icon: typeof Users }[] = [
  { value: 'GENERAL_ADMISSION', label: 'Admisión General', icon: Users },
  { value: 'SEATED', label: 'Asientos Numerados', icon: Armchair },
  { value: 'TABLES', label: 'Mesas', icon: UtensilsCrossed },
  { value: 'STANDING', label: 'Zona de Pie', icon: Users },
  { value: 'VIP_AREA', label: 'Área VIP', icon: Star },
];

export function PropertiesPanel({
  editor,
  onGenerateSeats,
  onGenerateTables,
}: PropertiesPanelProps) {
  const {
    map,
    selectedIds,
    selectedType,
    updateSection,
    updateElement,
    updateMapProperties,
  } = editor;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    appearance: true,
    capacity: true,
    tickets: true,
  });

  const toggleExpanded = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Get selected section
  const selectedSection = selectedType === 'section' && selectedIds.length === 1
    ? map.sections.find(s => s.id === selectedIds[0])
    : null;

  // Get selected element
  const selectedElement = selectedType === 'element' && selectedIds.length === 1
    ? map.elements.find(e => e.id === selectedIds[0])
    : null;

  // If nothing selected, show map properties
  if (!selectedSection && !selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Propiedades del Mapa</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Map name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del mapa
            </label>
            <input
              type="text"
              value={map.name}
              onChange={(e) => updateMapProperties({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {/* Canvas size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho (px)
              </label>
              <input
                type="number"
                value={map.width}
                onChange={(e) => updateMapProperties({ width: parseInt(e.target.value) || 800 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alto (px)
              </label>
              <input
                type="number"
                value={map.height}
                onChange={(e) => updateMapProperties({ height: parseInt(e.target.value) || 600 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>
          </div>

          {/* Background color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de fondo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={map.backgroundColor}
                onChange={(e) => updateMapProperties({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={map.backgroundColor}
                onChange={(e) => updateMapProperties({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>
          </div>

          {/* Grid size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño de cuadrícula
            </label>
            <select
              value={map.gridSize}
              onChange={(e) => updateMapProperties({ gridSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            >
              <option value={10}>10px</option>
              <option value={20}>20px</option>
              <option value={40}>40px</option>
              <option value={50}>50px</option>
            </select>
          </div>

          {/* Stats */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Estadísticas</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Secciones:</span>
                <span className="font-medium">{map.sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Elementos:</span>
                <span className="font-medium">{map.elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Capacidad total:</span>
                <span className="font-medium">
                  {map.sections.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Asientos:</span>
                <span className="font-medium">
                  {map.sections.reduce((sum, s) => sum + (s.seats?.length || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mesas:</span>
                <span className="font-medium">
                  {map.sections.reduce((sum, s) => sum + (s.tables?.length || 0), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Section properties
  if (selectedSection) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Propiedades de Sección</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {/* General */}
          <div className="p-4">
            <button
              onClick={() => toggleExpanded('general')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                General
              </span>
              {expandedSections.general ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.general && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={selectedSection.name}
                    onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                  <select
                    value={selectedSection.type}
                    onChange={(e) => updateSection(selectedSection.id, { type: e.target.value as SectionType })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  >
                    {sectionTypes.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                  <textarea
                    value={selectedSection.description || ''}
                    onChange={(e) => updateSection(selectedSection.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] resize-none"
                    placeholder="Descripción visible al comprador..."
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Visible</span>
                  <button
                    onClick={() => updateSection(selectedSection.id, { isActive: !selectedSection.isActive })}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      selectedSection.isActive ? 'bg-[#E53935]' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                        selectedSection.isActive ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Appearance */}
          <div className="p-4">
            <button
              onClick={() => toggleExpanded('appearance')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
            >
              <span className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Apariencia
              </span>
              {expandedSections.appearance ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.appearance && (
              <div className="space-y-3">
                {/* Color picker */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {SECTION_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateSection(selectedSection.id, { color })}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 transition-all',
                          selectedSection.color === color
                            ? 'border-gray-800 scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Opacidad: {Math.round(selectedSection.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={selectedSection.opacity}
                    onChange={(e) => updateSection(selectedSection.id, { opacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Layer */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Capa</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={selectedSection.layer}
                    onChange={(e) => updateSection(selectedSection.id, { layer: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Capacity */}
          <div className="p-4">
            <button
              onClick={() => toggleExpanded('capacity')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Capacidad
              </span>
              {expandedSections.capacity ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.capacity && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Capacidad total
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={selectedSection.capacity}
                    onChange={(e) => updateSection(selectedSection.id, { capacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  />
                </div>

                {/* Star rating for view quality */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Calidad de vista
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => updateSection(selectedSection.id, { starRating: star })}
                        className={cn(
                          'w-6 h-6 flex items-center justify-center rounded transition-colors',
                          (selectedSection.starRating || 0) >= star
                            ? 'text-yellow-500'
                            : 'text-gray-300 hover:text-yellow-300'
                        )}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate seats/tables buttons */}
                {selectedSection.type === 'SEATED' && onGenerateSeats && (
                  <button
                    onClick={() => onGenerateSeats(selectedSection.id)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Armchair className="w-4 h-4" />
                    Generar Asientos
                  </button>
                )}

                {selectedSection.type === 'TABLES' && onGenerateTables && (
                  <button
                    onClick={() => onGenerateTables(selectedSection.id)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    Generar Mesas
                  </button>
                )}

                {/* Current seats/tables count */}
                {selectedSection.seats && selectedSection.seats.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {selectedSection.seats.length} asientos creados
                  </div>
                )}
                {selectedSection.tables && selectedSection.tables.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {selectedSection.tables.length} mesas creadas
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ticket link */}
          <div className="p-4">
            <button
              onClick={() => toggleExpanded('tickets')}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
            >
              <span className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Vinculación
              </span>
              {expandedSections.tickets ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.tickets && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Tipo de ticket
                  </label>
                  <select
                    value={selectedSection.ticketTypeId || ''}
                    onChange={(e) => updateSection(selectedSection.id, { ticketTypeId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                  >
                    <option value="">Sin vincular</option>
                    {/* This would be populated with actual ticket types from the event */}
                    <option value="placeholder">Cargar desde evento...</option>
                  </select>
                </div>
                <p className="text-xs text-gray-400">
                  Vincula esta sección a un tipo de ticket del evento para sincronizar inventario y precios.
                </p>
              </div>
            )}
          </div>

          {/* Position & Size */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Posición y Tamaño</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedSection.x)}
                  onChange={(e) => updateSection(selectedSection.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedSection.y)}
                  onChange={(e) => updateSection(selectedSection.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                <input
                  type="number"
                  value={Math.round(selectedSection.width)}
                  onChange={(e) => updateSection(selectedSection.id, { width: parseInt(e.target.value) || 20 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alto</label>
                <input
                  type="number"
                  value={Math.round(selectedSection.height)}
                  onChange={(e) => updateSection(selectedSection.id, { height: parseInt(e.target.value) || 20 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Rotación</label>
              <input
                type="number"
                value={Math.round(selectedSection.rotation)}
                onChange={(e) => updateSection(selectedSection.id, { rotation: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Element properties
  if (selectedElement) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Propiedades del Elemento</h3>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <p className="text-sm font-medium text-gray-700">{selectedElement.type}</p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre</label>
            <input
              type="text"
              value={selectedElement.name || ''}
              onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
              placeholder={selectedElement.type}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
            />
          </div>

          {selectedElement.type === 'TEXT' && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Texto</label>
                <input
                  type="text"
                  value={selectedElement.text || ''}
                  onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tamaño de fuente</label>
                <input
                  type="number"
                  min={8}
                  max={72}
                  value={selectedElement.fontSize || 14}
                  onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 14 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedElement.color || '#6B7280'}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={selectedElement.color || '#6B7280'}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
              />
            </div>
          </div>

          {/* Position & Size */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Posición y Tamaño</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 20 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alto</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 20 })}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Rotación</label>
              <input
                type="number"
                value={Math.round(selectedElement.rotation)}
                onChange={(e) => updateElement(selectedElement.id, { rotation: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>

          {/* Lock toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-700">Bloquear elemento</span>
            <button
              onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                selectedElement.isLocked ? 'bg-yellow-500' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                  selectedElement.isLocked ? 'translate-x-5' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
