import { useState, useEffect } from 'react';
import type { Politician } from '../types/politician';
import {
  X,
  Building,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Award,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface PoliticianDetailDrawerProps {
  politician: Politician | null;
  onClose: () => void;
}

export const PoliticianDetailDrawer: React.FC<PoliticianDetailDrawerProps> = ({
  politician,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'bills' | 'pledges' | 'career'>('facts');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!politician) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-neutral-200">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-500 uppercase">
              PECODE / PROFILE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Profile Section */}
          <div className="p-6 pb-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-start gap-5">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-neutral-300 bg-neutral-200 shrink-0 shadow-sm flex items-center justify-center">
                {politician.photoUrl ? (
                  <img
                    src={politician.photoUrl}
                    alt={politician.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-neutral-400 font-bold text-3xl">
                    {politician.name.slice(0, 1)}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black text-white">
                    {politician.levelLabel}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md border border-neutral-300 bg-white text-neutral-700">
                    {politician.party}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {politician.timesElected}선 의원
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                    {politician.name}
                  </h2>
                  {politician.hanjaName && (
                    <span className="text-sm font-serif text-neutral-400">
                      ({politician.hanjaName})
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-neutral-600">
                  {politician.district} · {politician.roleTitle}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  소속 상임위: {politician.committee}
                </p>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                <div className="text-[11px] text-neutral-400 font-medium">본회의 출석률</div>
                <div className="font-mono text-xl font-bold text-neutral-900 mt-0.5">
                  {politician.attendanceRate > 0 ? `${politician.attendanceRate}%` : (
                    <span className="text-neutral-300 font-sans text-sm font-normal">준비중</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">회기 공식 출석</div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                <div className="text-[11px] text-neutral-400 font-medium">대표발의 법안</div>
                <div className="font-mono text-xl font-bold text-neutral-900 mt-0.5">
                  {politician.billsCount > 0 ? `${politician.billsCount}건` : (
                    <span className="text-neutral-300 font-sans text-sm font-normal">준비중</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">제22대/현 임기 기준</div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                <div className="text-[11px] text-neutral-400 font-medium">공개 신고재산</div>
                <div className="font-mono text-xl font-bold text-neutral-900 mt-0.5">
                  {politician.propertyAsset > 0 ? `${politician.propertyAsset}억` : (
                    <span className="text-neutral-300 font-sans text-sm font-normal">준비중</span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">정부공직자윤리위 공시</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 px-6 sticky top-0 bg-white z-10">
            <button
              onClick={() => setActiveTab('facts')}
              className={`py-3.5 px-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'facts'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
            >
              의정 활동 지표
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`py-3.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'bills'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
            >
              대표발의 법안
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 font-mono">
                {politician.bills.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pledges')}
              className={`py-3.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'pledges'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
            >
              핵심 공약
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 font-mono">
                {politician.pledges.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`py-3.5 px-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === 'career'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
            >
              약력 및 연락처
            </button>
          </div>

          {/* Tab Content Panes */}
          <div className="p-6">
            {/* Tab 1: Facts & Assessment */}
            {activeTab === 'facts' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> 객관적 의정 활동 데이터
                  </h4>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">본회의 출석률</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {politician.attendanceRate > 0
                          ? `${politician.attendanceRate}%`
                          : <span className="text-neutral-300 font-sans font-normal">준비중</span>}
                      </span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">대표 발의 법률안</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {politician.billsCount > 0
                          ? `총 ${politician.billsCount}건`
                          : <span className="text-neutral-300 font-sans font-normal">준비중</span>}
                      </span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">소속 상임위원회</span>
                      <span className="font-medium text-neutral-900">
                        {politician.committee}
                      </span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between text-xs">
                      <span className="text-neutral-500 font-medium">재산 신고액</span>
                      <span className="font-mono font-bold text-neutral-900">
                        {politician.propertyAsset > 0
                          ? `${politician.propertyAsset}억 원 (공시 기준)`
                          : <span className="text-neutral-300 font-sans font-normal">준비중</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-neutral-700" />
                    객관성 검증 원칙
                  </div>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">
                    본 데이터는 대한민국 국회 열린국회정보 및 중앙선거관리위원회, 지방의회 공식 회의록 데이터를 기반으로 산출되었습니다. 주관적인 평점이나 사견을 배제하고 투명한 공공 팩트만을 제공합니다.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Bills */}
            {activeTab === 'bills' && (
              <div className="space-y-4">
                <div className="text-xs text-neutral-500">
                  의원이 직접 대표발의한 최근 주요 법안 내역입니다.
                </div>
                {politician.bills.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-400">
                    등록된 대표발의 법안 내역이 없습니다.
                  </div>
                ) : (
                  politician.bills.map((bill) => (
                    <div
                      key={bill.id}
                      className="border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-mono text-neutral-400">
                          {bill.proposeDate}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${bill.status === '원안가결' || bill.status === '수정가결'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-700'
                            }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-neutral-900 mb-2 leading-snug">
                        {bill.title}
                      </h5>
                      <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                        {bill.summary}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Pledges */}
            {activeTab === 'pledges' && (
              <div className="space-y-4">
                <div className="text-xs text-neutral-500">
                  선거 공보물에 명시된 주요 지역구 공약 및 현재 진행 상태입니다.
                </div>
                {politician.pledges.length === 0 ? (
                  <div className="text-center py-10 text-xs text-neutral-400">
                    등록된 공약 데이터가 없습니다.
                  </div>
                ) : (
                  politician.pledges.map((pledge) => (
                    <div
                      key={pledge.id}
                      className="border border-neutral-200 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-medium text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded">
                          {pledge.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {pledge.progress === '완료' && (
                            <span className="flex items-center gap-1 text-black font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" /> 완료
                            </span>
                          )}
                          {pledge.progress === '추진중' && (
                            <span className="flex items-center gap-1 text-neutral-600 font-mono">
                              <Clock className="w-3.5 h-3.5" /> 추진중
                            </span>
                          )}
                          {pledge.progress === '보류/검토' && (
                            <span className="flex items-center gap-1 text-neutral-400 font-mono">
                              <AlertCircle className="w-3.5 h-3.5" /> 보류/검토
                            </span>
                          )}
                        </div>
                      </div>
                      <h5 className="font-bold text-sm text-neutral-900 mb-1">
                        {pledge.title}
                      </h5>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {pledge.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Career & Contact */}
            {activeTab === 'career' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> 주요 경력 사항
                  </h4>
                  <ul className="space-y-2 border-l-2 border-neutral-200 pl-4 ml-1">
                    {politician.career.map((item, idx) => (
                      <li key={idx} className="relative text-xs text-neutral-700">
                        <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-neutral-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                    <Building className="w-4 h-4" /> 공식 연락처 및 의원실
                  </h4>
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 text-xs">
                    {politician.contact.office && (
                      <div className="p-3 flex items-center gap-3">
                        <Building className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-500 w-16">사무실</span>
                        <span className="font-medium text-neutral-800">
                          {politician.contact.office}
                        </span>
                      </div>
                    )}
                    {politician.contact.phone && (
                      <div className="p-3 flex items-center gap-3">
                        <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-500 w-16">전화</span>
                        <a
                          href={`tel:${politician.contact.phone}`}
                          className="font-mono font-medium text-neutral-800 hover:underline"
                        >
                          {politician.contact.phone}
                        </a>
                      </div>
                    )}
                    {politician.contact.email && (
                      <div className="p-3 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-500 w-16">이메일</span>
                        <a
                          href={`mailto:${politician.contact.email}`}
                          className="font-mono font-medium text-neutral-800 hover:underline"
                        >
                          {politician.contact.email}
                        </a>
                      </div>
                    )}
                    {politician.contact.blogOrSns && (
                      <div className="p-3 flex items-center gap-3">
                        <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-500 w-16">공식 채널</span>
                        <a
                          href={politician.contact.blogOrSns}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-neutral-800 hover:underline truncate"
                        >
                          {politician.contact.blogOrSns}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-neutral-100 border-t border-neutral-200 text-center">
          <p className="text-[11px] text-neutral-500 font-mono">
            PECODE · 대한민국 공공의정 데이터 표준 연동 플랫폼
          </p>
        </div>
      </div>
    </div>
  );
};
