import React from 'react';
import { Search, Network, Users, ChevronDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  viewMode: 'chart' | 'list';
  onViewModeChange: (mode: 'chart' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  onRegionChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* 1. Left: Brand Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs">
                PORG
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-xl tracking-tight text-neutral-950">
                    PORG
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 px-1.5 py-0.5 rounded font-bold">
                    KOREA
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium hidden sm:block">
                  대한민국 정치 조직도 & 인물 데이터
                </div>
              </div>
            </div>

            {/* Region Selector */}
            <div className="relative">
              <select
                value={currentRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="appearance-none text-xs font-bold bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg pl-3 pr-8 py-1.5 text-neutral-900 cursor-pointer focus:outline-none transition-colors"
              >
                <option value="대한민국 국회">🏛️ 제22대 국회</option>
                <option value="마포구">📍 서울 마포구 (조직도)</option>
                <option value="강남구">📍 서울 강남구 (조직도)</option>
                <option value="종로구">📍 서울 종로구 (정치1번지)</option>
                <option value="분당구">📍 경기 성남시 분당구</option>
                <option value="해운대구">📍 부산 해운대구</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* 2. Center: Global Search Input */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="의원 이름, 정당, 지역구 또는 상임위 검색..."
                className="w-full text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-black rounded-lg pl-9 pr-12 py-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 bg-white">
                검색
              </span>
            </div>
          </div>

          {/* 3. Right: View Toggle Buttons (The Org style Tabs) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
              <button
                onClick={() => onViewModeChange('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'chart'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                  }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">정치 조직도</span>
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'list'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">인물 디렉토리</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="의원 이름, 정당, 지역구 검색..."
              className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
