import React, { useState, useCallback } from 'react';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { BoardState, ItemType, VisionItem, Goal, GRID_SIZE, BOARD_SIZE } from './types';
import { downloadBoard } from './utils/helpers';

const App: React.FC = () => {
  const [boardState, setBoardState] = useState<BoardState>({
    items: [],
    selectedId: null,
    backgroundColor: '#fdf8f6'
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [zoomScale, setZoomScale] = useState(1);

  // Zoom Handlers
  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoomScale(prev => Math.max(prev - 0.1, 0.4));
  const handleResetZoom = () => setZoomScale(1);

  // Base helper for creating items
  const createItem = (type: ItemType, content: string, x: number, y: number, w: number, h: number, color?: string): VisionItem => ({
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        x,
        y,
        width: w,
        height: h,
        rotation: (type === ItemType.STICKER || type === ItemType.DOODLE) ? 0 : (Math.random() * 4) - 2,
        zIndex: Date.now(),
        color
  });

  const handleAddItem = useCallback((type: ItemType, content: string, color?: string) => {
    setBoardState(prev => {
      const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;
      
      // Place in center of the BOARD (relative to 800x800)
      const centerX = BOARD_SIZE / 2;
      const centerY = BOARD_SIZE / 2;
      
      // Randomize slightly
      const rawX = centerX - 100 + (Math.random() * 100 - 50);
      const rawY = centerY - 100 + (Math.random() * 100 - 50);

      // Default sizes
      let w = 200, h = 200;
      if (type === ItemType.IMAGE) { w = 250; h = 320; }
      if (type === ItemType.TEXT) { w = 400; h = 100; }
      if (type === ItemType.STICKER) { w = 120; h = 120; }
      if (type === ItemType.DOODLE) { w = 150; h = 150; }
      if (type === ItemType.SHAPE) { w = 150; h = 150; }
      if (type === ItemType.SHAPE && !color) { w = 200; h = 40; } // Washi tape

      const newItem = createItem(type, content, snap(rawX), snap(rawY), w, h, color);

      return {
        ...prev,
        items: [...prev.items, newItem],
        selectedId: newItem.id
      };
    });
  }, []);

  const handleAddGrid = useCallback((gridItems: { type: ItemType, content: string, color?: string }[]) => {
      // 4 columns, 5 rows grid (total 20 slots)
      const cols = 4;
      const rows = 5;
      
      const itemW = BOARD_SIZE / cols; // 200
      const itemH = BOARD_SIZE / rows; // 160

      const newVisionItems: VisionItem[] = [];

      gridItems.forEach((item, index) => {
          if (index >= cols * rows) return; 
          
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          const x = col * itemW;
          const y = row * itemH;

          newVisionItems.push(createItem(item.type, item.content, x, y, itemW, itemH, item.color));
      });

      setBoardState(prev => ({
          ...prev,
          items: [...prev.items, ...newVisionItems], 
          selectedId: null 
      }));
  }, []);

  const handleAutoArrange = useCallback(() => {
    setBoardState(prev => {
        // Strict 20-cell grid structure (4 columns x 5 rows)
        // This ensures a clean layout filling the 800x800 board
        const cols = 4;
        const rows = 5;
        const cellWidth = BOARD_SIZE / cols;  // 200px
        const cellHeight = BOARD_SIZE / rows; // 160px
        
        // Separate Stickers/Doodles from content items
        const contentItems = prev.items.filter(i => i.type !== ItemType.STICKER && i.type !== ItemType.DOODLE);
        const decorations = prev.items.filter(i => i.type === ItemType.STICKER || i.type === ItemType.DOODLE);
        
        const sortedContent = [...contentItems];
        
        const arrangedContent = sortedContent.map((item, index) => {
            const gridIndex = index % 20;
            const col = gridIndex % cols;
            const row = Math.floor(gridIndex / cols);
            const x = col * cellWidth;
            const y = row * cellHeight;

            return {
                ...item,
                x,
                y,
                width: cellWidth,
                height: cellHeight,
                rotation: 0 // Align perfectly straight
            };
        });

        // Keep stickers floating but randomize slightly
        const arrangedDecorations = decorations.map(s => ({
            ...s,
            rotation: (Math.random() * 20) - 10, 
        }));

        return {
            ...prev,
            items: [...arrangedContent, ...arrangedDecorations]
        };
    });
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<VisionItem>) => {
    setBoardState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setBoardState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      selectedId: null
    }));
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setBoardState(prev => ({ ...prev, selectedId: id }));
  }, []);

  const handleAddGoal = useCallback((goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  }, []);

  const handleUpdateBg = useCallback((color: string) => {
      setBoardState(prev => ({ ...prev, backgroundColor: color }));
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-vision-900 bg-gray-100">
      <Sidebar 
        onAddItem={handleAddItem} 
        onAddGrid={handleAddGrid}
        onDownload={downloadBoard}
        goals={goals}
        onAddGoal={handleAddGoal}
        onUpdateBg={handleUpdateBg}
        bgColor={boardState.backgroundColor}
        onAutoArrange={handleAutoArrange}
      />
      <Board 
        boardState={boardState}
        onSelect={handleSelect}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        scale={zoomScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />
    </div>
  );
};

export default App;