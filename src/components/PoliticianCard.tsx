import type { Politician } from '../types/politician';
import { ChevronRight, FileText, CheckCircle2, Coins } from 'lucide-react';

interface PoliticianCardProps {
  politician: Politician;
  isSelected?: boolean;
  onClick: (politician: Politician) => void;
  compact?: boolean;
}

export const PoliticianCard: React.FC<PoliticianCardProps> = ({
  politician,
  isSelected,
  onClick,
  compact = false,
}) => {
  // Level badge style (Monochrome The Org style)
  const getLevelBadge = (level: Politician['level']) => {
    switch (level) {
      case 'NATIONAL':
        return 'bg-black text-white';
      case 'METROPOLITAN':
        return 'bg-neutral-800 text-neutral-100';
      case 'LOCAL':
        return 'bg-neutral-200 text-neutral-800';
    }
  };

  return (
    <div
      onClick={() => onClick(politician)}
      className={`group relative cursor-pointer rounded-xl border bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isSelected
        ? 'border-black ring-2 ring-black ring-offset-2'
        : 'border-neutral-200 hover:border-neutral-400'
        } ${compact ? 'p-3.5 w-64' : 'p-5 w-72'}`}
    >
      {/* Top Bar: Level Badge & Party */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[11px] font-semibold tracking-tight px-2 py-0.5 rounded-full ${getLevelBadge(
            politician.level
          )}`}
        >
          {politician.level === 'NATIONAL'
            ? '국회의원'
            : politician.level === 'METROPOLITAN'
              ? '시의원'
              : '구의원'}
        </span>
        <span className="text-[12px] font-medium text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-md bg-neutral-50">
          {politician.party}
        </span>
      </div>

      {/* Main Profile Info */}
      <div className="flex items-center gap-3.5 mb-4">
        <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border border-neutral-300 bg-neutral-100 flex items-center justify-center">
          {politician.photoUrl ? (
            <img
              src={politician.photoUrl}
              alt={politician.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // 링크가 깨진 사진일 경우에도 이니셜로 대체
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-neutral-400 font-bold text-sm">
              {politician.name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <h3 className="font-bold text-neutral-900 text-base tracking-tight truncate">
              {politician.name}
            </h3>
            {politician.hanjaName && (
              <span className="text-xs text-neutral-400 font-serif">
                ({politician.hanjaName})
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-600 truncate font-medium mt-0.5">
            {politician.district}
          </p>
          <p className="text-[11px] text-neutral-400 truncate">
            {politician.committee}
          </p>
        </div>
      </div>

      {/* 3 Fact Metrics (The Org style Data Grid) */}
      <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-neutral-100 text-center bg-neutral-50/70 rounded-lg p-2">
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 mb-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>출석률</span>
          </div>
          <div className="font-mono text-xs font-bold text-neutral-900">
            {politician.attendanceRate > 0 ? `${politician.attendanceRate}%` : (
              <span className="text-neutral-300 font-sans font-normal">준비중</span>
            )}
          </div>
        </div>
        <div className="border-x border-neutral-200">
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 mb-0.5">
            <FileText className="w-3 h-3" />
            <span>대표발의</span>
          </div>
          <div className="font-mono text-xs font-bold text-neutral-900">
            {politician.billsCount > 0 ? `${politician.billsCount}건` : (
              <span className="text-neutral-300 font-sans font-normal">준비중</span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 mb-0.5">
            <Coins className="w-3 h-3" />
            <span>신고재산</span>
          </div>
          <div className="font-mono text-xs font-bold text-neutral-900">
            {politician.propertyAsset > 0 ? (
              politician.propertyAsset >= 100
                ? `${Math.floor(politician.propertyAsset)}억`
                : `${politician.propertyAsset}억`
            ) : (
              <span className="text-neutral-300 font-sans font-normal">준비중</span>
            )}
          </div>
        </div>
      </div>

      {/* Hover Action prompt */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-black transition-colors pt-1">
        <span>상세 데이터 보기</span>
        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
};
