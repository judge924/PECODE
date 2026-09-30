import { useState, useMemo, useEffect } from 'react';
import type { Politician } from './types/politician';
import { REGIONS_DATA, ALL_POLITICIANS } from './data/politicians';
import { getAvailableTerms, loadTermData } from './utils/termLoader';
import { Header } from './components/Header';
import { BlackTicketGauge } from './components/BlackTicketGauge';
import { LiveSidebar } from './components/LiveSidebar';
import { OrgChart } from './components/OrgChart';
import { ListView } from './components/ListView';
import { HomeOrgView } from './components/HomeOrgView';
import { PoliticianDetailDrawer } from './components/PoliticianDetailDrawer';
import { AdminModal } from './components/AdminModal';
import { FeedbackModal } from './components/FeedbackModal';
import { TensorSphereHero } from './components/TensorSphereHero';

export function App() {
  const LIVE_API_URL = "https://raw.githubusercontent.com/judge924/PORG/main/public/live.json";
  const SUGGEST_API_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

  // ⭐️ 뷰포트 상태: 'sphere'(시그니처 3D 텐서 구체 단독 화면) vs 'legacy'(기존 조직도 화면)
  const [currentScene, setCurrentScene] = useState<'sphere' | 'legacy'>('sphere');

  // 1. 국회 타임머신 상태 관리 (기본값: 22대)
  const availableTerms = useMemo(() => getAvailableTerms(), []);
  const [currentTerm, setCurrentTerm] = useState<number>(22);
  const [termPoliticians, setTermPoliticians] = useState<Politician[] | null>(null);

  const [currentRegion, setCurrentRegion] = useState<string>('대한민국 국회');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);

  // 모달 상태
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  // 2. 대수 변경 시 비동기 로더
  useEffect(() => {
    let isMounted = true;

    async function fetchTerm() {
      if (currentTerm === 22) {
        setTermPoliticians(null);
        return;
      }

      const data = await loadTermData(currentTerm);
      if (!isMounted) return;

      if (data && Array.isArray(data)) {
        setTermPoliticians(data);
      } else if (data && data.politicians && Array.isArray(data.politicians)) {
        setTermPoliticians(data.politicians);
      } else {
        setTermPoliticians([]);
      }
    }

    fetchTerm();

    return () => {
      isMounted = false;
    };
  }, [currentTerm]);

  const currentHierarchy = REGIONS_DATA[currentRegion] || REGIONS_DATA['대한민국 국회'];

  // 3. 현재 표시할 의원 목록
  const displayedPoliticians = useMemo(() => {
    if (currentTerm !== 22 && termPoliticians !== null) {
      return termPoliticians;
    }

    let overrides: Record<string, string> = {
      '용혜인': '기본소득당',
      '한창민': '사회민주당',
      '손솔': '진보당',
      '전종덕': '진보당',
      '정혜경': '진보당',
      '윤종오': '진보당'
    };
    try {
      const saved = localStorage.getItem('pecode_party_overrides');
      if (saved) overrides = { ...overrides, ...JSON.parse(saved) };
    } catch (e) { }

    const all = [
      ...currentHierarchy.nationalAssembly,
      ...currentHierarchy.metroCouncil,
      ...currentHierarchy.localCouncil,
    ];

    return all.map((p): Politician => {
      if (overrides[p.name]) {
        return { ...p, party: overrides[p.name] as any };
      }
      return p;
    });
  }, [currentTerm, termPoliticians, currentHierarchy]);

  // 4. 검색 필터링
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const sourcePool = currentTerm === 22 ? ALL_POLITICIANS : displayedPoliticians;

    return sourcePool.filter((p) => {
      return (
        p.name?.toLowerCase().includes(query) ||
        p.party?.toLowerCase().includes(query) ||
        p.district?.toLowerCase().includes(query) ||
        p.committee?.toLowerCase().includes(query) ||
        p.localRegion?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, currentTerm, displayedPoliticians]);

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-900 flex flex-col font-sans selection:bg-white selection:text-black relative overflow-x-hidden">
      {/* ⭐️ 홈 3D 구체 모드일 때는 라이브바를 완전히 숨김 (legacy 모드일 때만 노출) */}
      {currentScene === 'legacy' && (
        <>
          <LiveSidebar camp="left" apiUrl={LIVE_API_URL} suggestApiUrl={SUGGEST_API_URL} />
          <LiveSidebar camp="right" apiUrl={LIVE_API_URL} suggestApiUrl={SUGGEST_API_URL} />
        </>
      )}

      {/* 상단 고정 44px 애플 GNB 헤더 */}
      <div className="sticky top-0 z-30">
        <Header
          currentTerm={currentTerm}
          availableTerms={availableTerms}
          onTermChange={(term) => {
            setCurrentTerm(term);
            setSearchQuery('');
            setCurrentScene('legacy');
          }}
          currentRegion={currentRegion}
          onRegionChange={(reg) => {
            setCurrentRegion(reg);
            setSearchQuery('');
            setCurrentScene('legacy');
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim()) setCurrentScene('legacy');
          }}
          onAdminClick={() => setIsAdminOpen(true)}
          onFeedbackClick={() => setIsFeedbackOpen(true)}
        />
        {/* 기존 국회 조직도 모드일 때만 블랙티켓 게이지 노출 */}
        {currentScene === 'legacy' && (
          <BlackTicketGauge politicians={displayedPoliticians} />
        )}
      </div>

      {/* 메인 뷰포트 영역 */}
      <main className="flex-1 w-full">
        {searchResults !== null ? (
          /* [검색 상태] */
          <div className="max-w-[1800px] mx-auto px-4 py-8 bg-[#fcfcfc] min-h-[calc(100vh-44px)]">
            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">
                  ‘{searchQuery}’ 검색 결과 (제{currentTerm}대)
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  총 {searchResults.length}명의 의원이 검색되었습니다.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 cursor-pointer"
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
        ) : currentScene === 'sphere' ? (
          /* ⭐️ [기본 홈] Austensor 스타일 인터랙티브 3D 텐서 파티클 구체 단독 무대 */
          <TensorSphereHero />
        ) : (
          /* [기존 레거시 국회/지방의회 뷰포트] */
          <div className="max-w-[1800px] mx-auto py-8 bg-[#fcfcfc]">
            {viewMode === 'chart' && currentTerm === 22 ? (
              <OrgChart
                hierarchy={currentHierarchy}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={setSelectedPolitician}
              />
            ) : (
              <HomeOrgView
                politicians={displayedPoliticians}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={setSelectedPolitician}
              />
            )}
          </div>
        )}
      </main>

      <PoliticianDetailDrawer
        politician={selectedPolitician}
        onClose={() => setSelectedPolitician(null)}
      />

      {/* 관리자 모달 */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 오류 수정 제보 모달 */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        suggestApiUrl={SUGGEST_API_URL}
      />
    </div>
  );
}

export default App;