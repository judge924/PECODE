import React from 'react';
import type { Politician } from '../types/politician';
import { PartySection } from './PartySection';
import { DistrictMap } from './DistrictMap';

interface HomeOrgViewProps {
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
}

const MAIN_LEFT = '더불어민주당';
const MAIN_RIGHT = '국민의힘';
const MINOR_LEFT = ['조국혁신당', '진보당', '기본소득당', '사회민주당'];
const MINOR_RIGHT = ['개혁신당'];

export const HomeOrgView: React.FC<HomeOrgViewProps> = ({
    politicians,
    selectedPolitician,
    onSelectPolitician,
}) => {
    const allKnownParties = [MAIN_LEFT, MAIN_RIGHT, ...MINOR_LEFT, ...MINOR_RIGHT];
    const independents = politicians
        .filter((p) => !allKnownParties.includes(p.party) && p.isAssemblyMember !== false)
        .sort((a, b) => b.timesElected - a.timesElected);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="relative w-full">

                {/* 중앙 대한민국 지도 */}
                <div className="hidden lg:block absolute left-1/2 top-1 -translate-x-1/2 w-[130px] xl:w-[145px] z-20 pointer-events-auto">
                    <DistrictMap
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                    />
                </div>

                <div className="lg:hidden w-full max-w-[170px] mx-auto mb-6">
                    <DistrictMap
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                    />
                </div>

                {/* ⭐️ [1행] 메인 양당 (민주당 vs 국민의힘) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 xl:gap-x-24 items-start">
                    <PartySection
                        party={MAIN_LEFT}
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                        fullOrgChart={true}
                        align="left"
                    />
                    <PartySection
                        party={MAIN_RIGHT}
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                        fullOrgChart={true}
                        align="right"
                    />
                </div>

                {/* ⭐️ [2행] 소수정당 영역 (중앙 통로는 비우고, 좌우 각자의 영역 안에서만 구분선 독립 배치) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 xl:gap-x-24 items-start mt-4">

                    {/* 1. 좌측 소수정당 컬럼 (정당 간 독립 구분선) */}
                    <div className="flex flex-col">
                        {MINOR_LEFT.map((party) => (
                            <div key={party} className="border-t border-neutral-300 pt-6 mt-6 first:mt-4">
                                <PartySection
                                    party={party}
                                    politicians={politicians}
                                    selectedPolitician={selectedPolitician}
                                    onSelectPolitician={onSelectPolitician}
                                    fullOrgChart={false}
                                    align="left"
                                />
                            </div>
                        ))}
                    </div>

                    {/* 2. 우측 소수정당 컬럼 (개혁신당 등 - 좌측과 동일한 수평 높이에서 독립 구분선) */}
                    <div className="flex flex-col">
                        {MINOR_RIGHT.map((party) => (
                            <div key={party} className="border-t border-neutral-300 pt-6 mt-6 first:mt-4">
                                <PartySection
                                    party={party}
                                    politicians={politicians}
                                    selectedPolitician={selectedPolitician}
                                    onSelectPolitician={onSelectPolitician}
                                    fullOrgChart={false}
                                    align="right"
                                />
                            </div>
                        ))}
                    </div>

                </div>

                {/* 3. 무소속 및 기타 영역 */}
                {independents.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-neutral-300">
                        <PartySection
                            party="무소속 및 기타"
                            politicians={independents}
                            selectedPolitician={selectedPolitician}
                            onSelectPolitician={onSelectPolitician}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};