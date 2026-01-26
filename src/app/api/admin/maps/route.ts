import { NextRequest, NextResponse } from 'next/server';
import { mapsStore, generateId, MapData } from '@/lib/maps-store';

export const dynamic = 'force-dynamic';

// GET /api/admin/maps - Get all maps (templates and venue maps)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'template', 'venue', 'event', 'all'

    let maps = Array.from(mapsStore.values());

    if (type === 'template') {
      maps = maps.filter(m => m.isTemplate);
    } else if (type === 'venue') {
      maps = maps.filter(m => !m.isTemplate && m.venueId);
    }

    // Sort by updatedAt desc
    maps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const formattedMaps = maps.map((map) => ({
      id: map.id,
      name: map.name,
      venueId: map.venueId,
      venueName: undefined,
      eventId: map.eventId,
      width: map.width,
      height: map.height,
      isTemplate: map.isTemplate,
      templateName: map.templateName,
      sectionsCount: map.sections.length,
      elementsCount: map.elements.length,
      totalCapacity: map.sections.reduce((sum, s) => sum + s.capacity, 0),
      totalSeats: map.sections.reduce((sum, s) => sum + (s.seats?.length || 0), 0),
      totalTables: map.sections.reduce((sum, s) => sum + (s.tables?.length || 0), 0),
      createdAt: map.createdAt,
      updatedAt: map.updatedAt,
    }));

    return NextResponse.json({
      maps: formattedMaps,
    });
  } catch (error) {
    console.error('Error fetching maps:', error);
    return NextResponse.json(
      { error: 'Error al obtener los mapas' },
      { status: 500 }
    );
  }
}

// POST /api/admin/maps - Create a new map
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name = 'Nuevo Mapa',
      venueId,
      eventId,
      width = 1200,
      height = 800,
      backgroundColor = '#f5f5f5',
      gridSize = 20,
      showGrid = true,
      isTemplate = false,
      templateName,
      sections = [],
      elements = [],
    } = body;

    const mapId = generateId();
    const now = new Date();

    const map: MapData = {
      id: mapId,
      name,
      venueId,
      eventId,
      width,
      height,
      backgroundColor,
      gridSize,
      showGrid,
      isTemplate,
      templateName,
      version: 1,
      sections: sections.map((section: Record<string, unknown>) => ({
        id: generateId(),
        name: section.name || 'Nueva Sección',
        type: section.type || 'GENERAL_ADMISSION',
        color: section.color || '#3B82F6',
        shape: section.shape || 'rectangle',
        path: section.path,
        x: Number(section.x) || 0,
        y: Number(section.y) || 0,
        width: Number(section.width) || 100,
        height: Number(section.height) || 100,
        rotation: Number(section.rotation) || 0,
        capacity: Number(section.capacity) || 100,
        description: section.description as string | undefined,
        starRating: section.starRating as number | undefined,
        isActive: section.isActive !== false,
        layer: Number(section.layer) || 1,
        opacity: Number(section.opacity) || 1,
        ticketTypeId: section.ticketTypeId as string | undefined,
        rowConfig: section.rowConfig,
        seats: [],
        tables: [],
      })),
      elements: elements.map((element: Record<string, unknown>) => ({
        id: generateId(),
        type: element.type as string,
        name: element.name as string | undefined,
        x: Number(element.x) || 0,
        y: Number(element.y) || 0,
        width: Number(element.width) || 100,
        height: Number(element.height) || 100,
        rotation: Number(element.rotation) || 0,
        color: element.color as string | undefined,
        icon: element.icon as string | undefined,
        text: element.text as string | undefined,
        fontSize: element.fontSize as number | undefined,
        imageUrl: element.imageUrl as string | undefined,
        layer: Number(element.layer) || 0,
        isLocked: Boolean(element.isLocked),
      })),
      createdAt: now,
      updatedAt: now,
    };

    mapsStore.set(mapId, map);

    return NextResponse.json({
      map,
      message: 'Mapa creado exitosamente',
    });
  } catch (error) {
    console.error('Error creating map:', error);
    return NextResponse.json(
      { error: 'Error al crear el mapa' },
      { status: 500 }
    );
  }
}
