import { useState, useMemo } from 'react';
import type { Politician } from './types/politician';
import { REGIONS_DATA, ALL_POLITICIANS } from './data/politicians';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { OrgChart } from './components/OrgChart';
import { ListView } from './components/ListView';
import { PoliticianDetailDrawer } from './components/PoliticianDetailDrawer';

export function App() {
  const [currentRegion, setCurrentRegion] = useState<string>('대한민국 국회');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);

  // Current Hierarchy
  const currentHierarchy = REGIONS_DATA[currentRegion] || REGIONS_DATA['대한민국 국회'];

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    return ALL_POLITICIANS.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.party.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.committee.toLowerCase().includes(query) ||
        p.localRegion.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const displayedPoliticians = useMemo(() => {
    return [
      ...currentHierarchy.nationalAssembly,
      ...currentHierarchy.metroCouncil,
      ...currentHierarchy.localCouncil,
    ];
  }, [currentHierarchy]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-neutral-900 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* 1. The Org Header */}
      <Header
        currentRegion={currentRegion}
        onRegionChange={(reg) => {
          setCurrentRegion(reg);
          setSearchQuery('');
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Stats Bar */}
      <StatsBar hierarchy={currentHierarchy} />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-16">
        {/* Search Results Notice (if active) */}
        {searchResults !== null ? (
          <div className="px-4 py-8">
            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  ‘{searchQuery}’ 검색 결과
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  총 {searchResults.length}명의 선출직 의원이 검색되었습니다.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700"
              >
                검색 초기화
              </button>
            </div>
            <ListView
              politicians={searchResults}
              selectedPolitician={selectedPolitician}
              onSelectPolitician={setSelectedPolitician}
            />
          </div>
        ) : (
          /* Normal View: Org Chart or Directory */
          <div className="py-4">
            {viewMode === 'chart' ? (
              <OrgChart
                hierarchy={currentHierarchy}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={setSelectedPolitician}
              />
            ) : (
              <ListView
                politicians={displayedPoliticians}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={setSelectedPolitician}
              />
            )}
          </div>
        )}
      </main>

      {/* 4. Slide-over Profile Drawer */}
      <PoliticianDetailDrawer
        politician={selectedPolitician}
        onClose={() => setSelectedPolitician(null)}
      />

      {/* 5. Minimal The Org Footer */}
      <footer className="border-t border-neutral-200 bg-white py-12 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-black text-neutral-900 text-base tracking-tight mb-1">
              PORG KOREA
            </div>
            <p className="max-w-md text-neutral-500 leading-relaxed text-[11px]">
              시민의 알 권리와 풀뿌리 민주주의의 정보 비대칭 해소를 위해 대한민국 모든 선출직 공직자의 공개 의정 데이터를 객관적으로 제공합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] text-neutral-600">
            <div className="space-y-1">
              <div className="font-bold text-neutral-900">데이터 출처</div>
              <div>대한민국 국회 열린국회정보 API</div>
              <div>중앙선거관리위원회 선거통계</div>
              <div>지방의회 의정정보 공유시스템</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-neutral-900">원칙</div>
              <div>정치적 중립 및 주관적 평점 배제</div>
              <div>100% 검증 가능한 공공 팩트</div>
              <div>풀뿌리 기초의회 데이터 전면 개방</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 font-mono">
          <div>© 2026 PORG · ALL RIGHTS RESERVED</div>
          <div>BUILT WITH THE ORG DESIGN SYSTEM FOR KOREAN CITIZENS</div>
        </div>
      </footer>
    </div>
  );
}

export default App;

