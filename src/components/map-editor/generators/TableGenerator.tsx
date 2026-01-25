'use client';

import { useState } from 'react';
import { X, UtensilsCrossed, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapSection, MapTable } from '../types';

interface TableGeneratorProps {
  open: boolean;
  onClose: () => void;
  section: MapSection;
  onGenerate: (tables: Omit<MapTable, 'id' | 'sectionId'>[]) => void;
}

interface TableConfig {
  tableCount: number;
  seatsPerTable: number;
  tableShape: 'round' | 'rectangle' | 'square';
  tableSize: number;
  layout: 'grid' | 'rows' | 'custom';
  columns: number;
  spacing: number;
  startNumber: number;
}

export function TableGenerator({ open, onClose, section, onGenerate }: TableGeneratorProps) {
  const [config, setConfig] = useState<TableConfig>({
    tableCount: 10,
    seatsPerTable: 8,
    tableShape: 'round',
    tableSize: 80,
    layout: 'grid',
    columns: 5,
    spacing: 30,
    startNumber: 1,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Generate tables
  const generateTables = (): Omit<MapTable, 'id' | 'sectionId'>[] => {
    const tables: Omit<MapTable, 'id' | 'sectionId'>[] = [];
    const offset = 20;

    for (let i = 0; i < config.tableCount; i++) {
      let x: number, y: number;

      if (config.layout === 'grid') {
        const col = i % config.columns;
        const row = Math.floor(i / config.columns);
        x = col * (config.tableSize + config.spacing) + offset;
        y = row * (config.tableSize + config.spacing) + offset;
      } else if (config.layout === 'rows') {
        const col = i % config.columns;
        const row = Math.floor(i / config.columns);
        // Stagger odd rows
        const stagger = row % 2 === 1 ? (config.tableSize + config.spacing) / 2 : 0;
        x = col * (config.tableSize + config.spacing) + stagger + offset;
        y = row * (config.tableSize + config.spacing * 0.8) + offset;
      } else {
        // Custom - place in center
        x = offset + i * 20;
        y = offset + i * 20;
      }

      tables.push({
        number: config.startNumber + i,
        shape: config.tableShape,
        seats: config.seatsPerTable,
        x,
        y,
        width: config.tableSize,
        height: config.tableShape === 'rectangle' ? config.tableSize * 0.6 : config.tableSize,
        rotation: 0,
        status: 'AVAILABLE',
      });
    }

    return tables;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const tables = generateTables();
      onGenerate(tables);
      setIsGenerating(false);
      onClose();
    }, 300);
  };

  const previewTables = generateTables();
  const totalCapacity = config.tableCount * config.seatsPerTable;

  // Calculate preview dimensions
  const rows = Math.ceil(config.tableCount / config.columns);
  const previewWidth = config.columns * (config.tableSize + config.spacing) + 40;
  const previewHeight = rows * (config.tableSize + config.spacing) + 40;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E53935] rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Generar Mesas</h2>
              <p className="text-sm text-gray-500">Sección: {section.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Configuration */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-5">
              {/* Number of tables */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Cantidad</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Número de mesas</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.tableCount}
                      onChange={(e) => setConfig({ ...config, tableCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Puestos por mesa</label>
                    <select
                      value={config.seatsPerTable}
                      onChange={(e) => setConfig({ ...config, seatsPerTable: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    >
                      {[2, 4, 6, 8, 10, 12].map(n => (
                        <option key={n} value={n}>{n} personas</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table shape */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Forma de mesa</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'round', label: 'Redonda' },
                    { value: 'rectangle', label: 'Rectangular' },
                    { value: 'square', label: 'Cuadrada' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setConfig({ ...config, tableShape: value as typeof config.tableShape })}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        config.tableShape === value
                          ? 'bg-[#E53935] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table size */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tamaño de mesa: {config.tableSize}px
                </label>
                <input
                  type="range"
                  min={50}
                  max={150}
                  step={10}
                  value={config.tableSize}
                  onChange={(e) => setConfig({ ...config, tableSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Layout */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Distribución</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { value: 'grid', label: 'Cuadrícula' },
                    { value: 'rows', label: 'Escalonado' },
                    { value: 'custom', label: 'Libre' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setConfig({ ...config, layout: value as typeof config.layout })}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        config.layout === value
                          ? 'bg-[#E53935] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {config.layout !== 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Columnas</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={config.columns}
                        onChange={(e) => setConfig({ ...config, columns: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Espaciado (px)</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={config.spacing}
                        onChange={(e) => setConfig({ ...config, spacing: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Numbering */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Número inicial</label>
                <input
                  type="number"
                  min={1}
                  value={config.startNumber}
                  onChange={(e) => setConfig({ ...config, startNumber: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Vista previa</h3>
              <span className="text-xs text-gray-500">
                {config.tableCount} mesas, {totalCapacity} puestos
              </span>
            </div>

            <div
              className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto"
              style={{ minHeight: '300px' }}
            >
              <div
                className="relative"
                style={{
                  width: Math.max(300, previewWidth),
                  height: Math.max(200, previewHeight),
                }}
              >
                {previewTables.map((table, index) => (
                  <div
                    key={index}
                    className={cn(
                      'absolute flex items-center justify-center bg-green-500 text-white text-sm font-medium',
                      table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                    )}
                    style={{
                      left: table.x,
                      top: table.y,
                      width: table.width,
                      height: table.height,
                    }}
                    title={`Mesa ${table.number} - ${table.seats} puestos`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{table.number}</div>
                      <div className="text-[10px] opacity-80">{table.seats}p</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{config.tableCount}</span> mesas ×{' '}
            <span className="font-medium">{config.seatsPerTable}</span> puestos ={' '}
            <span className="font-medium">{totalCapacity}</span> capacidad total
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfig({
                tableCount: 10,
                seatsPerTable: 8,
                tableShape: 'round',
                tableSize: 80,
                layout: 'grid',
                columns: 5,
                spacing: 30,
                startNumber: 1,
              })}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UtensilsCrossed className="w-4 h-4" />
              )}
              Generar {config.tableCount} mesas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
