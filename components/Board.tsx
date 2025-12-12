import React, { useRef } from 'react';
import { VisionItem, BoardState, BOARD_SIZE } from '../types';
import { DraggableItem } from './DraggableItem';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface BoardProps {
  boardState: BoardState;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<VisionItem>) => void;
  onDeleteItem: (id: string) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const Board: React.FC<BoardProps> = ({ 
    boardState, 
    onSelect, 
    onUpdateItem, 
    onDeleteItem,
    scale,
    onZoomIn,
    onZoomOut,
    onResetZoom
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Deselect on background click (clicking the gray area)
  const handleWrapperClick = (e: React.MouseEvent) => {
    if (e.target === wrapperRef.current) {
      onSelect(null);
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className="flex-1 relative overflow-auto bg-gray-200 flex items-center justify-center p-4 lg:p-8 touch-pan-x touch-pan-y"
      onMouseDown={handleWrapperClick}
    >
      {/* Zoom Controls Overlay */}
      <div className="fixed top-20 right-6 flex flex-col gap-2 bg-white/90 backdrop-blur shadow-lg rounded-lg p-2 z-40">
        <button onClick={onZoomIn} className="p-2 hover:bg-vision-50 rounded text-vision-800" title="Zoom In">
            <ZoomIn size={20} />
        </button>
        <button onClick={onZoomOut} className="p-2 hover:bg-vision-50 rounded text-vision-800" title="Zoom Out">
            <ZoomOut size={20} />
        </button>
        <hr className="border-gray-200" />
        <button onClick={onResetZoom} className="p-2 hover:bg-vision-50 rounded text-vision-800" title="Fit to Screen">
            <Maximize size={20} />
        </button>
        <span className="text-[10px] text-center text-gray-400 font-mono">{Math.round(scale * 100)}%</span>
      </div>

      {/* The Actual Vision Board */}
      <div 
        id="vision-board-canvas"
        className="relative shadow-2xl transition-colors duration-500 overflow-hidden shrink-0 origin-center"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          transform: `scale(${scale})`,
          backgroundColor: boardState.backgroundColor,
          // Subtle paper texture overlay
          backgroundImage: `linear-gradient(${boardState.backgroundColor} 90%, transparent 90%), linear-gradient(90deg, ${boardState.backgroundColor} 90%, transparent 90%)`,
        }}
        // Stop propagation so clicking the board doesn't deselect immediately
        onMouseDown={(e) => {
           if(e.target === e.currentTarget) onSelect(null);
        }}
      >
          {/* Decorative Year Watermark inside the board */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] z-0 select-none">
             <h2 className="text-[20rem] font-serif font-bold text-black leading-none">2026</h2>
          </div>

        {boardState.items.map(item => (
          <DraggableItem
            key={item.id}
            item={item}
            isSelected={boardState.selectedId === item.id}
            onSelect={(id) => onSelect(id)}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
            scale={scale} 
          />
        ))}
      </div>
    </div>
  );
};