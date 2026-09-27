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

export function App() {
  const LIVE_API_URL = "https://raw.githubusercontent.com/judge924/PORG/main/public/live.json";
  const SUGGEST_API_URL = "https://script.google.com/macros/s/AKfycby_3oCwwq2VHCHZ_1N6S9hYF2a0IsSaFeidFdncqwaPY6q8Z4IvRNQvycjaE3q52Zk3/exec";

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

  // 2. 대수 변경 시 해당 JSON 데이터를 비동기로 불러오는 범용 이펙트
  useEffect(() => {
    let isMounted = true;

    async function fetchTerm() {
      if (currentTerm === 22) {
        // 22대는 기본 탑재된 상세 데이터 사용
        setTermPoliticians(null);
        return;
      }

      const data = await loadTermData(currentTerm);
      if (!isMounted) return;

      if (data && Array.isArray(data)) {
        // term-X.json이 의원 배열 형태일 때
        setTermPoliticians(data);
      } else if (data && data.politicians && Array.isArray(data.politicians)) {
        // term-X.json이 { politicians: [...] } 형태일 때 호환
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

  // 3. 현재 화면에 표시할 최종 의원 목록 계산
  const displayedPoliticians = useMemo(() => {
    // 과거 대수 데이터가 로드된 경우 이를 우선 반환
    if (currentTerm !== 22 && termPoliticians !== null) {
      return termPoliticians;
    }

    // 제22대 현행 데이터 (당적 오버라이드 및 지방의회 포함)
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

  // 4. 검색 결과 필터링 (현재 선택된 대수의 전체 의원 대상)
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
    <div className="min-h-screen bg-[#fcfcfc] text-neutral-900 flex flex-col font-sans selection:bg-black selection:text-white relative">
      {/* 좌측 라이브 날개 */}
      <LiveSidebar camp="left" apiUrl={LIVE_API_URL} suggestApiUrl={SUGGEST_API_URL} />

      {/* 우측 라이브 날개 */}
      <LiveSidebar camp="right" apiUrl={LIVE_API_URL} suggestApiUrl={SUGGEST_API_URL} />

      {/* 상단 고정 헤더 & 블랙티켓 */}
      <div className="sticky top-0 z-30 bg-[#fcfcfc]">
        <Header
          currentTerm={currentTerm}
          availableTerms={availableTerms}
          onTermChange={(term) => {
            setCurrentTerm(term);
            setSearchQuery('');
          }}
          currentRegion={currentRegion}
          onRegionChange={(reg) => {
            setCurrentRegion(reg);
            setSearchQuery('');
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdminClick={() => setIsAdminOpen(true)}
          onFeedbackClick={() => setIsFeedbackOpen(true)}
        />
        <BlackTicketGauge politicians={displayedPoliticians} />
      </div>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto pb-16">
        {searchResults !== null ? (
          <div className="px-4 py-8">
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
        ) : (
          <div className="py-4">
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

      <footer className="border-t border-neutral-200 bg-white py-12 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-black text-neutral-900 text-base tracking-tight mb-1">
              PECODE KOREA
            </div>
            <p className="max-w-md text-neutral-500 leading-relaxed text-[11px]">
              복잡한 정치 난제를 명쾌하게 풀어내는 데이터 테크 서비스<br />
              난해하고 어두운 정치(Politics)를 시각화하여 명쾌하게 해독(Decode)합니다.
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
          <div>© 2026 PECODE · ALL RIGHTS RESERVED</div>
          <div>BUILT WITH THE ORG DESIGN SYSTEM FOR KOREAN CITIZENS</div>
        </div>
      </footer>
    </div>
  );
}

export default App;