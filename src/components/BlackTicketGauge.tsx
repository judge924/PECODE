import React, { useState, useMemo, useRef } from 'react';
import type { Politician } from '../types/politician';

interface BlackTicketGaugeProps {
    politicians?: Politician[];
}

// 각 정당별 공식 상징색
const PARTY_COLORS: Record<string, string> = {
    '더불어민주당': '#003B96',
    '국민의힘': '#E61E2B',
    '조국혁신당': '#002B7F',
    '개혁신당': '#FF7920',
    '진보당': '#D6001C',
    '기본소득당': '#00D2C4',
    '사회민주당': '#F58426',
    '무소속': '#71717A',
    '무소속 및 기타': '#71717A',
};

// 범좌파 정당 목록
const LEFT_PARTIES = ['더불어민주당', '조국혁신당', '진보당', '기본소득당', '사회민주당'];

export const BlackTicketGauge: React.FC<BlackTicketGaugeProps> = ({ politicians = [] }) => {
    const [hoveredPol, setHoveredPol] = useState<Politician | null>(null);
    const [mouseX, setMouseX] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const getCleanDistrictKey = (p: Politician): string => {
        const dist = (p.district || p.localRegion || '').trim();
        if (!dist || dist.includes('비례')) {
            return `힣_비례대표_${p.name}`;
        }
        if (p.metroRegion && !dist.startsWith(p.metroRegion)) {
            return `${p.metroRegion} ${dist}`;
        }
        return dist;
    };

    const getBarWeight = (timesElected: number) => {
        if (timesElected >= 6) return 3.5;
        if (timesElected === 5) return 3.0;
        if (timesElected === 4) return 2.4;
        if (timesElected === 3) return 1.9;
        if (timesElected === 2) return 1.4;
        return 1.0;
    };

    // 1. [좌파 정당들] 각 정당별로 의원들을 가나다순으로 자동 줄세우기
    const leftPoliticians = useMemo(() => {
        const lefts = (politicians || []).filter(
            (p) => LEFT_PARTIES.includes(p.party) && p.isAssemblyMember !== false
        );

        const partyGroups = new Map<string, Politician[]>();
        lefts.forEach((p) => {
            const list = partyGroups.get(p.party) || [];
            list.push(p);
            partyGroups.set(p.party, list);
        });

        const sortedParties = Array.from(partyGroups.entries()).sort((a, b) => {
            if (a[0] === '더불어민주당') return -1;
            if (b[0] === '더불어민주당') return 1;
            return b[1].length - a[1].length;
        });

        const result: Politician[] = [];
        sortedParties.forEach(([_, members]) => {
            members.sort((a, b) => getCleanDistrictKey(a).localeCompare(getCleanDistrictKey(b), 'ko'));
            result.push(...members);
        });

        return result;
    }, [politicians]);

    // 2. [우파 정당들 + 무소속] 국민의힘(우측 끝) -> 개혁신당 -> 무소속(중앙 쪽)
    const rightPoliticians = useMemo(() => {
        const rights = (politicians || []).filter(
            (p) => !LEFT_PARTIES.includes(p.party) && p.isAssemblyMember !== false
        );

        const ppp = rights.filter((p) => p.party.includes('국민의힘'));
        const reform = rights.filter((p) => p.party.includes('개혁신당'));
        const others = rights.filter((p) => !p.party.includes('국민의힘') && !p.party.includes('개혁신당'));

        ppp.sort((a, b) => getCleanDistrictKey(a).localeCompare(getCleanDistrictKey(b), 'ko'));
        reform.sort((a, b) => getCleanDistrictKey(a).localeCompare(getCleanDistrictKey(b), 'ko'));
        others.sort((a, b) => getCleanDistrictKey(a).localeCompare(getCleanDistrictKey(b), 'ko'));

        return [...ppp, ...reform, ...others];
    }, [politicians]);

    const leftCount = leftPoliticians.length || 189;
    const rightCount = rightPoliticians.length || 110;
    const total = leftCount + rightCount;
    const leftRatio = (leftCount / total) * 100;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMouseX(e.clientX - rect.left);
        }
    };

    return (
        <div className="w-full bg-[#fcfcfc] py-3.5 relative select-none">

            {/* 화살표 깜빡임 애니메이션 */}
            <style>{`
        @keyframes ticketArrowBlink {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.2; transform: translateY(1px); }
        }
        .animate-ticket-blink {
          animation: ticketArrowBlink 1.2s ease-in-out infinite;
        }
      `}</style>

            {/* 헬퍼 블랙 티켓 본체 */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPol(null)}
                className="w-full bg-black h-6 sm:h-7 relative flex items-center overflow-visible cursor-crosshair"
            >

                {/* 실시간 즉각 반응 HUD 툴팁 */}
                {hoveredPol && (
                    <div
                        className="absolute -top-8 -translate-x-1/2 z-40 pointer-events-none bg-neutral-950 text-white text-[11px] px-2.5 py-0.5 rounded border border-neutral-700 shadow-xl whitespace-nowrap flex items-center gap-1.5 transition-all duration-75"
                        style={{
                            left: Math.max(70, Math.min(mouseX, (containerRef.current?.clientWidth || 1000) - 70)),
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                                backgroundColor: PARTY_COLORS[hoveredPol.party] || '#71717A',
                            }}
                        />
                        <span className="text-neutral-400 font-mono text-[10px]">
                            {hoveredPol.district || hoveredPol.localRegion || '비례대표'}
                        </span>
                        <span className="font-bold text-white">{hoveredPol.name}</span>
                        <span className="text-[9px] font-mono bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded">
                            {hoveredPol.timesElected}선
                        </span>
                        <span
                            className="text-[9px] font-bold px-1 py-0.2 rounded text-white"
                            style={{ backgroundColor: PARTY_COLORS[hoveredPol.party] || '#71717A' }}
                        >
                            {hoveredPol.party}
                        </span>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* [좌측 진영] 정당별 가나다순 '마지막 끝 의원' 선 위에 자동 화살표(▼) 배치    */}
                {/* ========================================================================= */}
                <div
                    className="h-full flex items-center justify-start gap-[1px] sm:gap-[1.5px] overflow-visible"
                    style={{ width: `${leftRatio}%` }}
                >
                    {leftPoliticians.map((p, i) => {
                        const nextP = leftPoliticians[i + 1];
                        // [자동 판별] 다음 사람 정당이 달라지면 = 현재 사람이 해당 정당의 마지막 의원!
                        const isLastOfParty = !nextP || nextP.party !== p.party;
                        const partyColor = PARTY_COLORS[p.party] || '#003B96';

                        return (
                            <div
                                key={`left-pol-${p.id}`}
                                style={{ flex: getBarWeight(p.timesElected) }}
                                className="h-full bg-white transition-opacity hover:opacity-80 relative"
                                onMouseEnter={() => setHoveredPol(p)}
                            >
                                {/* 각 정당의 가나다순 마지막 의원 선 정중앙에 상단 화살표(▼) 자동 고정 */}
                                {isLastOfParty && (
                                    <div
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-ticket-blink flex flex-col items-center"
                                        title={`${p.party} 끝 의원 (${p.name})`}
                                    >
                                        <svg width="10" height="7" viewBox="0 0 10 7" style={{ fill: partyColor }}>
                                            <path d="M0 0 L10 0 L5 7 Z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ========================================================================= */}
                {/* [우측 진영] 국힘/개혁신당 끝 의원에 하단 화살표(▲) + 무소속은 회색(#b7b7b7) 선 */}
                {/* ========================================================================= */}
                <div
                    className="h-full flex flex-row-reverse items-center justify-start gap-[1px] sm:gap-[1.5px] overflow-visible"
                    style={{ width: `${100 - leftRatio}%` }}
                >
                    {rightPoliticians.map((p, i) => {
                        const nextP = rightPoliticians[i + 1];
                        // [자동 판별] 다음 사람 정당이 달라지면 = 현재 사람이 해당 정당의 마지막 의원!
                        const isLastOfParty = !nextP || nextP.party !== p.party;
                        const isIndependent = !p.party.includes('국민의힘') && !p.party.includes('개혁신당');
                        const partyColor = PARTY_COLORS[p.party] || '#E61E2B';

                        return (
                            <div
                                key={`right-pol-${p.id}`}
                                style={{
                                    flex: getBarWeight(p.timesElected),
                                    // [수정 1] 무소속은 회색선(#b7b7b7), 다른 정당은 흰색선(#ffffff) 적용
                                    backgroundColor: isIndependent ? '#b7b7b7' : '#ffffff',
                                }}
                                className="h-full transition-opacity hover:opacity-80 relative"
                                onMouseEnter={() => setHoveredPol(p)}
                            >
                                {/* [수정 1] 무소속은 화살표가 없고, 국민의힘/개혁신당의 마지막 의원 선에만 하단 화살표(▲) 자동 고정 */}
                                {!isIndependent && isLastOfParty && (
                                    <div
                                        className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-ticket-blink flex flex-col items-center"
                                        title={`${p.party} 끝 의원 (${p.name})`}
                                    >
                                        <svg width="10" height="7" viewBox="0 0 10 7" style={{ fill: partyColor }}>
                                            <path d="M5 0 L10 7 L0 7 Z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* [정중앙 기준선: 50% 과반 기준 옐로우 #fdfe59] */}
                <div
                    className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[3px] sm:w-[4px] h-full z-10 pointer-events-none"
                    style={{
                        backgroundColor: '#fdfe59',
                        boxShadow: '0 0 8px rgba(253, 254, 89, 0.8)',
                    }}
                />

            </div>
        </div>
    );
};