export enum ItemType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  NOTE = 'NOTE',
  QUOTE = 'QUOTE',
  STICKER = 'STICKER',
  SHAPE = 'SHAPE',
  DOODLE = 'DOODLE'
}

export const GRID_SIZE = 24;
export const BOARD_SIZE = 800;

export interface VisionItem {
  id: string;
  type: ItemType;
  content: string; // URL for image, text content for others, SVG string for doodles
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  color?: string; // For notes/text/shapes/doodles
}

export interface BoardState {
  items: VisionItem[];
  selectedId: string | null;
  backgroundColor: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  notified: boolean;
}

// Declare html2canvas as it is loaded via script tag
declare global {
  interface Window {
    html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  }
}