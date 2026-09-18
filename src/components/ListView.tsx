import { useState, useMemo } from 'react';
import type { Politician } from '../types/politician';
import { PoliticianCard } from './PoliticianCard';
import { Filter, ArrowUpDown } from 'lucide-react';

interface ListViewProps {
  politicians: Politician[];
  selectedPolitician: Politician | null;
  onSelectPolitician: (politician: Politician) => void;
}

// 진보·범야권 정당 목록
const LEFT_PARTIES = ['더불어민주당', '조국혁신당', '진보당', '기본소득당', '사회민주당'];
// 보수·여당 정당 목록
const RIGHT_PARTIES = ['국민의힘', '개혁신당'];

export const ListView: React.FC<ListViewProps> = ({
  politicians,
  selectedPolitician,
  onSelectPolitician,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'attendance' | 'bills' | 'asset'>('attendance');

  // 필터링 및 정렬 처리
  const filtered = useMemo(() => {
    return politicians
      .filter((p) => {
        if (selectedLevel !== 'ALL' && p.level !== selectedLevel) return false;
        if (selectedParty !== 'ALL' && p.party !== selectedParty) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
        if (sortBy === 'bills') return b.billsCount - a.billsCount;
        if (sortBy === 'asset') return b.propertyAsset - a.propertyAsset;
        return 0;
      });
  }, [politicians, selectedLevel, selectedParty, sortBy]);

  // 좌파 / 우파 / 무소속 분리
  const leftWingPoliticians = useMemo(() => {
    return filtered.filter((p) => LEFT_PARTIES.includes(p.party));
  }, [filtered]);

  const rightWingPoliticians = useMemo(() => {
    return filtered.filter((p) => RIGHT_PARTIES.includes(p.party));
  }, [filtered]);

  const independentPoliticians = useMemo(() => {
    return filtered.filter(
      (p) => !LEFT_PARTIES.includes(p.party) && !RIGHT_PARTIES.includes(p.party)
    );
  }, [filtered]);

  const parties = Array.from(new Set(politicians.map((p) => p.party)));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Control Bar: Filters & Sorting */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Level Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-neutral-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> 의회 분류:
          </span>
          {[
            { id: 'ALL', label: '전체' },
            { id: 'NATIONAL', label: '국회의원' },
            { id: 'METROPOLITAN', label: '시의원' },
            { id: 'LOCAL', label: '구의원' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedLevel(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${selectedLevel === item.id
                ? 'bg-black text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Party Filter & Sorter */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="ALL">모든 정당</option>
            {parties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="attendance">출석률 높은순</option>
              <option value="bills">대표발의 많은순</option>
              <option value="asset">신고재산 많은순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid count summary */}
      <div className="mb-4 flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>
          총 <strong className="text-black font-mono">{filtered.length}</strong>명의 의원이 검색되었습니다.
        </span>
      </div>

      {/* 1. Split View: Left Wing vs Right Wing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        {/* Left Column: 진보·좌파 진영 */}
        <div className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 px-1">
            <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              진보·범야권 ({leftWingPoliticians.length}명)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            {leftWingPoliticians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                isSelected={selectedPolitician?.id === politician.id}
                onClick={onSelectPolitician}
              />
            ))}
            {leftWingPoliticians.length === 0 && (
              <div className="col-span-2 py-12 text-center text-xs text-neutral-400">
                해당 조건의 의원이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 보수·우파 진영 */}
        <div className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 px-1">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              보수·여당 ({rightWingPoliticians.length}명)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            {rightWingPoliticians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                isSelected={selectedPolitician?.id === politician.id}
                onClick={onSelectPolitician}
              />
            ))}
            {rightWingPoliticians.length === 0 && (
              <div className="col-span-2 py-12 text-center text-xs text-neutral-400">
                해당 조건의 의원이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Bottom Section: Independent / Others (무소속 및 기타) */}
      {independentPoliticians.length > 0 && (
        <div className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4 px-1">
            <h3 className="text-sm font-bold text-neutral-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400"></span>
              무소속 및 기타 ({independentPoliticians.length}명)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {independentPoliticians.map((politician) => (
              <PoliticianCard
                key={politician.id}
                politician={politician}
                isSelected={selectedPolitician?.id === politician.id}
                onClick={onSelectPolitician}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};