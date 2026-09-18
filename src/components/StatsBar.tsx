import type { RegionHierarchy } from '../types/politician';
import { Landmark, Building2, Home, CheckCircle2, FileSpreadsheet, Eye } from 'lucide-react';

interface StatsBarProps {
  hierarchy: RegionHierarchy;
}

export const StatsBar: React.FC<StatsBarProps> = ({ hierarchy }) => {
  const allMembers = [
    ...hierarchy.nationalAssembly,
    ...hierarchy.metroCouncil,
    ...hierarchy.localCouncil,
  ];

  const totalMembers = allMembers.length;
  const avgAttendance =
    totalMembers > 0
      ? (allMembers.reduce((acc, cur) => acc + cur.attendanceRate, 0) / totalMembers).toFixed(1)
      : '0.0';
  const totalBills = allMembers.reduce((acc, cur) => acc + cur.billsCount, 0);

  return (
    <div className="bg-white border-b border-neutral-200 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Region Title & Mission */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wide text-neutral-400 uppercase mb-1">
            <span>대한민국 선출직 공직자 조직도</span>
            <span>·</span>
            <span>POLITICAL HIERARCHY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            {hierarchy.metroRegion} {hierarchy.localRegion} 정치 조직도
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl">
            국회의원부터 우리 동네 기초의원까지, 세금으로 일하는 모든 선출직 대리인의 의정 활동 데이터를 The Org 구조로 투명하게 연결합니다.
          </p>
        </div>

        {/* Right: Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/60 min-w-[110px]">
            <div className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1">
              <Landmark className="w-3 h-3" /> 국회의원
            </div>
            <div className="font-mono text-xl font-black text-neutral-900 mt-0.5">
              {hierarchy.nationalAssembly.length}
              <span className="text-xs font-normal text-neutral-500 ml-0.5">석</span>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/60 min-w-[110px]">
            <div className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3" /> 광역의원
            </div>
            <div className="font-mono text-xl font-black text-neutral-900 mt-0.5">
              {hierarchy.metroCouncil.length}
              <span className="text-xs font-normal text-neutral-500 ml-0.5">석</span>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/60 min-w-[110px]">
            <div className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1">
              <Home className="w-3 h-3" /> 기초의원
            </div>
            <div className="font-mono text-xl font-black text-neutral-900 mt-0.5">
              {hierarchy.localCouncil.length}
              <span className="text-xs font-normal text-neutral-500 ml-0.5">석</span>
            </div>
          </div>

          <div className="border border-neutral-200 rounded-xl p-3 bg-black text-white min-w-[110px]">
            <div className="text-[10px] text-neutral-300 font-semibold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-neutral-200" /> 평균 출석률
            </div>
            <div className="font-mono text-xl font-black text-white mt-0.5">
              {avgAttendance}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
