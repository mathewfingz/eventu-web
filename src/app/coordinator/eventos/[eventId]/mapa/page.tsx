'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
    Save,
    RotateCcw,
    Maximize2,
    Grid,
    Layers,
    Eye,
    Settings,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';

// Dynamically import MapEditor to avoid SSR issues with canvas
const MapEditor = dynamic(
    () => import('@/components/map-editor/MapEditor').then(mod => mod.default || mod),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-xl">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-[#E53935] animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Cargando editor de mapa...</p>
                </div>
            </div>
        )
    }
);

// Mock map data
const mockMapData = {
    id: 'map-1',
    name: 'Movistar Arena - Concierto',
    width: 1200,
    height: 800,
    backgroundColor: '#f5f5f5',
    showGrid: true,
    gridSize: 20,
    sections: [
        {
            id: 'sec-1',
            name: 'VIP',
            type: 'SEATED',
            color: '#E53935',
            x: 100,
            y: 150,
            width: 300,
            height: 200,
            capacity: 150,
            ticketTypeId: 'tt-1'
        },
        {
            id: 'sec-2',
            name: 'General',
            type: 'GENERAL_ADMISSION',
            color: '#3B82F6',
            x: 450,
            y: 150,
            width: 350,
            height: 300,
            capacity: 500,
            ticketTypeId: 'tt-2'
        },
        {
            id: 'sec-3',
            name: 'Platino',
            type: 'SEATED',
            color: '#F59E0B',
            x: 850,
            y: 150,
            width: 250,
            height: 200,
            capacity: 100,
            ticketTypeId: 'tt-3'
        }
    ],
    elements: [
        {
            id: 'el-1',
            type: 'STAGE',
            name: 'Escenario',
            x: 300,
            y: 50,
            width: 600,
            height: 80,
            color: '#1F2937'
        },
        {
            id: 'el-2',
            type: 'BAR',
            name: 'Bar',
            x: 50,
            y: 450,
            width: 100,
            height: 60,
            color: '#7C3AED'
        },
        {
            id: 'el-3',
            type: 'BATHROOM',
            name: 'Banos',
            x: 1050,
            y: 450,
            width: 80,
            height: 60,
            color: '#059669'
        }
    ]
};

// Inventory stats
const inventoryStats = {
    'sec-1': { sold: 120, available: 30, total: 150 },
    'sec-2': { sold: 380, available: 120, total: 500 },
    'sec-3': { sold: 85, available: 15, total: 100 }
};

export default function EventMapPage() {
    const params = useParams();
    const eventId = params?.eventId as string;

    const [mapData, setMapData] = useState(mockMapData);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const handleMapChange = (newData: any) => {
        setMapData(newData);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // TODO: Call API to save map
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setHasChanges(false);
    };

    const handleReset = () => {
        setMapData(mockMapData);
        setHasChanges(false);
    };

    return (
        <div className={`bg-gray-100 min-h-full ${isFullscreen ? 'fixed inset-0 z-50' : 'p-6'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between mb-4 ${isFullscreen ? 'p-4 bg-white border-b' : ''}`}>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mapa de Asientos</h1>
                    <p className="text-gray-600">
                        Configura las secciones y asientos del evento
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Grid toggle */}
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg border transition-colors ${
                            showGrid
                                ? 'bg-gray-100 border-gray-300 text-gray-700'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                        title="Mostrar cuadricula"
                    >
                        <Grid className="w-5 h-5" />
                    </button>

                    {/* Fullscreen toggle */}
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        title="Pantalla completa"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>

                    {/* Reset button */}
                    {hasChanges && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Descartar
                        </button>
                    )}

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            hasChanges
                                ? 'bg-[#E53935] text-white hover:bg-[#B71C1C]'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Guardar mapa
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isFullscreen ? 'p-4 h-[calc(100vh-80px)]' : ''}`}>
                {/* Map Editor */}
                <div className={`lg:col-span-3 ${isFullscreen ? 'h-full' : ''}`}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
                        {/* Editor Toolbar */}
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                    {mapData.name}
                                </span>
                                {hasChanges && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                        Sin guardar
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{mapData.width} x {mapData.height}px</span>
                                <span>{mapData.sections.length} secciones</span>
                            </div>
                        </div>

                        {/* Canvas Area */}
                        <div className={`relative ${isFullscreen ? 'h-[calc(100%-52px)]' : 'h-[600px]'}`}>
                            <MapEditor
                                initialData={mapData}
                                onChange={handleMapChange}
                                showGrid={showGrid}
                                onSectionSelect={setSelectedSection}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Inventory & Info */}
                <div className={`space-y-6 ${isFullscreen ? 'overflow-y-auto' : ''}`}>
                    {/* Inventory Overview */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-gray-500" />
                            Inventario
                        </h3>

                        <div className="space-y-3">
                            {mapData.sections.map((section) => {
                                const stats = inventoryStats[section.id as keyof typeof inventoryStats];
                                const soldPercent = stats ? (stats.sold / stats.total) * 100 : 0;

                                return (
                                    <div
                                        key={section.id}
                                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                            selectedSection === section.id
                                                ? 'border-[#E53935] bg-[#E53935]/5'
                                                : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                        onClick={() => setSelectedSection(section.id)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: section.color }}
                                            />
                                            <span className="font-medium text-gray-900 text-sm">
                                                {section.name}
                                            </span>
                                        </div>
                                        {stats && (
                                            <>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Vendidas: {stats.sold}</span>
                                                    <span>Disponibles: {stats.available}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${soldPercent}%`,
                                                            backgroundColor: section.color
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total vendidas</span>
                                <span className="font-semibold text-gray-900">
                                    {Object.values(inventoryStats).reduce((sum, s) => sum + s.sold, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-600">Total disponibles</span>
                                <span className="font-semibold text-green-600">
                                    {Object.values(inventoryStats).reduce((sum, s) => sum + s.available, 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section Properties */}
                    {selectedSection && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                Propiedades
                            </h3>

                            {(() => {
                                const section = mapData.sections.find(s => s.id === selectedSection);
                                if (!section) return null;

                                return (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Nombre
                                            </label>
                                            <input
                                                type="text"
                                                value={section.name}
                                                onChange={(e) => {
                                                    const updated = mapData.sections.map(s =>
                                                        s.id === selectedSection
                                                            ? { ...s, name: e.target.value }
                                                            : s
                                                    );
                                                    setMapData({ ...mapData, sections: updated });
                                                    setHasChanges(true);
                                                }}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                                Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={section.color}
                                                    onChange={(e) => {
                                                        const updated = mapData.sections.map(s =>
                                                            s.id === selectedSection
                                                                ? { ...s, color: e.target.value }
                                                                : s
                                                        );
                                                        setMapData({ ...mapData, sections: updated });
                                                        setHasChanges(true);
                                                    }}
                                                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {section.color}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Capacidad
                                                </label>
                                                <input
                                                    type="number"
                                                    value={section.capacity}
                                                    onChange={(e) => {
                                                        const updated = mapData.sections.map(s =>
                                                            s.id === selectedSection
                                                                ? { ...s, capacity: parseInt(e.target.value) }
                                                                : s
                                                        );
                                                        setMapData({ ...mapData, sections: updated });
                                                        setHasChanges(true);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                                    Tipo
                                                </label>
                                                <select
                                                    value={section.type}
                                                    onChange={(e) => {
                                                        const updated = mapData.sections.map(s =>
                                                            s.id === selectedSection
                                                                ? { ...s, type: e.target.value }
                                                                : s
                                                        );
                                                        setMapData({ ...mapData, sections: updated });
                                                        setHasChanges(true);
                                                    }}
                                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
                                                >
                                                    <option value="SEATED">Numerado</option>
                                                    <option value="GENERAL_ADMISSION">General</option>
                                                    <option value="VIP_AREA">VIP</option>
                                                    <option value="TABLES">Mesas</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Help Tips */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Consejos
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Arrastra secciones para moverlas</li>
                            <li>• Haz clic en una seccion para editarla</li>
                            <li>• Usa la rueda del mouse para hacer zoom</li>
                            <li>• Guarda los cambios antes de salir</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
