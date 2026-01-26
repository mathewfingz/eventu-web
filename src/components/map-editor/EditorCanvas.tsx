'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { MapEditorHook } from './hooks/useMapEditor';
import {
  MapSection,
  MapElement,
  MapSeat,
  MapTable,
  ELEMENT_DEFAULTS,
  STATUS_COLORS,
  Position,
} from './types';

interface EditorCanvasProps {
  editor: MapEditorHook;
  width: number;
  height: number;
}

export function EditorCanvas({ editor, width, height }: EditorCanvasProps) {
  const {
    map,
    selectedIds,
    activeTool,
    canvasState,
    isPreviewMode,
    select,
    clearSelection,
    addSection,
    updateSection,
    addElement,
    updateElement,
    pan,
    snapToGrid,
    getNextSectionColor,
    setIsDrawing,
    isDrawing,
  } = editor;

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [drawStart, setDrawStart] = useState<Position | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Position | null>(null);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNodes = selectedIds
      .map(id => stageRef.current?.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];

    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedIds]);

  // Get pointer position relative to stage
  const getPointerPosition = useCallback((): Position | null => {
    const stage = stageRef.current;
    if (!stage) return null;

    const pos = stage.getPointerPosition();
    if (!pos) return null;

    // Account for pan and zoom
    const x = (pos.x - canvasState.panX) / canvasState.zoom;
    const y = (pos.y - canvasState.panY) / canvasState.zoom;

    return { x, y };
  }, [canvasState]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    if (activeTool === 'select') {
      if (clickedOnEmpty) {
        clearSelection();
      }
      return;
    }

    if (activeTool === 'pan') {
      return; // Pan is handled by wheel/drag
    }

    // Drawing tools
    if (['rectangle', 'circle', 'line'].includes(activeTool)) {
      const pos = getPointerPosition();
      if (pos) {
        setDrawStart({ x: snapToGrid(pos.x), y: snapToGrid(pos.y) });
        setIsDrawing(true);
      }
    }
  }, [activeTool, clearSelection, getPointerPosition, snapToGrid, setIsDrawing]);

  // Handle mouse move
  const handleMouseMove = useCallback(() => {
    if (!isDrawing || !drawStart) return;

    const pos = getPointerPosition();
    if (pos) {
      setDrawCurrent({ x: snapToGrid(pos.x), y: snapToGrid(pos.y) });
    }
  }, [isDrawing, drawStart, getPointerPosition, snapToGrid]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStart || !drawCurrent) {
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    // Minimum size check
    if (w < 20 || h < 20) {
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    if (activeTool === 'rectangle' || activeTool === 'circle') {
      addSection({
        name: `Sección ${map.sections.length + 1}`,
        type: 'GENERAL_ADMISSION',
        color: getNextSectionColor(),
        shape: activeTool === 'rectangle' ? 'rectangle' : 'circle',
        x,
        y,
        width: w,
        height: h,
        rotation: 0,
        capacity: 100,
        isActive: true,
        layer: 1,
        opacity: 0.8,
      });
    } else if (activeTool === 'line') {
      addElement({
        type: 'LINE',
        x: drawStart.x,
        y: drawStart.y,
        width: drawCurrent.x - drawStart.x,
        height: drawCurrent.y - drawStart.y,
        rotation: 0,
        color: '#6B7280',
        layer: 0,
        isLocked: false,
      });
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [
    isDrawing,
    drawStart,
    drawCurrent,
    activeTool,
    addSection,
    addElement,
    map.sections.length,
    getNextSectionColor,
    setIsDrawing,
  ]);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = canvasState.zoom;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - canvasState.panX) / oldScale,
      y: (pointer.y - canvasState.panY) / oldScale,
    };

    // Zoom direction
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;
    const clampedScale = Math.min(Math.max(newScale, 0.25), 4);

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    editor.setZoom(clampedScale);
    pan(newPos.x - canvasState.panX, newPos.y - canvasState.panY);
  }, [canvasState, editor, pan]);

  // Render section
  const renderSection = (section: MapSection) => {
    const isSelected = selectedIds.includes(section.id);
    const ShapeComponent = section.shape === 'circle' ? Circle : Rect;

    const shapeProps = section.shape === 'circle'
      ? {
        x: section.x + section.width / 2,
        y: section.y + section.height / 2,
        radiusX: section.width / 2,
        radiusY: section.height / 2,
      }
      : {
        x: section.x,
        y: section.y,
        width: section.width,
        height: section.height,
      };

    return (
      <Group key={section.id} id={section.id}>
        {section.shape === 'circle' ? (
          <Circle
            {...shapeProps}
            fill={section.color}
            opacity={section.opacity}
            stroke={isSelected ? '#E53935' : '#fff'}
            strokeWidth={isSelected ? 3 : 1}
            rotation={section.rotation}
            draggable={!isPreviewMode && activeTool === 'select'}
            onClick={(e) => {
              e.cancelBubble = true;
              select(section.id, 'section', e.evt.shiftKey);
            }}
            onDragEnd={(e) => {
              updateSection(section.id, {
                x: snapToGrid(e.target.x() - section.width / 2),
                y: snapToGrid(e.target.y() - section.height / 2),
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              node.scaleX(1);
              node.scaleY(1);
              updateSection(section.id, {
                x: node.x() - section.width * scaleX / 2,
                y: node.y() - section.height * scaleY / 2,
                width: Math.max(20, section.width * scaleX),
                height: Math.max(20, section.height * scaleY),
                rotation: node.rotation(),
              });
            }}
          />
        ) : (
          <Rect
            {...shapeProps}
            fill={section.color}
            opacity={section.opacity}
            stroke={isSelected ? '#E53935' : '#fff'}
            strokeWidth={isSelected ? 3 : 1}
            cornerRadius={4}
            rotation={section.rotation}
            draggable={!isPreviewMode && activeTool === 'select'}
            onClick={(e) => {
              e.cancelBubble = true;
              select(section.id, 'section', e.evt.shiftKey);
            }}
            onDragEnd={(e) => {
              updateSection(section.id, {
                x: snapToGrid(e.target.x()),
                y: snapToGrid(e.target.y()),
              });
            }}
            onTransformEnd={(e) => {
              const node = e.target;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              node.scaleX(1);
              node.scaleY(1);
              updateSection(section.id, {
                x: node.x(),
                y: node.y(),
                width: Math.max(20, section.width * scaleX),
                height: Math.max(20, section.height * scaleY),
                rotation: node.rotation(),
              });
            }}
          />
        )}

        {/* Section label */}
        <Text
          x={section.x + 8}
          y={section.y + 8}
          text={section.name}
          fontSize={14}
          fontStyle="bold"
          fill="#fff"
          listening={false}
        />
        <Text
          x={section.x + 8}
          y={section.y + 26}
          text={`${section.capacity} ${section.type === 'TABLES' ? 'mesas' : 'personas'}`}
          fontSize={12}
          fill="rgba(255,255,255,0.8)"
          listening={false}
        />

        {/* Render seats if section has them */}
        {section.seats?.map(seat => renderSeat(seat, section))}

        {/* Render tables if section has them */}
        {section.tables?.map(table => renderTable(table, section))}
      </Group>
    );
  };

  // Render seat
  const renderSeat = (seat: MapSeat, section: MapSection) => {
    const seatSize = 20;
    const statusColor = STATUS_COLORS[seat.status];

    return (
      <Group key={seat.id}>
        <Rect
          x={section.x + seat.x}
          y={section.y + seat.y}
          width={seatSize}
          height={seatSize}
          fill={statusColor}
          stroke="#fff"
          strokeWidth={1}
          cornerRadius={3}
          onClick={(e) => {
            e.cancelBubble = true;
            if (isPreviewMode) {
              // Handle seat selection in preview mode
              console.log('Seat clicked:', seat.row, seat.number);
            } else {
              select(seat.id, 'seat', e.evt.shiftKey);
            }
          }}
        />
        <Text
          x={section.x + seat.x}
          y={section.y + seat.y + 4}
          width={seatSize}
          text={`${seat.number}`}
          fontSize={10}
          fill="#fff"
          align="center"
          listening={false}
        />
      </Group>
    );
  };

  // Render table
  const renderTable = (table: MapTable, section: MapSection) => {
    const statusColor = STATUS_COLORS[table.status];

    return (
      <Group key={table.id}>
        {table.shape === 'round' ? (
          <Circle
            x={section.x + table.x + table.width / 2}
            y={section.y + table.y + table.height / 2}
            radius={table.width / 2}
            fill={statusColor}
            stroke="#fff"
            strokeWidth={2}
            rotation={table.rotation}
            onClick={(e) => {
              e.cancelBubble = true;
              select(table.id, 'table', e.evt.shiftKey);
            }}
          />
        ) : (
          <Rect
            x={section.x + table.x}
            y={section.y + table.y}
            width={table.width}
            height={table.height}
            fill={statusColor}
            stroke="#fff"
            strokeWidth={2}
            cornerRadius={4}
            rotation={table.rotation}
            onClick={(e) => {
              e.cancelBubble = true;
              select(table.id, 'table', e.evt.shiftKey);
            }}
          />
        )}
        <Text
          x={section.x + table.x}
          y={section.y + table.y + table.height / 2 - 8}
          width={table.width}
          text={`${table.number}`}
          fontSize={14}
          fontStyle="bold"
          fill="#fff"
          align="center"
          listening={false}
        />
        <Text
          x={section.x + table.x}
          y={section.y + table.y + table.height / 2 + 6}
          width={table.width}
          text={`${table.seats}p`}
          fontSize={10}
          fill="rgba(255,255,255,0.8)"
          align="center"
          listening={false}
        />
      </Group>
    );
  };

  // Render element
  const renderElement = (element: MapElement) => {
    const isSelected = selectedIds.includes(element.id);
    const defaults = ELEMENT_DEFAULTS[element.type];
    const color = element.color || defaults.color;

    return (
      <Group key={element.id} id={element.id}>
        <Rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={color}
          stroke={isSelected ? '#E53935' : 'rgba(255,255,255,0.5)'}
          strokeWidth={isSelected ? 3 : 1}
          cornerRadius={4}
          rotation={element.rotation}
          draggable={!isPreviewMode && activeTool === 'select' && !element.isLocked}
          onClick={(e) => {
            e.cancelBubble = true;
            if (!element.isLocked) {
              select(element.id, 'element', e.evt.shiftKey);
            }
          }}
          onDragEnd={(e) => {
            updateElement(element.id, {
              x: snapToGrid(e.target.x()),
              y: snapToGrid(e.target.y()),
            });
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            updateElement(element.id, {
              x: node.x(),
              y: node.y(),
              width: Math.max(20, element.width * scaleX),
              height: Math.max(20, element.height * scaleY),
              rotation: node.rotation(),
            });
          }}
        />
        {/* Element label */}
        {element.text ? (
          <Text
            x={element.x + 4}
            y={element.y + element.height / 2 - (element.fontSize || 14) / 2}
            text={element.text}
            fontSize={element.fontSize || 14}
            fill="#fff"
            listening={false}
          />
        ) : (
          <Text
            x={element.x + 4}
            y={element.y + element.height / 2 - 6}
            text={element.name || element.type}
            fontSize={12}
            fill="rgba(255,255,255,0.8)"
            listening={false}
          />
        )}
      </Group>
    );
  };

  // Render grid
  const renderGrid = () => {
    if (!map.showGrid) return null;

    const gridLines = [];
    const gridSize = map.gridSize;

    // Vertical lines
    for (let x = 0; x <= map.width; x += gridSize) {
      gridLines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, map.height]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1}
          listening={false}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= map.height; y += gridSize) {
      gridLines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, map.width, y]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1}
          listening={false}
        />
      );
    }

    return gridLines;
  };

  // Render drawing preview
  const renderDrawingPreview = () => {
    if (!isDrawing || !drawStart || !drawCurrent) return null;

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    if (activeTool === 'rectangle') {
      return (
        <Rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3B82F6"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      );
    }

    if (activeTool === 'circle') {
      return (
        <Circle
          x={x + w / 2}
          y={y + h / 2}
          radiusX={w / 2}
          radiusY={h / 2}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3B82F6"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      );
    }

    if (activeTool === 'line') {
      return (
        <Line
          points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]}
          stroke="#3B82F6"
          strokeWidth={4}
          dash={[5, 5]}
          listening={false}
        />
      );
    }

    return null;
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={canvasState.zoom}
      scaleY={canvasState.zoom}
      x={canvasState.panX}
      y={canvasState.panY}
      draggable={activeTool === 'pan'}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: activeTool === 'pan' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
    >
      {/* Background layer */}
      <Layer>
        {/* Background */}
        <Rect
          x={0}
          y={0}
          width={map.width}
          height={map.height}
          fill={map.backgroundColor}
          listening={false}
        />

        {/* Background image */}
        {map.backgroundImage && (
          // Would use Image component here with loaded image
          null
        )}

        {/* Grid */}
        {renderGrid()}
      </Layer>

      {/* Elements layer (below sections) */}
      <Layer>
        {map.elements
          .filter(e => e.layer === 0)
          .map(renderElement)}
      </Layer>

      {/* Sections layer */}
      <Layer>
        {map.sections
          .sort((a, b) => a.layer - b.layer)
          .map(renderSection)}
      </Layer>

      {/* Elements layer (above sections) */}
      <Layer>
        {map.elements
          .filter(e => e.layer > 0)
          .map(renderElement)}
      </Layer>

      {/* Drawing preview layer */}
      <Layer>
        {renderDrawingPreview()}
      </Layer>

      {/* Transformer layer */}
      <Layer>
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
          ]}
          rotateEnabled={true}
          borderStroke="#E53935"
          borderStrokeWidth={2}
          anchorStroke="#E53935"
          anchorFill="#fff"
          anchorSize={10}
        />
      </Layer>
    </Stage>
  );
}
