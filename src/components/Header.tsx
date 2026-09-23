import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  viewMode?: 'chart' | 'list';
  onViewModeChange?: (mode: 'chart' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdminClick?: () => void; // ⭐️ 관리자 모달 클릭 이벤트
}

// -------------------------------------------------------------
// [대한민국 국기법 공식 표준] 정방향 100% 순수 SVG 태극기
// -------------------------------------------------------------
const Taegeukgi: React.FC<{ className?: string }> = ({ className = 'w-10 h-6.5' }) => (
  <svg
    viewBox="-72 -48 144 96"
    className={`${className} select-none shrink-0 block`}
  >
    {/* 1. 흰색 바탕 (3:2 공식 비율, 미세 라운딩) */}
    <rect x="-72" y="-48" width="144" height="96" fill="#ffffff" rx="2" />

    {/* 2. 건(상단왼쪽)·곤(하단오른쪽) 괘 */}
    <g stroke="#000000" strokeWidth="4">
      <path
        transform="rotate(33.69006752598)"
        d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"
      />
      {/* 3. 감(상단오른쪽)·리(하단왼쪽) 괘 */}
      <path
        transform="rotate(-33.69006752598)"
        d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"
      />
    </g>

    {/* 4. 중앙 정방향 태극 */}
    <g transform="rotate(33.69006752598)">
      <path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" />
      <path fill="#0047a0" d="M0 0a12 12 0 1124 0 24 24 0 11-48 0 12 12 0 1024 0" />
    </g>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  onRegionChange,
  searchQuery,
  onSearchChange,
  onAdminClick,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100">
      {/* 좌우 1280px 족쇄를 풀고 화면 좌우 끝까지 시원하게 꽉 채움 */}
      <div className="w-full px-4 sm:px-6 lg:px-10 relative">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* 1. 왼쪽: [태극기 심볼] + 브랜드명 + 국회 선택창 */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <Taegeukgi className="w-[45px] h-[30px] sm:w-[54px] sm:h-[36px] rounded-[2px]" />

              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl tracking-tight text-neutral-950 leading-none">
                    피코드
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 px-1.5 py-0.5 rounded font-bold leading-none">
                    KOREA
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 font-medium mt-1 leading-none hidden sm:block">
                  복잡한 정치를 한눈에
                </div>
              </div>
            </div>

            {/* 깔끔한 세로 구분선 */}
            <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

            {/* 국회 선택창 */}
            <div className="relative flex items-center">
              <select
                value={currentRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="appearance-none h-9 text-xs font-bold bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg pl-3 pr-8 text-neutral-900 cursor-pointer focus:outline-none transition-colors"
              >
                <option value="대한민국 국회">제22대 국회</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
          </div>

          {/* 2. 오른쪽: 검색창 + [관리자 버튼] (나란히 칼정렬) */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-64 lg:w-80 relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="의원 이름, 정당, 지역구 또는 상임위 검색..."
                className="w-full h-9 text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-black rounded-lg pl-9 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 bg-white pointer-events-none">
                검색
              </span>
            </div>

            {/* ⭐️ 검색창 바로 옆 관리자 버튼 (로그인/회원가입 자리) */}
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="h-9 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title="PECODE 채널 관리자 모드"
              >
                <span className="text-xs">🛡️</span>
                <span>관리자</span>
              </button>
            )}
          </div>

        </div>

        {/* 모바일 화면용 검색창 */}
        <div className="pb-3 md:hidden">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="의원 이름, 정당, 지역구 검색..."
              className="w-full h-9 text-xs bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-4 text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>
    </header>
  );
};