import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentRegion: string;
  onRegionChange: (region: string) => void;
  viewMode?: 'chart' | 'list';
  onViewModeChange?: (mode: 'chart' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdminClick?: () => void;
  onFeedbackClick?: () => void;
}

// -------------------------------------------------------------
// [대한민국 국기법 공식 표준] 정방향 100% 순수 SVG 태극기
// -------------------------------------------------------------
const Taegeukgi: React.FC<{ className?: string }> = ({ className = 'w-10 h-6.5' }) => (
  <svg
    viewBox="-72 -48 144 96"
    className={`${className} select-none shrink-0 block`}
  >
    <rect x="-72" y="-48" width="144" height="96" fill="#ffffff" rx="2" />
    <g stroke="#000000" strokeWidth="4">
      <path
        transform="rotate(33.69006752598)"
        d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"
      />
      <path
        transform="rotate(-33.69006752598)"
        d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"
      />
    </g>
    <g transform="rotate(33.69006752598)">
      <path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0" />
      <path fill="#0047a0" d="M0 0a12 12 0 1124 0 24 24 0 11-48 0 12 12 0 1024 0" />
    </g>
  </svg>
);

// -------------------------------------------------------------
// 대한민국 14대 대통령 아카이브 데이터
// -------------------------------------------------------------
interface PresidentData {
  id: string;
  termTitle: string; // 대수
  name: string;      // 이름
  years: string;     // 재임 기간
  image: string;     // 얼굴 사진 (public/images/presidents/...)
  signature: string; // 친필 서명 (public/images/presidents/..._sig.png)
}

const HISTORICAL_PRESIDENTS: PresidentData[] = [
  { id: 'rhee', termTitle: '제1·2·3대', name: '이승만', years: '1948~1960', image: '/images/presidents/rhee.png', signature: '/images/presidents/rhee_sig.png' },
  { id: 'yun', termTitle: '제4대', name: '윤보선', years: '1960~1962', image: '/images/presidents/yun.png', signature: '/images/presidents/yun_sig.png' },
  { id: 'park', termTitle: '제5~9대', name: '박정희', years: '1963~1979', image: '/images/presidents/park.png', signature: '/images/presidents/park_sig.png' },
  { id: 'choi', termTitle: '제10대', name: '최규하', years: '1979~1980', image: '/images/presidents/choi.png', signature: '/images/presidents/choi_sig.png' },
  { id: 'chun', termTitle: '제11·12대', name: '전두환', years: '1980~1988', image: '/images/presidents/chun.png', signature: '/images/presidents/chun_sig.png' },
  { id: 'roh_tw', termTitle: '제13대', name: '노태우', years: '1988~1993', image: '/images/presidents/roh_tw.png', signature: '/images/presidents/roh_tw_sig.png' },
  { id: 'kys', termTitle: '제14대', name: '김영삼', years: '1993~1998', image: '/images/presidents/kys.png', signature: '/images/presidents/kys_sig.png' },
  { id: 'kdj', termTitle: '제15대', name: '김대중', years: '1998~2003', image: '/images/presidents/kdj.png', signature: '/images/presidents/kdj_sig.png' },
  { id: 'nmh', termTitle: '제16대', name: '노무현', years: '2003~2008', image: '/images/presidents/nmh.png', signature: '/images/presidents/nmh_sig.png' },
  { id: 'lmb', termTitle: '제17대', name: '이명박', years: '2008~2013', image: '/images/presidents/lmb.png', signature: '/images/presidents/lmb_sig.png' },
  { id: 'pgh', termTitle: '제18대', name: '박근혜', years: '2013~2017', image: '/images/presidents/pgh.png', signature: '/images/presidents/pgh_sig.png' },
  { id: 'mji', termTitle: '제19대', name: '문재인', years: '2017~2022', image: '/images/presidents/mji.png', signature: '/images/presidents/mji_sig.png' },
  { id: 'ysy', termTitle: '제20대', name: '윤석열', years: '2022~', image: '/images/presidents/ysy.png', signature: '/images/presidents/ysy_sig.png' },
  { id: 'ljm', termTitle: '제21대', name: '이재명', years: '재임 중', image: '/images/presidents/ljm.png', signature: '/images/presidents/ljm_sig.png' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  onRegionChange,
  searchQuery,
  onSearchChange,
  onAdminClick,
  onFeedbackClick,
}) => {
  const [activePres, setActivePres] = useState<PresidentData | null>(null);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-[92px] gap-2 lg:gap-4">

          {/* 1. [왼쪽 영역] 대형 태극기(99px x 66px) ➔ 피코드 KOREA ➔ 국회 선택창 (좌측 고정) */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            {/* 대형 태극기 */}
            <div className="flex items-center">
              <Taegeukgi className="w-[99px] h-[66px] rounded-[3px] select-none block shrink-0" />
            </div>

            {/* 피코드 KOREA 브랜드 로고 */}
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

            {/* 제22대 국회 선택창 */}
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

          {/* ⭐️ 2. [가운데 영역] 국회 선택창 우측 ~ 검색창 좌측 공간을 100% 꽉 채우는 14명 대통령 균등 배분정렬(justify-between)! */}
          <div className="hidden xl:flex flex-1 items-center justify-between px-2 2xl:px-6 z-20 min-w-0">
            {HISTORICAL_PRESIDENTS.map((pres) => {
              const isHovered = activePres?.id === pres.id;

              return (
                <div
                  key={pres.id}
                  className="relative group cursor-pointer flex flex-col items-center shrink-0"
                  onMouseEnter={() => setActivePres(pres)}
                  onMouseLeave={() => setActivePres(null)}
                >
                  {/* [1단: 역대 대통령 원형 얼굴 아바타 (42px 동일 규격)] */}
                  <div className="w-[42px] h-[42px] overflow-hidden bg-white shadow-xs rounded-full transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-md">
                    <img
                      src={pres.image}
                      alt={pres.name}
                      loading="eager"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        transform: 'translateZ(0)', // 고화질 축소 뭉개짐 방지 GPU 가속
                        backfaceVisibility: 'hidden',
                      }}
                      className="w-full h-full object-cover object-top filter contrast-[1.03]"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* [2단: 직책 대신 들어가는 동일 규격 친필 서명(사인) 이미지] */}
                  <div className="w-[48px] h-[20px] flex items-center justify-center mt-1 overflow-hidden">
                    <img
                      src={pres.signature}
                      alt={`${pres.name} 서명`}
                      loading="eager"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        transform: 'translateZ(0)', // 서명 선명도 사수 GPU 가속
                        backfaceVisibility: 'hidden',
                      }}
                      className="max-w-full max-h-full object-contain filter contrast-125"
                      onError={(e) => {
                        // 서명 이미지 준비 전일 때 대통령 이름으로 깔끔하게 대체 표출
                        const parent = (e.target as HTMLElement).parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-[9px] font-bold text-neutral-800 tracking-tight leading-none">${pres.name}</span>`;
                        }
                      }}
                    />
                  </div>

                  {/* 📜 [호버 카드] 마우스 올리면 뜨는 대통령 재임 정보 */}
                  {isHovered && (
                    <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-neutral-900 rounded-lg shadow-xl px-3 py-2 z-50 animate-fade-in pointer-events-none whitespace-nowrap text-center">
                      <div className="text-[10px] font-mono text-neutral-400 font-bold leading-none">
                        {pres.termTitle} 대한민국 대통령
                      </div>
                      <div className="text-xs font-bold text-neutral-950 mt-1 leading-none">
                        {pres.name}
                      </div>
                      <div className="text-[9px] font-mono text-neutral-500 mt-1 leading-none">
                        재임: {pres.years}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. [오른쪽 영역] 검색창 + [오류 제보] + [관리자] (우측 고정) */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <div className="w-52 lg:w-64 relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="의원 이름, 정당, 지역구 또는 상임위..."
                className="w-full h-9 text-xs bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-black rounded-lg pl-9 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5 bg-white pointer-events-none">
                검색
              </span>
            </div>

            {onFeedbackClick && (
              <button
                onClick={onFeedbackClick}
                className="h-9 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                title="데이터 오류 수정 의견 보내기"
              >
                <span className="text-xs">✍️</span>
                <span>오류 제보</span>
              </button>
            )}

            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="h-9 px-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                title="PECODE 채널 관리자 모드"
              >
                <span className="text-xs">🛡️</span>
                <span>관리자</span>
              </button>
            )}
          </div>

        </div>

        {/* 모바일 검색창 */}
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

export default Header;