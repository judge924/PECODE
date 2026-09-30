// src/components/Header.tsx
import React, { useState } from 'react';
import { Search, ChevronDown, User, X } from 'lucide-react';

interface HeaderProps {
  currentTerm: number;
  availableTerms: number[];
  onTermChange: (term: number) => void;
  currentRegion: string;
  onRegionChange: (region: string) => void;
  viewMode?: 'chart' | 'list';
  onViewModeChange?: (mode: 'chart' | 'list') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdminClick?: () => void;
  onFeedbackClick?: () => void;
}

type MenuCategory = '대통령' | '국회' | '법원' | '여론조사' | '유튜브' | '고객지원' | null;

export const Header: React.FC<HeaderProps> = ({
  currentTerm,
  availableTerms,
  onTermChange,
  searchQuery,
  onSearchChange,
  onAdminClick,
  onFeedbackClick,
}) => {
  const [activeMenu, setActiveMenu] = useState<MenuCategory>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 로고 클릭 시 홈 화면 최상단 복귀
  const handleHomeClick = () => {
    setActiveMenu(null);
    onSearchChange('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header
        style={{
          fontFamily: '"SF Pro KR", "SF Pro Text", "Apple SD Gothic Neo", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl backdrop-saturate-180 border-b border-black/[0.08] select-none transition-all duration-200"
        onMouseLeave={() => setActiveMenu(null)}
      >
        {/* ⭐️ [애플 순정 1024px 균등 분배 GNB] */}
        <div className="w-full max-w-[1024px] mx-auto px-4 sm:px-8 h-[44px] flex items-center justify-between text-[12px] tracking-[-0.01em]">

          {/* 1. 피코드 로고 (홈 복귀) */}
          <button
            onClick={handleHomeClick}
            className="font-bold text-[13px] text-neutral-900 tracking-tight hover:opacity-65 transition-opacity cursor-pointer shrink-0"
          >
            피코드
          </button>

          {/* 2. 6대 메뉴바 (애플 공홈 1:1 완벽 균등 간격) */}
          <nav className="hidden md:flex items-center justify-between flex-1 max-w-[620px] mx-6 text-neutral-800/80 font-normal">
            <button
              onMouseEnter={() => setActiveMenu('대통령')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '대통령' ? 'text-black font-semibold' : ''}`}
            >
              대통령
            </button>
            <button
              onMouseEnter={() => setActiveMenu('국회')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '국회' ? 'text-black font-semibold' : ''}`}
            >
              국회
            </button>
            <button
              onMouseEnter={() => setActiveMenu('법원')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '법원' ? 'text-black font-semibold' : ''}`}
            >
              법원
            </button>
            <button
              onMouseEnter={() => setActiveMenu('여론조사')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '여론조사' ? 'text-black font-semibold' : ''}`}
            >
              여론조사
            </button>
            <button
              onMouseEnter={() => setActiveMenu('유튜브')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '유튜브' ? 'text-black font-semibold' : ''}`}
            >
              유튜브
            </button>
            <button
              onMouseEnter={() => setActiveMenu('고객지원')}
              className={`hover:text-black transition-colors cursor-pointer py-2.5 ${activeMenu === '고객지원' ? 'text-black font-semibold' : ''}`}
            >
              고객지원
            </button>
          </nav>

          {/* 3. 우측 액션 (검색 + 계정) */}
          <div className="flex items-center gap-6 text-neutral-800/80 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-black transition-colors cursor-pointer p-1"
              title="통합 검색"
            >
              <Search className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            <button
              onClick={() => alert('계정 및 시민 라운지 기능은 순차 오픈 예정입니다.')}
              className="hover:text-black transition-colors cursor-pointer p-1"
              title="내 계정"
            >
              <User className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* ⭐️ [애플식 검색 오버레이 확장 창] */}
        {isSearchOpen && (
          <div className="border-t border-black/[0.08] bg-white/90 backdrop-blur-xl px-4 py-3 animate-fade-in">
            <div className="max-w-[600px] mx-auto flex items-center gap-2 relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="의원 이름, 정당, 지역구, 상임위원회 검색..."
                className="w-full h-8 pl-9 pr-8 text-[12px] bg-neutral-100/80 hover:bg-neutral-200/50 focus:bg-white border border-transparent focus:border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-all"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onSearchChange('');
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ⭐️ [애플 3번째 스크린샷 100% 동일 폰트/스타일 드로어] */}
        {activeMenu && (
          <div
            className="absolute top-[44px] left-0 w-full bg-white/95 backdrop-blur-2xl backdrop-saturate-180 border-b border-black/[0.08] shadow-2xl transition-all duration-200 pt-8 pb-12 z-50 animate-fade-in"
            onMouseEnter={() => setActiveMenu(activeMenu)}
          >
            <div className="max-w-[1024px] mx-auto px-8">

              {/* 1. [대통령] 드로어 (드롭 TODAY 블랙 복원 & 고위직 재산 랭킹 반영) */}
              {activeMenu === '대통령' && (
                <div className="flex items-start gap-x-14">

                  {/* 1열: 21 (폭 240px) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">21</div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          대통령
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          대통령실
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          국무총리
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          장·차관
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          처·청장
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2열: 히스토리 (폭 150px) */}
                  <div className="w-[150px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">히스토리</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 대통령
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 국무총리
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 3열: 릴리즈 (블랙 TODAY 뱃지 + 고위직 재산 랭킹) */}
                  <div className="w-[180px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">릴리즈</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('오늘자 행정 팩트가 한눈에 요약되는 [드롭] 대시보드로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                        >
                          <span>드롭</span>
                          <span className="text-[9px] font-mono uppercase bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold leading-none">
                            TODAY
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          대통령 일정
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          국무회의 안건
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          정부 입법예고
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          고위직 재산 랭킹
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* 2. [국회] 드로어 (드롭다운 완전 제거 + 애플식 100% 텍스트 정돈) */}
              {activeMenu === '국회' && (
                <div className="flex items-start gap-x-14">

                  {/* 1열: 22 (국회의장 ➔ 국회 ➔ 세력도 ➔ 상임위원회) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">22</div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          국회의장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          국회
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          세력도
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          상임위원회
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2열: 히스토리 (드롭다운 삭제 ➔ 역대 국회의장 최상단 순수 텍스트) */}
                  <div className="w-[150px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">히스토리</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 국회의장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 국회
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 세력도
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 3열: 릴리즈 (블랙 TODAY 뱃지 + 의원 재산 랭킹) */}
                  <div className="w-[180px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">릴리즈</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('오늘자 국회 입법 팩트가 한눈에 요약되는 [드롭] 대시보드로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                        >
                          <span>드롭</span>
                          <span className="text-[9px] font-mono uppercase bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold leading-none">
                            TODAY
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          본회의 의사일정
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          상임위 일정
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('법안의 발의부터 가결까지 실시간 추적하는 [빌트래커]로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          빌트래커
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          의원 재산 랭킹
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* 3. [법원] 드로어 (17 vs 히스토리 vs 릴리즈/드롭) */}
              {activeMenu === '법원' && (
                <div className="flex items-start gap-x-14">

                  {/* 1열: 17 (조희대 제17대 대법원장 기준 사법부 4대 수장 라인업 - 21px 대메뉴) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">17</div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          대법원장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          대법관
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          헌법재판소장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          헌법재판관
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2열: 히스토리 (사법 아카이브 - 12px 소메뉴) */}
                  <div className="w-[150px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">히스토리</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 대법원장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 헌법재판소장
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역사적 판결
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 3열: 릴리즈 (드롭 & 사법 팩트 API - 12px 소메뉴) */}
                  <div className="w-[180px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">릴리즈</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('오늘자 사법부 팩트가 한눈에 요약되는 [드롭] 대시보드로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 text-left"
                        >
                          <span>드롭</span>
                          <span className="text-[9px] font-mono uppercase bg-neutral-900 text-white px-1.5 py-0.5 rounded font-bold leading-none">
                            TODAY
                          </span>
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          재판 캘린더
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          헌재 심판
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('1심·2심·대법원 심급별 진행 현황을 실시간 추적하는 [사건트래커]로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          사건트래커
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          법관 재산 랭킹
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* 4. [여론조사] 드로어 (2026 vs 히스토리 vs 릴리즈 - 미니멀 정예 라인업) */}
              {activeMenu === '여론조사' && (
                <div className="flex items-start gap-x-14">

                  {/* 1열: 2026 (대통령 지지율 ➔ 정당 지지율 ➔ 차기 대권 주자 - 21px 대메뉴) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">2026</div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          대통령 지지율
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          정당 지지율
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          차기 대권 주자
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2열: 히스토리 (역대 대통령·정당 지지율 아카이브 - 12px 소메뉴) */}
                  <div className="w-[150px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">히스토리</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 대통령 지지율
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 정당 지지율
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 3열: 릴리즈 (공식 배포처 원자료 - 12px 소메뉴) */}
                  <div className="w-[200px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">릴리즈</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); alert('중앙선거여론조사심의위원회(여심위) 공식 공인 등록 원자료 목록으로 이동합니다.'); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          여론조사심의위원회 발표자료
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* 5. [유튜브] 드로어 (주별/일별 라이브 리포트 명칭 최신화) */}
              {activeMenu === '유튜브' && (
                <div className="flex items-start gap-x-16">

                  {/* 1열: LIVE (21px 대메뉴) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">LIVE</div>
                    <ul className="space-y-1">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          실시간 라이브
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            alert('새로운 정치 유튜브 채널 건의 창을 엽니다.');
                          }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          채널 등록 건의
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* 2열: 데이터센터 (12px 소메뉴) */}
                  <div className="w-[220px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">데이터센터</div>
                    <ul className="space-y-2 text-[12px] font-semibold text-neutral-800">
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          역대 라이브 최고 시청자
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          월별 라이브 최고 시청자
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          월별 라이브 평균 시청자
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          주별 라이브 리포트
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActiveMenu(null); }}
                          className="hover:text-black transition-colors cursor-pointer text-left block"
                        >
                          일별 라이브 리포트
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

              {/* 6. [고객지원] 드로어 (2~3열 과감한 삭제 ➔ 극강의 미니멀 1열 단독형) */}
              {activeMenu === '고객지원' && (
                <div className="flex items-start">

                  {/* 1열: PECODE (21px 대메뉴 2개 집중) */}
                  <div className="w-[240px] shrink-0">
                    <div className="text-[11px] font-normal text-neutral-500 mb-3 tracking-tight">PECODE</div>
                    <ul className="space-y-1">
                      <li>
                        {onFeedbackClick && (
                          <button
                            onClick={() => {
                              setActiveMenu(null);
                              onFeedbackClick();
                            }}
                            className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                          >
                            데이터 오류 제보
                          </button>
                        )}
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            alert('피코드 공지사항 페이지로 이동합니다.');
                          }}
                          className="text-[21px] font-semibold text-neutral-900 tracking-tight hover:opacity-60 transition-opacity cursor-pointer text-left block"
                        >
                          공지사항
                        </button>
                      </li>
                    </ul>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}
      </header>

      {/* ⭐️ [애플 순정 배경 딤(Dim) 처리] 드로어가 열릴 때 본문 전체를 부드러운 블러로 덮어 깊이감 연출 */}
      {activeMenu && (
        <div
          className="fixed inset-0 top-[44px] z-40 bg-black/15 backdrop-blur-xs transition-opacity duration-300 pointer-events-auto"
          onMouseEnter={() => setActiveMenu(null)}
        />
      )}
    </>
  );
};

export default Header;