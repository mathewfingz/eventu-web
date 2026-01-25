'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Map,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
  Eye,
  Loader2,
  Grid3X3,
  Layout,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapSummary {
  id: string;
  name: string;
  venueId?: string;
  venueName?: string;
  eventId?: string;
  width: number;
  height: number;
  isTemplate: boolean;
  templateName?: string;
  sectionsCount: number;
  elementsCount: number;
  totalCapacity: number;
  totalSeats: number;
  totalTables: number;
  createdAt: string;
  updatedAt: string;
}

export default function MapsPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'template' | 'venue'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchMaps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('type', filter);
      }
      const response = await fetch(`/api/admin/maps?${params}`);
      const data = await response.json();
      if (response.ok) {
        setMaps(data.maps || []);
      }
    } catch (error) {
      console.error('Error fetching maps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, [filter]);

  const handleCreateMap = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Nuevo Mapa',
          width: 1200,
          height: 800,
        }),
      });

      const data = await response.json();
      if (response.ok && data.map) {
        router.push(`/admin/mapas/${data.map.id}`);
      }
    } catch (error) {
      console.error('Error creating map:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMap = async (mapId: string) => {
    if (!confirm('¿Estás seguro de eliminar este mapa?')) return;

    try {
      const response = await fetch(`/api/admin/maps/${mapId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMaps();
      }
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleDuplicateMap = async (map: MapSummary) => {
    try {
      // Get full map data
      const response = await fetch(`/api/admin/maps/${map.id}`);
      const data = await response.json();

      if (response.ok && data.map) {
        // Create duplicate
        const duplicateResponse = await fetch('/api/admin/maps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data.map,
            id: undefined,
            name: `${data.map.name} (copia)`,
            eventId: undefined, // Don't copy event association
          }),
        });

        if (duplicateResponse.ok) {
          fetchMaps();
        }
      }
    } catch (error) {
      console.error('Error duplicating map:', error);
    }
  };

  const filteredMaps = maps.filter(map =>
    map.name.toLowerCase().includes(search.toLowerCase()) ||
    map.venueName?.toLowerCase().includes(search.toLowerCase())
  );

  const templates = filteredMaps.filter(m => m.isTemplate);
  const venueMaps = filteredMaps.filter(m => !m.isTemplate);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mapas de Venue</h1>
          <p className="text-gray-500 mt-1">
            Crea y administra los mapas de asientos de tus venues
          </p>
        </div>

        <button
          onClick={handleCreateMap}
          disabled={creating}
          className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] flex items-center gap-2 disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Nuevo Mapa
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mapas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935]"
          />
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'template', label: 'Plantillas' },
            { value: 'venue', label: 'Venues' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as typeof filter)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                filter === value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Mapas</p>
              <p className="text-xl font-bold">{maps.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plantillas</p>
              <p className="text-xl font-bold">{templates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Secciones</p>
              <p className="text-xl font-bold">
                {maps.reduce((sum, m) => sum + m.sectionsCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacidad Total</p>
              <p className="text-xl font-bold">
                {maps.reduce((sum, m) => sum + m.totalCapacity, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Maps Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E53935] animate-spin" />
        </div>
      ) : filteredMaps.length === 0 ? (
        <div className="text-center py-20">
          <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mapas</h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer mapa de venue para comenzar
          </p>
          <button
            onClick={handleCreateMap}
            disabled={creating}
            className="px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear Mapa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredMaps.map((map) => (
            <div
              key={map.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              {/* Preview */}
              <div
                className="h-40 bg-gray-100 relative cursor-pointer"
                onClick={() => router.push(`/admin/mapas/${map.id}`)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Map className="w-12 h-12 text-gray-300" />
                </div>

                {/* Template badge */}
                {map.isTemplate && (
                  <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Plantilla
                  </div>
                )}

                {/* Quick actions on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/mapas/${map.id}`);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/mapas/${map.id}?preview=true`);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                    title="Vista previa"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{map.name}</h3>
                    {map.venueName && (
                      <p className="text-sm text-gray-500">{map.venueName}</p>
                    )}
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === map.id ? null : map.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {showMenu === map.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-40 z-20">
                          <button
                            onClick={() => {
                              router.push(`/admin/mapas/${map.id}`);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              handleDuplicateMap(map);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => {
                              handleDeleteMap(map.id);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Grid3X3 className="w-4 h-4" />
                    {map.sectionsCount} secciones
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {map.totalCapacity.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Actualizado {new Date(map.updatedAt).toLocaleDateString('es-CO')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
