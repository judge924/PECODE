import React from 'react';
import type { Politician } from '../types/politician';
import { PartySection } from './PartySection';
import { DistrictMap } from './DistrictMap';

interface HomeOrgViewProps {
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
}

const LEFT_PARTIES = ['더불어민주당', '조국혁신당', '진보당', '기본소득당', '사회민주당'];
const RIGHT_PARTIES = ['국민의힘', '개혁신당'];
const MAIN_PARTIES = ['더불어민주당', '국민의힘'];

export const HomeOrgView: React.FC<HomeOrgViewProps> = ({
    politicians,
    selectedPolitician,
    onSelectPolitician,
}) => {
    const independents = politicians
        .filter((p) => ![...LEFT_PARTIES, ...RIGHT_PARTIES].includes(p.party) && p.isAssemblyMember !== false)
        .sort((a, b) => b.timesElected - a.timesElected);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* 본체 레이아웃 (상단에 양당 당대표 중앙 지도 배치) */}
            <div className="relative w-full">

                {/* 지도의 윗부분을 더불어민주당/국민의힘 로고 높이에 맞춰 위로 끌어올림 (top-1) */}
                <div className="hidden lg:block absolute left-1/2 top-1 -translate-x-1/2 w-[130px] xl:w-[145px] z-20 pointer-events-auto">
                    <DistrictMap
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                    />
                </div>

                {/* 모바일 화면용 (작은 화면에서는 중앙 지도 상단에 작게 배치) */}
                <div className="lg:hidden w-full max-w-[170px] mx-auto mb-6">
                    <DistrictMap
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                    />
                </div>

                {/* 좌우 2열 정당 조직도 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 xl:gap-x-24 gap-y-8 items-start">

                    {/* 1. 좌측 정당들 (더불어민주당 등) */}
                    <div>
                        {LEFT_PARTIES.map((party) => (
                            <PartySection
                                key={party}
                                party={party}
                                politicians={politicians}
                                selectedPolitician={selectedPolitician}
                                onSelectPolitician={onSelectPolitician}
                                fullOrgChart={MAIN_PARTIES.includes(party)}
                            />
                        ))}
                    </div>

                    {/* 2. 우측 정당들 (국민의힘 등 - 우측 정렬 적용) */}
                    <div>
                        {RIGHT_PARTIES.map((party) => (
                            <PartySection
                                key={party}
                                party={party}
                                politicians={politicians}
                                selectedPolitician={selectedPolitician}
                                onSelectPolitician={onSelectPolitician}
                                fullOrgChart={MAIN_PARTIES.includes(party)}
                            />
                        ))}
                    </div>

                </div>

                {/* 3. 무소속 및 기타 영역 */}
                {independents.length > 0 && (
                    <div className="mt-8">
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