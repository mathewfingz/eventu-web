'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapEditor } from '@/components/map-editor';
import { VenueMap } from '@/components/map-editor/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ mapId: string }>;
}

export default function MapEditorPage({ params }: PageProps) {
  const { mapId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const [map, setMap] = useState<VenueMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMap = async () => {
      try {
        const response = await fetch(`/api/admin/maps/${mapId}`);
        const data = await response.json();

        if (response.ok && data.map) {
          setMap(data.map);
        } else {
          setError(data.error || 'Error al cargar el mapa');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [mapId]);

  const handleSave = async (updatedMap: VenueMap) => {
    try {
      const response = await fetch(`/api/admin/maps/${mapId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMap),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }

      // Update local state with saved map
      const data = await response.json();
      if (data.map) {
        setMap(data.map);
      }
    } catch (err) {
      console.error('Error saving map:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#E53935] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (error || !map) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar el mapa
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            href="/admin/mapas"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#B71C1C]"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mapas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Back button overlay */}
      <Link
        href="/admin/mapas"
        className="absolute top-3 left-20 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg shadow text-sm text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </Link>

      <MapEditor
        initialMap={map}
        onSave={handleSave}
      />
    </div>
  );
}
