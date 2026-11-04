export type ToolType =
  | 'select'
  | 'hand'
  | 'pencil'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'text'
  | 'sticky'
  | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[]; // for pencil / freehand
  startX?: number; // for line / arrow
  startY?: number;
  endX?: number;
  endY?: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface CanvasAppState {
  zoom: number;
  scrollX: number;
  scrollY: number;
  gridType: 'dots' | 'lines' | 'none';
  backgroundColor: string;
  theme: 'light' | 'dark';
}

export interface DrawingDocument {
  id: string;
  shortId: number;
  title: string;
  description?: string | null;
  category: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  elements: WhiteboardElement[];
  appState?: Partial<CanvasAppState> | null;
  isSample: boolean;
  createdAt: string;
  updatedAt: string;
}
