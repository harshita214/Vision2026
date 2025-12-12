import React, { useState } from 'react';
import { Plus, Image as ImageIcon, Type, StickyNote, Download, Bell, Sparkles, LayoutGrid, Smile, AlignJustify, Loader2, PenTool } from 'lucide-react';
import { ItemType, Goal } from '../types';
import { generateVisionAssets, generatePlan, generateGridAssets } from '../services/gemini';

interface SidebarProps {
  onAddItem: (type: ItemType, content: string, color?: string) => void;
  onAddGrid: (items: { type: ItemType, content: string, color?: string }[]) => void;
  onDownload: () => void;
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateBg: (color: string) => void;
  bgColor: string;
  onAutoArrange: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddItem, onAddGrid, onDownload, goals, onAddGoal, onUpdateBg, bgColor, onAutoArrange }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'grid' | 'stickers' | 'goals'>('create');
  const [topic, setTopic] = useState('');
  const [gridTopic, setGridTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGridGenerating, setIsGridGenerating] = useState(false);
  
  // Notification States
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [aiPlan, setAiPlan] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);

  const STICKERS = [
      "✨", "💫", "🌟", "💖", "🌿", "🌸", "🦋", "🍄", 
      "☁️", "🌙", "⚡", "🔥", "💧", "🌈", "🎨", "✈️",
      "📍", "🏝️", "🏰", "🏠", "🧘‍♀️", "💪", "💰", "💸",
      "📈", "🎓", "📚", "🕯️", "🔮", "🧿", "🍀", "🕊️",
      "📌", "📎", "🖍️", "🖊️", "❤️", "🧡", "💛", "💚",
      "💙", "💜", "🖤", "🤍", "🧶", "🧵", "🧷", "🗝️"
  ];

  // SVG Strings for Doodles (Aesthetic hand-drawn style)
  const DOODLES = [
      { name: "Arrow", svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20,80 Q50,10 80,50 M70,40 L80,50 L65,65" /></svg>` },
      { name: "Circle", svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50,10 C20,10 5,30 10,60 C15,90 40,95 70,90 C95,85 95,60 85,30 C75,5 50,5 45,10" /></svg>` },
      { name: "Star", svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,75 L25,90 L35,60 L10,40 L40,40 Z" /></svg>` },
      { name: "Heart", svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50,85 C20,70 0,50 0,30 C0,10 20,0 40,10 C50,20 50,20 60,10 C80,0 100,10 100,30 C100,50 80,70 50,85 Z" /></svg>` },
      { name: "Swirl", svg: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0 a30,30 0 1,0 60,0 a20,20 0 1,0 -40,0 a10,10 0 1,0 20,0" /></svg>` },
      { name: "Underline", svg: `<svg viewBox="0 0 200 50" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M10,25 Q50,5 90,25 T190,25" /></svg>` },
      { name: "Sparkles", svg: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 0L55 40L95 45L55 50L50 90L45 50L5 45L45 40L50 0Z" /></svg>` },
      { name: "Tape", svg: `<svg viewBox="0 0 200 50" fill="currentColor" opacity="0.5"><path d="M5,5 L195,10 L190,45 L10,40 Z" /></svg>` }
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    const items = await generateVisionAssets(topic);
    items.forEach(item => onAddItem(item.type, item.content, item.color));
    setIsGenerating(false);
    setTopic('');
  };

  const handleGenerateGrid = async () => {
      if (!gridTopic.trim()) return;
      setIsGridGenerating(true);
      const items = await generateGridAssets(gridTopic);
      onAddGrid(items);
      setIsGridGenerating(false);
      setGridTopic('');
  }

  const handleAddGoal = async () => {
    if (!goalTitle || !goalDate) return;
    
    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
         new Notification("Goal Set! 🎯", {
            body: `We'll ping you about "${goalTitle}" on ${new Date(goalDate).toLocaleDateString()}. Stay focused!`,
         });
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalTitle,
      targetDate: goalDate,
      notified: false
    };

    onAddGoal(newGoal);
    setGoalTitle('');
    setGoalDate('');
  };

  const handleGeneratePlan = async () => {
    if (goals.length === 0) return;
    setIsPlanning(true);
    const plan = await generatePlan(goals.map(g => g.title));
    setAiPlan(plan);
    setIsPlanning(false);
  }

  return (
    <div className="h-full w-80 bg-white/90 backdrop-blur-xl border-r border-vision-200 flex flex-col shadow-2xl z-20">
      {/* Header */}
      <div className="p-5 border-b border-vision-100 flex items-center justify-between">
        <div>
            <h1 className="text-xl font-serif font-bold text-vision-900 tracking-tight">Vision 2026</h1>
            <p className="text-[10px] text-vision-500 mt-0.5 uppercase tracking-widest">Board Creator</p>
        </div>
        <div className="relative group flex items-center gap-2">
            <button 
                onClick={onAutoArrange}
                className="p-1.5 text-vision-500 hover:text-vision-900 hover:bg-vision-50 rounded"
                title="Auto Arrange Board"
            >
                <AlignJustify size={18} />
            </button>
            <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => onUpdateBg(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer border-2 border-vision-200 p-0 overflow-hidden" 
                title="Board Background Color"
            />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-vision-100 bg-vision-50">
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 transition-colors ${activeTab === 'create' ? 'text-vision-800 border-b-2 border-vision-800' : 'text-gray-400'}`} title="Create"><Plus size={18} className="mx-auto" /></button>
        <button onClick={() => setActiveTab('grid')} className={`flex-1 py-3 transition-colors ${activeTab === 'grid' ? 'text-vision-800 border-b-2 border-vision-800' : 'text-gray-400'}`} title="Magic Grid"><LayoutGrid size={18} className="mx-auto" /></button>
        <button onClick={() => setActiveTab('stickers')} className={`flex-1 py-3 transition-colors ${activeTab === 'stickers' ? 'text-vision-800 border-b-2 border-vision-800' : 'text-gray-400'}`} title="Stickers"><Smile size={18} className="mx-auto" /></button>
        <button onClick={() => setActiveTab('goals')} className={`flex-1 py-3 transition-colors ${activeTab === 'goals' ? 'text-vision-800 border-b-2 border-vision-800' : 'text-gray-400'}`} title="Goals"><Bell size={18} className="mx-auto" /></button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
        
        {activeTab === 'create' && (
          <>
            {/* AI Generator */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-vision-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} /> Quick Add
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Travel, Fitness..."
                  className="w-full p-3 bg-vision-50 border border-vision-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-vision-300 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic}
                  className="absolute right-2 top-2 p-1.5 bg-vision-800 text-white rounded-md hover:bg-vision-900 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </div>
            </div>

            <hr className="border-vision-100" />

            {/* Manual Tools */}
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => onAddItem(ItemType.NOTE, "New Note", "#fef3c7")} className="flex flex-col items-center justify-center p-4 bg-yellow-50 border border-yellow-100 rounded-xl hover:shadow-md transition-all text-yellow-700 gap-2">
                   <StickyNote size={20} /><span className="text-xs font-medium">Sticky</span>
                 </button>
                 <button onClick={() => { const t = prompt("Enter text:"); if(t) onAddItem(ItemType.TEXT, t); }} className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-100 rounded-xl hover:shadow-md transition-all text-blue-700 gap-2">
                   <Type size={20} /><span className="text-xs font-medium">Text</span>
                 </button>
                 <button onClick={() => onAddItem(ItemType.SHAPE, "", "#e5e7eb")} className="flex flex-col items-center justify-center p-4 bg-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition-all text-gray-600 gap-2">
                   <div className="w-5 h-5 bg-gray-400 rounded-sm"></div><span className="text-xs font-medium">Block</span>
                 </button>
               </div>

               <div className="relative group">
                 <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-vision-200 rounded-xl cursor-pointer hover:border-vision-400 hover:bg-vision-50 transition-all text-vision-400 gap-2">
                    <ImageIcon size={20} /><span className="text-xs font-medium">Upload Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => { if (ev.target?.result) onAddItem(ItemType.IMAGE, ev.target.result as string); };
                            reader.readAsDataURL(file);
                        }
                    }} />
                 </label>
               </div>
            </div>
          </>
        )}

        {activeTab === 'grid' && (
             <div className="space-y-4">
                 <div className="bg-vision-50 p-4 rounded-xl border border-vision-200">
                    <h3 className="text-sm font-bold text-vision-800 mb-2 flex items-center gap-2">Magic Grid Generator</h3>
                    <p className="text-xs text-gray-500 mb-4">Creates a 20-block mood board with images, quotes, and colors instantly inside the board.</p>
                    <textarea 
                        value={gridTopic}
                        onChange={(e) => setGridTopic(e.target.value)}
                        placeholder="Describe your 2026 vibe... (e.g. Minimalist Tokyo Apartment, Cozy Coffee Shop)"
                        className="w-full p-3 text-sm border rounded-lg bg-white focus:ring-1 focus:ring-vision-300 outline-none h-24 resize-none mb-3"
                    />
                    <button 
                        onClick={handleGenerateGrid}
                        disabled={isGridGenerating || !gridTopic}
                        className="w-full py-2.5 bg-vision-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isGridGenerating ? <Loader2 size={16} className="animate-spin" /> : <LayoutGrid size={16} />}
                        Generate Grid
                    </button>
                 </div>
                 <div className="text-[10px] text-center text-gray-400">
                     Note: This generates ~4 AI images and multiple text/color blocks to form a cohesive grid.
                 </div>
             </div>
        )}

        {activeTab === 'stickers' && (
            <div className="space-y-6">
                
                {/* Doodles Section */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-vision-500 uppercase tracking-wider flex items-center gap-2">
                         <PenTool size={12} /> Aesthetic Doodles
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {DOODLES.map((doodle, i) => (
                            <button 
                                key={i}
                                onClick={() => onAddItem(ItemType.DOODLE, doodle.svg, '#43302b')}
                                className="aspect-square p-2 bg-white border border-vision-100 rounded-lg hover:border-vision-300 hover:shadow-sm transition-all text-vision-900 flex items-center justify-center"
                                title={doodle.name}
                            >
                                <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: doodle.svg }} />
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-vision-100" />

                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-vision-500 uppercase tracking-wider">Emojis</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {STICKERS.map(sticker => (
                            <button 
                                key={sticker}
                                onClick={() => onAddItem(ItemType.STICKER, sticker)}
                                className="text-xl p-1 hover:bg-vision-100 rounded transition-transform hover:scale-110 active:scale-95"
                            >
                                {sticker}
                            </button>
                        ))}
                    </div>
                </div>
                
                <hr className="border-vision-100" />
                
                <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">Washi Tape</p>
                    <div className="flex justify-center gap-2">
                         <button onClick={() => onAddItem(ItemType.SHAPE, "", "#ffb7b2")} className="w-8 h-4 bg-[#ffb7b2] -rotate-2 hover:scale-110 transition-transform shadow-sm"></button>
                         <button onClick={() => onAddItem(ItemType.SHAPE, "", "#b5ead7")} className="w-8 h-4 bg-[#b5ead7] rotate-2 hover:scale-110 transition-transform shadow-sm"></button>
                         <button onClick={() => onAddItem(ItemType.SHAPE, "", "#e2f0cb")} className="w-8 h-4 bg-[#e2f0cb] -rotate-1 hover:scale-110 transition-transform shadow-sm"></button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
             <div className="bg-vision-50 p-4 rounded-xl space-y-3 border border-vision-100">
                <h3 className="text-sm font-bold text-vision-800 flex items-center gap-2">
                    <Bell size={16} /> Set Target
                </h3>
                <input type="text" placeholder="Goal Title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="w-full p-2 text-sm border rounded bg-white outline-none" />
                <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} className="w-full p-2 text-sm border rounded bg-white outline-none" />
                <button onClick={handleAddGoal} disabled={!goalTitle || !goalDate} className="w-full py-2 bg-vision-800 text-white rounded text-xs font-bold uppercase tracking-wide disabled:opacity-50">Notify Me</button>
             </div>
             <div className="space-y-2">
                {goals.map(g => (
                    <div key={g.id} className="flex justify-between p-3 bg-white border border-vision-100 rounded-lg shadow-sm">
                        <div><p className="font-medium text-sm">{g.title}</p><p className="text-xs text-gray-400">{new Date(g.targetDate).toLocaleDateString()}</p></div>
                        <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 animate-pulse"></div>
                    </div>
                ))}
             </div>
             {goals.length > 0 && (
                <button onClick={handleGeneratePlan} disabled={isPlanning} className="w-full py-2 border border-vision-300 text-vision-700 rounded text-xs font-bold hover:bg-vision-50 flex items-center justify-center gap-2">
                   {isPlanning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Action Plan
                </button>
             )}
             {aiPlan && <div className="p-3 bg-white border rounded text-xs text-gray-600 max-h-40 overflow-auto whitespace-pre-wrap">{aiPlan}</div>}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-vision-200 bg-white">
        <button onClick={onDownload} className="w-full flex items-center justify-center gap-2 py-3 bg-vision-900 text-white rounded-xl shadow-lg hover:bg-black transition-all">
          <Download size={18} /><span className="font-medium">Download Board</span>
        </button>
      </div>
    </div>
  );
};