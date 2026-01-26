import { NextRequest, NextResponse } from 'next/server';
import { mapsStore, generateId, MapData, SectionData, SeatData, TableData, ElementData } from '@/lib/maps-store';

export const dynamic = 'force-dynamic';

// GET /api/admin/maps/[mapId] - Get a single map with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;

    const map = mapsStore.get(mapId);

    if (!map) {
      return NextResponse.json(
        { error: 'Mapa no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      map,
    });
  } catch (error) {
    console.error('Error fetching map:', error);
    return NextResponse.json(
      { error: 'Error al obtener el mapa' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/maps/[mapId] - Update a map
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;
    const body = await request.json();

    const existingMap = mapsStore.get(mapId);

    if (!existingMap) {
      return NextResponse.json(
        { error: 'Mapa no encontrado' },
        { status: 404 }
      );
    }

    const {
      name,
      width,
      height,
      backgroundColor,
      backgroundImage,
      gridSize,
      showGrid,
      isTemplate,
      templateName,
      sections,
      elements,
    } = body;

    const updatedMap: MapData = {
      ...existingMap,
      name: name ?? existingMap.name,
      width: width ?? existingMap.width,
      height: height ?? existingMap.height,
      backgroundColor: backgroundColor ?? existingMap.backgroundColor,
      backgroundImage: backgroundImage ?? existingMap.backgroundImage,
      gridSize: gridSize ?? existingMap.gridSize,
      showGrid: showGrid ?? existingMap.showGrid,
      isTemplate: isTemplate ?? existingMap.isTemplate,
      templateName: templateName ?? existingMap.templateName,
      version: existingMap.version + 1,
      updatedAt: new Date(),
      sections: sections ? sections.map((section: Record<string, unknown>) => ({
        id: (section.id as string) || generateId(),
        name: section.name as string || 'Nueva Sección',
        type: section.type as string || 'GENERAL_ADMISSION',
        color: section.color as string || '#3B82F6',
        shape: section.shape as string || 'rectangle',
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
        seats: (section.seats as SeatData[]) || [],
        tables: (section.tables as TableData[]) || [],
      })) : existingMap.sections,
      elements: elements ? elements.map((element: Record<string, unknown>) => ({
        id: (element.id as string) || generateId(),
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
      })) : existingMap.elements,
    };

    mapsStore.set(mapId, updatedMap);

    return NextResponse.json({
      map: updatedMap,
      message: 'Mapa actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating map:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el mapa' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/maps/[mapId] - Delete a map
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mapId: string }> }
) {
  try {
    const { mapId } = await params;

    if (!mapsStore.has(mapId)) {
      return NextResponse.json(
        { error: 'Mapa no encontrado' },
        { status: 404 }
      );
    }

    mapsStore.delete(mapId);

    return NextResponse.json({
      message: 'Mapa eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting map:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el mapa' },
      { status: 500 }
    );
  }
}
