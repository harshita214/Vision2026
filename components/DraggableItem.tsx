import React, { useRef, useEffect } from 'react';
import { VisionItem, ItemType, GRID_SIZE } from '../types';
import { Trash2, RotateCw, Maximize2, Minimize2 } from 'lucide-react';

interface DraggableItemProps {
  item: VisionItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<VisionItem>) => void;
  onDelete: (id: string) => void;
  scale: number;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startItemPos = useRef({ x: 0, y: 0 });

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item.id);
    onUpdate(item.id, { zIndex: Date.now() });

    if (e.button === 0) {
      isDragging.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      startItemPos.current = { x: item.x, y: item.y };
    }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    onSelect(item.id);
    onUpdate(item.id, { zIndex: Date.now() });

    if (e.touches.length === 1) {
        isDragging.current = true;
        startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startItemPos.current = { x: item.x, y: item.y };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;

      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as MouseEvent).clientX;
          clientY = (e as MouseEvent).clientY;
      }

      // Calculate delta taking zoom scale into account
      const dx = (clientX - startPos.current.x) / scale;
      const dy = (clientY - startPos.current.y) / scale;

      let nextX = startItemPos.current.x + dx;
      let nextY = startItemPos.current.y + dy;

      // Snap to Grid (hold shift to disable)
      const isShift = (e as MouseEvent).shiftKey;
      if (!isShift) {
        nextX = Math.round(nextX / GRID_SIZE) * GRID_SIZE;
        nextY = Math.round(nextY / GRID_SIZE) * GRID_SIZE;
      }

      onUpdate(item.id, {
        x: nextX,
        y: nextY
      });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    if (isSelected) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove, { passive: false });
        window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isSelected, item.id, onUpdate, scale]);

  // Style helper
  const commonClasses = `absolute cursor-grab active:cursor-grabbing transition-shadow duration-200 group select-none touch-none`; // touch-none prevents scrolling while dragging
  const selectedClasses = isSelected ? 'ring-2 ring-vision-500 shadow-2xl z-50' : 'hover:shadow-lg shadow-md';
  const stickerClasses = isSelected ? 'ring-2 ring-blue-400 z-50' : 'hover:scale-110 transition-transform';
  const doodleClasses = isSelected ? 'ring-2 ring-vision-400 z-50' : 'hover:opacity-80 transition-opacity';

  const getStyle = (): React.CSSProperties => ({
    left: item.x,
    top: item.y,
    width: item.width,
    height: item.height === 0 ? 'auto' : item.height,
    transform: `rotate(${item.rotation}deg)`,
    zIndex: item.zIndex,
    backgroundColor: (item.type === ItemType.STICKER || item.type === ItemType.DOODLE) ? 'transparent' : (item.color || 'transparent'),
    color: item.color || '#43302b' // Default vision-900 for doodles
  });

  const renderContent = () => {
    switch (item.type) {
      case ItemType.IMAGE:
        return (
          <img 
            src={item.content} 
            alt="Vision" 
            className="w-full h-full object-cover rounded-sm pointer-events-none" 
            draggable={false}
          />
        );
      case ItemType.NOTE:
        return (
          <div className="w-full h-full p-4 font-hand text-xl leading-relaxed flex items-center justify-center text-center break-words overflow-hidden text-gray-800" style={{backgroundColor: item.color}}>
            {item.content}
          </div>
        );
      case ItemType.SHAPE:
        return (
          <div className="w-full h-full rounded-sm" style={{backgroundColor: item.color}}></div>
        );
      case ItemType.QUOTE:
        return (
          <div className="w-full h-full p-4 bg-white/90 backdrop-blur-sm flex items-center justify-center text-center font-serif italic text-lg lg:text-xl text-vision-900 border-l-4 border-vision-500 rounded-r-lg shadow-sm overflow-hidden">
             "{item.content}"
          </div>
        );
      case ItemType.TEXT:
        return (
             <div className="w-full h-full p-2 flex items-center justify-center text-center font-sans font-bold text-2xl lg:text-4xl text-vision-900 drop-shadow-sm uppercase tracking-wider break-words">
            {item.content}
          </div>
        );
      case ItemType.STICKER:
         return (
             <div className="w-full h-full flex items-center justify-center text-[5rem] leading-none drop-shadow-md select-none">
                 {item.content}
             </div>
         );
      case ItemType.DOODLE:
        return (
            <div 
              className="w-full h-full flex items-center justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
        );
      default:
        return null;
    }
  };

  const isSticker = item.type === ItemType.STICKER;
  const isDoodle = item.type === ItemType.DOODLE;

  return (
    <div
      ref={itemRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`${commonClasses} ${isSticker ? stickerClasses : (isDoodle ? doodleClasses : selectedClasses)} ${isSticker || isDoodle ? 'shadow-none' : ''}`}
      style={getStyle()}
    >
      <div className={`w-full h-full overflow-hidden relative ${isSticker || isDoodle ? '' : 'rounded-md'}`}>
        {renderContent()}
      </div>

      {isSelected && (
        <>
          {/* Controls - Made larger for touch targets */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-3 bg-white rounded-full shadow-lg p-2 scale-100 origin-bottom transition-all z-50">
             <button 
                className="p-2 hover:bg-red-50 text-red-500 rounded-full"
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                title="Delete"
             >
               <Trash2 size={20} />
             </button>
             <button 
                className="p-2 hover:bg-vision-50 text-vision-600 rounded-full"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onUpdate(item.id, { rotation: (item.rotation + 45) % 360 }); 
                }}
                title="Rotate"
             >
               <RotateCw size={20} />
             </button>
             <div className="w-[1px] h-8 bg-gray-200 mx-1"></div>
             <button 
                className="p-2 hover:bg-vision-50 text-vision-600 rounded-full"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onUpdate(item.id, { width: item.width * 1.1, height: (item.type === ItemType.IMAGE || item.type === ItemType.SHAPE || item.type === ItemType.STICKER || item.type === ItemType.DOODLE) ? item.height * 1.1 : item.height }); 
                }}
                title="Enlarge"
             >
               <Maximize2 size={20} />
             </button>
             <button 
                className="p-2 hover:bg-vision-50 text-vision-600 rounded-full"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onUpdate(item.id, { width: Math.max(40, item.width * 0.9), height: (item.type === ItemType.IMAGE || item.type === ItemType.SHAPE || item.type === ItemType.STICKER || item.type === ItemType.DOODLE) ? Math.max(40, item.height * 0.9) : item.height }); 
                }}
                title="Shrink"
             >
               <Minimize2 size={20} />
             </button>
          </div>
        </>
      )}
    </div>
  );
};