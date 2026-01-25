// Map Editor Types

export type Tool =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'line'
  | 'text'
  | 'pan';

export type SectionType =
  | 'SEATED'
  | 'GENERAL_ADMISSION'
  | 'TABLES'
  | 'STANDING'
  | 'VIP_AREA';

export type SeatStatus =
  | 'AVAILABLE'
  | 'SELECTED'
  | 'RESERVED'
  | 'SOLD'
  | 'BLOCKED';

export type ElementType =
  | 'STAGE'
  | 'BAR'
  | 'BATHROOM_M'
  | 'BATHROOM_F'
  | 'BATHROOM'
  | 'EXIT'
  | 'ENTRANCE'
  | 'STAIRS'
  | 'ELEVATOR'
  | 'TEXT'
  | 'IMAGE'
  | 'LINE'
  | 'WALL'
  | 'COLUMN'
  | 'DANCE_FLOOR'
  | 'DJ_BOOTH'
  | 'VIP_LOUNGE';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface MapSection {
  id: string;
  name: string;
  type: SectionType;
  color: string;
  shape: 'rectangle' | 'circle' | 'polygon';
  path?: Position[]; // For polygon
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  capacity: number;
  description?: string;
  starRating?: number;
  isActive: boolean;
  layer: number;
  opacity: number;
  ticketTypeId?: string;
  rowConfig?: RowConfig;
  seats?: MapSeat[];
  tables?: MapTable[];
}

export interface RowConfig {
  startRow: string;
  rowCount: number;
  seatsPerRow: number;
  curved: boolean;
  curveAmount: number;
  spacing: {
    seat: number;
    row: number;
  };
  numberingType: 'continuous' | 'odd-even' | 'left-right';
  startNumber: number;
}

export interface MapSeat {
  id: string;
  sectionId: string;
  row: string;
  number: number;
  label?: string;
  x: number;
  y: number;
  status: SeatStatus;
  specialType?: 'wheelchair' | 'limited_view' | 'companion';
  orderId?: string;
}

export interface MapTable {
  id: string;
  sectionId: string;
  number: number;
  label?: string;
  shape: 'round' | 'rectangle' | 'square';
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  status: SeatStatus;
  orderId?: string;
}

export interface MapElement {
  id: string;
  type: ElementType;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
  icon?: string;
  text?: string;
  fontSize?: number;
  imageUrl?: string;
  layer: number;
  isLocked: boolean;
}

export interface VenueMap {
  id: string;
  name: string;
  venueId?: string;
  eventId?: string;
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  gridSize: number;
  showGrid: boolean;
  isTemplate: boolean;
  templateName?: string;
  version: number;
  sections: MapSection[];
  elements: MapElement[];
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface EditorState {
  map: VenueMap;
  selectedIds: string[];
  selectedType: 'section' | 'element' | 'seat' | 'table' | null;
  activeTool: Tool;
  isDrawing: boolean;
  drawingPoints: Position[];
  canvasState: CanvasState;
  isDirty: boolean;
  isPreviewMode: boolean;
}

export interface HistoryState {
  past: VenueMap[];
  present: VenueMap;
  future: VenueMap[];
}

// Library elements
export interface LibraryItem {
  id: string;
  name: string;
  icon: string;
  category: 'furniture' | 'structure' | 'service' | 'decoration';
  type: ElementType;
  defaultWidth: number;
  defaultHeight: number;
  defaultColor?: string;
}

// Templates
export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'theater' | 'club' | 'stadium' | 'banquet' | 'festival' | 'conference';
  map: Omit<VenueMap, 'id' | 'venueId' | 'eventId' | 'createdAt' | 'updatedAt'>;
}

// Color palette for sections
export const SECTION_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

// Status colors for seats
export const STATUS_COLORS: Record<SeatStatus, string> = {
  AVAILABLE: '#10B981',
  SELECTED: '#3B82F6',
  RESERVED: '#F59E0B',
  SOLD: '#6B7280',
  BLOCKED: '#EF4444',
};

// Element icons mapping
export const ELEMENT_ICONS: Record<ElementType, string> = {
  STAGE: 'Theater',
  BAR: 'Wine',
  BATHROOM_M: 'User',
  BATHROOM_F: 'User',
  BATHROOM: 'Bath',
  EXIT: 'DoorOpen',
  ENTRANCE: 'DoorClosed',
  STAIRS: 'ArrowUpDown',
  ELEVATOR: 'ArrowUpFromLine',
  TEXT: 'Type',
  IMAGE: 'Image',
  LINE: 'Minus',
  WALL: 'Square',
  COLUMN: 'Circle',
  DANCE_FLOOR: 'Music',
  DJ_BOOTH: 'Headphones',
  VIP_LOUNGE: 'Crown',
};

// Default element sizes
export const ELEMENT_DEFAULTS: Record<ElementType, { width: number; height: number; color: string }> = {
  STAGE: { width: 300, height: 100, color: '#1F2937' },
  BAR: { width: 150, height: 40, color: '#7C3AED' },
  BATHROOM_M: { width: 60, height: 60, color: '#3B82F6' },
  BATHROOM_F: { width: 60, height: 60, color: '#EC4899' },
  BATHROOM: { width: 80, height: 60, color: '#6B7280' },
  EXIT: { width: 40, height: 40, color: '#10B981' },
  ENTRANCE: { width: 50, height: 50, color: '#3B82F6' },
  STAIRS: { width: 60, height: 80, color: '#6B7280' },
  ELEVATOR: { width: 50, height: 50, color: '#6B7280' },
  TEXT: { width: 100, height: 30, color: '#1F2937' },
  IMAGE: { width: 100, height: 100, color: '#6B7280' },
  LINE: { width: 100, height: 4, color: '#6B7280' },
  WALL: { width: 100, height: 10, color: '#374151' },
  COLUMN: { width: 30, height: 30, color: '#4B5563' },
  DANCE_FLOOR: { width: 200, height: 200, color: '#8B5CF6' },
  DJ_BOOTH: { width: 100, height: 60, color: '#F59E0B' },
  VIP_LOUNGE: { width: 150, height: 100, color: '#F59E0B' },
};
