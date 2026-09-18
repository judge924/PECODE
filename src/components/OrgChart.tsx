import { useState } from 'react';
import type { RegionHierarchy, Politician } from '../types/politician';
import { PoliticianCard } from './PoliticianCard';
import {
  MapPin,
  Landmark,
  Building2,
  Home,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

interface OrgChartProps {
  hierarchy: RegionHierarchy;
  selectedPolitician: Politician | null;
  onSelectPolitician: (politician: Politician) => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({
  hierarchy,
  selectedPolitician,
  onSelectPolitician,
}) => {
  const [collapsed, setCollapsed] = useState<{
    national: boolean;
    metro: boolean;
    local: boolean;
  }>({
    national: false,
    metro: false,
    local: false,
  });

  const toggleSection = (key: 'national' | 'metro' | 'local') => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalMembers =
    hierarchy.nationalAssembly.length +
    hierarchy.metroCouncil.length +
    hierarchy.localCouncil.length;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar py-8 px-4 flex flex-col items-center min-w-[800px]">
      {/* 1. Root Node: Region Headquarters */}
      <div className="flex flex-col items-center">
        <div className="relative group rounded-2xl border-2 border-black bg-white p-5 shadow-md flex items-center gap-4 w-96 transition-all duration-200 hover:shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                PORG · DISTRICT ORG
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                총 {totalMembers}명의 대리인
              </span>
            </div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight mt-0.5">
              {hierarchy.metroRegion} {hierarchy.localRegion}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              중앙 국회부터 동네 기초의회까지의 의정 계층도
            </p>
          </div>
        </div>

        {/* Vertical Connection Line */}
        <div className="w-0.5 h-10 bg-neutral-300" />
      </div>

      {/* 2. Level 1: National Assembly (국회의원) */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-4xl flex items-center justify-between border-b border-neutral-300 pb-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-black text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                대한민국 국회 (중앙정치)
                <span className="text-xs font-mono font-normal text-neutral-500">
                  {hierarchy.nationalAssembly.length}석
                </span>
              </h3>
              <p className="text-[11px] text-neutral-500">
                국가 법률 제·개정 및 650조 원 규모 국가 예산 심의·확정
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleSection('national')}
            className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 p-1 rounded hover:bg-neutral-100"
          >
            {collapsed.national ? (
              <>
                <span>펼치기</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>접기</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {!collapsed.national && (
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4 animate-in fade-in duration-200">
            {hierarchy.nationalAssembly.map((member) => (
              <PoliticianCard
                key={member.id}
                politician={member}
                isSelected={selectedPolitician?.id === member.id}
                onClick={onSelectPolitician}
              />
            ))}
          </div>
        )}

        {/* Vertical Connector between levels if metro council exists */}
        {hierarchy.metroCouncil.length > 0 && (
          <div className="w-0.5 h-10 bg-neutral-300" />
        )}
      </div>

      {/* 3. Level 2: Metropolitan Council (광역의회 / 서울시의회) */}
      {hierarchy.metroCouncil.length > 0 && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center justify-between border-b border-neutral-300 pb-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-neutral-800 text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  {hierarchy.metroRegion}의회 (광역의정)
                  <span className="text-xs font-mono font-normal text-neutral-500">
                    {hierarchy.metroCouncil.length}석
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {hierarchy.metroRegion} 전역 광역교통, 도시계획, 광역행정 조례 및 시 예산 심의
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSection('metro')}
              className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 p-1 rounded hover:bg-neutral-100"
            >
              {collapsed.metro ? (
                <>
                  <span>펼치기</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>접기</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {!collapsed.metro && (
            <div className="flex flex-wrap items-center justify-center gap-6 mb-4 animate-in fade-in duration-200">
              {hierarchy.metroCouncil.map((member) => (
                <PoliticianCard
                  key={member.id}
                  politician={member}
                  isSelected={selectedPolitician?.id === member.id}
                  onClick={onSelectPolitician}
                />
              ))}
            </div>
          )}

          {/* Vertical Connector between levels if local council exists */}
          {hierarchy.localCouncil.length > 0 && (
            <div className="w-0.5 h-10 bg-neutral-300" />
          )}
        </div>
      )}

      {/* 4. Level 3: Local Council (기초의회) */}
      {hierarchy.localCouncil.length > 0 && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center justify-between border-b border-neutral-300 pb-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-neutral-600 text-white">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  {hierarchy.localRegion}의회 (기초의정 / 풀뿌리)
                  <span className="text-xs font-mono font-normal text-neutral-500">
                    {hierarchy.localCouncil.length}석
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-500">
                  우리 동네 골목길, 쓰레기 수거, 공영주차장, 주민 복지 등 밀착 생활자치
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleSection('local')}
              className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 p-1 rounded hover:bg-neutral-100"
            >
              {collapsed.local ? (
                <>
                  <span>펼치기</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>접기</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {!collapsed.local && (
            <div className="flex flex-wrap items-center justify-center gap-6 animate-in fade-in duration-200">
              {hierarchy.localCouncil.map((member) => (
                <PoliticianCard
                  key={member.id}
                  politician={member}
                  isSelected={selectedPolitician?.id === member.id}
                  onClick={onSelectPolitician}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
