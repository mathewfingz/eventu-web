import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCoordinatorAccess } from '@/lib/coordinator-auth';

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId } = await params;

    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canUploadImages');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para ver las imagenes' },
        { status: 403 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        imageUrl: true,
        coverUrl: true,
        videoUrl: true
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      images: {
        poster: event.imageUrl,
        cover: event.coverUrl,
        video: event.videoUrl,
        gallery: []
      }
    });

  } catch (error) {
    console.error('Error fetching event images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId } = await params;

    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canUploadImages');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para actualizar las imagenes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, coverUrl, videoUrl } = body;

    const updateData: any = {};
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      select: {
        id: true,
        imageUrl: true,
        coverUrl: true,
        videoUrl: true
      }
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'EVENT',
        entityId: eventId,
        action: 'update_images',
        performedById: session.user.id,
        performedByType: 'coordinator',
        newState: updateData,
        hash: '',
        previousHash: ''
      }
    });

    return NextResponse.json({
      success: true,
      images: {
        poster: updatedEvent.imageUrl,
        cover: updatedEvent.coverUrl,
        video: updatedEvent.videoUrl
      }
    });

  } catch (error) {
    console.error('Error updating event images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId } = await params;

    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canUploadImages');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para subir imagenes' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se recibio ningun archivo' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo excede el tamano maximo de 10MB' },
        { status: 400 }
      );
    }

    const uploadedUrl = `https://storage.eventu.co/events/${eventId}/${type}/${Date.now()}-${file.name}`;

    const fieldMap: Record<string, string> = {
      poster: 'imageUrl',
      cover: 'coverUrl'
    };

    if (fieldMap[type]) {
      await prisma.event.update({
        where: { id: eventId },
        data: { [fieldMap[type]]: uploadedUrl }
      });
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      message: 'Imagen subida correctamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { eventId } = await params;

    const access = await verifyCoordinatorAccess(session.user.id, eventId, 'canUploadImages');
    if (!access.authorized) {
      return NextResponse.json(
        { error: access.error || 'No tienes permiso para eliminar imagenes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['poster', 'cover', 'video'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de imagen invalido' },
        { status: 400 }
      );
    }

    const fieldMap: Record<string, string> = {
      poster: 'imageUrl',
      cover: 'coverUrl',
      video: 'videoUrl'
    };

    await prisma.event.update({
      where: { id: eventId },
      data: { [fieldMap[type]]: null }
    });

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
