// In-memory storage for maps (for development without database)
// In production, this would use Prisma/database

export interface MapData {
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
  sections: SectionData[];
  elements: ElementData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionData {
  id: string;
  name: string;
  type: string;
  color: string;
  shape: string;
  path?: unknown;
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
  rowConfig?: unknown;
  seats: SeatData[];
  tables: TableData[];
}

export interface SeatData {
  id: string;
  sectionId: string;
  row: string;
  number: number;
  label?: string;
  x: number;
  y: number;
  status: string;
  specialType?: string;
}

export interface TableData {
  id: string;
  sectionId: string;
  number: number;
  label?: string;
  shape: string;
  seats: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  status: string;
}

export interface ElementData {
  id: string;
  type: string;
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

// Global maps store (persists across API route calls in development)
// Note: This will reset on server restart. For production, use a database.
declare global {
  // eslint-disable-next-line no-var
  var mapsStore: Map<string, MapData> | undefined;
}

export const mapsStore = global.mapsStore || new Map<string, MapData>();

if (process.env.NODE_ENV !== 'production') {
  global.mapsStore = mapsStore;
}

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
