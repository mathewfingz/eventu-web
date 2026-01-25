'use client';

import { useState } from 'react';
import { X, Armchair, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapSection, MapSeat, RowConfig } from '../types';

interface SeatGeneratorProps {
  open: boolean;
  onClose: () => void;
  section: MapSection;
  onGenerate: (seats: Omit<MapSeat, 'id' | 'sectionId'>[]) => void;
}

const ROW_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function SeatGenerator({ open, onClose, section, onGenerate }: SeatGeneratorProps) {
  const [config, setConfig] = useState<RowConfig>({
    startRow: 'A',
    rowCount: 10,
    seatsPerRow: 20,
    curved: false,
    curveAmount: 0.2,
    spacing: {
      seat: 25,
      row: 30,
    },
    numberingType: 'continuous',
    startNumber: 1,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Generate preview seats
  const generateSeats = (): Omit<MapSeat, 'id' | 'sectionId'>[] => {
    const seats: Omit<MapSeat, 'id' | 'sectionId'>[] = [];
    const startRowIndex = ROW_LETTERS.indexOf(config.startRow);

    for (let rowIndex = 0; rowIndex < config.rowCount; rowIndex++) {
      const rowLabel = ROW_LETTERS[(startRowIndex + rowIndex) % ROW_LETTERS.length];
      const y = rowIndex * config.spacing.row + 20; // Offset from top

      for (let seatIndex = 0; seatIndex < config.seatsPerRow; seatIndex++) {
        let x = seatIndex * config.spacing.seat + 20; // Offset from left

        // Apply curve if enabled
        if (config.curved) {
          const centerOffset = seatIndex - (config.seatsPerRow - 1) / 2;
          const curveY = Math.pow(centerOffset, 2) * config.curveAmount;
          x = seatIndex * config.spacing.seat + 20;
        }

        let seatNumber: number;
        if (config.numberingType === 'continuous') {
          seatNumber = config.startNumber + seatIndex;
        } else if (config.numberingType === 'odd-even') {
          // Odd numbers on left, even on right
          if (seatIndex < config.seatsPerRow / 2) {
            seatNumber = (seatIndex * 2) + 1;
          } else {
            seatNumber = ((seatIndex - Math.floor(config.seatsPerRow / 2)) * 2) + 2;
          }
        } else {
          // left-right: from center out
          const half = Math.floor(config.seatsPerRow / 2);
          if (seatIndex < half) {
            seatNumber = half - seatIndex;
          } else {
            seatNumber = seatIndex - half + 1;
          }
        }

        seats.push({
          row: rowLabel,
          number: seatNumber,
          x,
          y,
          status: 'AVAILABLE',
        });
      }
    }

    return seats;
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const seats = generateSeats();
      onGenerate(seats);
      setIsGenerating(false);
      onClose();
    }, 300);
  };

  const previewSeats = generateSeats().slice(0, 100); // Limit preview
  const totalSeats = config.rowCount * config.seatsPerRow;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl m-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E53935] rounded-lg flex items-center justify-center">
              <Armchair className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Generar Asientos</h2>
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
              {/* Row configuration */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Filas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fila inicial</label>
                    <select
                      value={config.startRow}
                      onChange={(e) => setConfig({ ...config, startRow: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    >
                      {ROW_LETTERS.map(letter => (
                        <option key={letter} value={letter}>{letter}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Número de filas</label>
                    <input
                      type="number"
                      min={1}
                      max={26}
                      value={config.rowCount}
                      onChange={(e) => setConfig({ ...config, rowCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Seats per row */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Asientos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Asientos por fila</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={config.seatsPerRow}
                      onChange={(e) => setConfig({ ...config, seatsPerRow: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    />
                  </div>
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

              {/* Numbering type */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Tipo de numeración</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'continuous', label: '1, 2, 3...' },
                    { value: 'odd-even', label: 'Impar/Par' },
                    { value: 'left-right', label: 'Centro afuera' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setConfig({ ...config, numberingType: value as typeof config.numberingType })}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                        config.numberingType === value
                          ? 'bg-[#E53935] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Espaciado</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Entre asientos (px)</label>
                    <input
                      type="number"
                      min={15}
                      max={100}
                      value={config.spacing.seat}
                      onChange={(e) => setConfig({
                        ...config,
                        spacing: { ...config.spacing, seat: parseInt(e.target.value) || 25 }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Entre filas (px)</label>
                    <input
                      type="number"
                      min={20}
                      max={100}
                      value={config.spacing.row}
                      onChange={(e) => setConfig({
                        ...config,
                        spacing: { ...config.spacing, row: parseInt(e.target.value) || 30 }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E53935]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Curve option */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Filas curvas</label>
                  <button
                    onClick={() => setConfig({ ...config, curved: !config.curved })}
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      config.curved ? 'bg-[#E53935]' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                        config.curved ? 'translate-x-5' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
                {config.curved && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Curvatura: {Math.round(config.curveAmount * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={config.curveAmount}
                      onChange={(e) => setConfig({ ...config, curveAmount: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 p-6 bg-gray-50 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Vista previa</h3>
              <span className="text-xs text-gray-500">{totalSeats} asientos</span>
            </div>

            <div
              className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto"
              style={{ minHeight: '300px' }}
            >
              {/* Stage indicator */}
              <div className="w-full h-8 bg-gray-800 rounded mb-4 flex items-center justify-center">
                <span className="text-white text-xs">ESCENARIO</span>
              </div>

              {/* Seats preview */}
              <div className="relative" style={{
                width: Math.max(300, config.seatsPerRow * config.spacing.seat + 40),
                height: config.rowCount * config.spacing.row + 40
              }}>
                {previewSeats.map((seat, index) => (
                  <div
                    key={index}
                    className="absolute w-5 h-5 bg-green-500 rounded text-[8px] text-white flex items-center justify-center font-medium"
                    style={{ left: seat.x, top: seat.y }}
                    title={`${seat.row}${seat.number}`}
                  >
                    {seat.number}
                  </div>
                ))}
                {/* Row labels */}
                {Array.from({ length: Math.min(config.rowCount, 10) }).map((_, rowIndex) => {
                  const rowLabel = ROW_LETTERS[(ROW_LETTERS.indexOf(config.startRow) + rowIndex) % ROW_LETTERS.length];
                  return (
                    <div
                      key={rowLabel}
                      className="absolute left-0 w-4 h-5 flex items-center justify-center text-xs font-medium text-gray-500"
                      style={{ top: rowIndex * config.spacing.row + 20 }}
                    >
                      {rowLabel}
                    </div>
                  );
                })}
              </div>

              {totalSeats > 100 && (
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Mostrando primeros 100 asientos de {totalSeats}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalSeats}</span> asientos en{' '}
            <span className="font-medium">{config.rowCount}</span> filas
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfig({
                startRow: 'A',
                rowCount: 10,
                seatsPerRow: 20,
                curved: false,
                curveAmount: 0.2,
                spacing: { seat: 25, row: 30 },
                numberingType: 'continuous',
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
                <Armchair className="w-4 h-4" />
              )}
              Generar {totalSeats} asientos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
