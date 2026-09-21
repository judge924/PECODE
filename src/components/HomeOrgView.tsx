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
        <div className="w-full py-6">

            {/* 3단 대칭 구조: [왼쪽 여백의 정중앙에 지도] + [중앙 조직도 (1280px 정중앙 고정)] + [오른쪽 대칭 여백] */}
            <div className="w-full flex flex-col xl:flex-row items-start justify-center">

                {/* 1. [왼쪽 공간] 모니터 왼쪽 끝과 중앙 조직도 사이의 빈 공간에서 "완벽히 중앙 정렬" */}
                <div className="hidden xl:flex flex-1 justify-center sticky top-28 shrink-0 z-20 px-2">
                    <div className="w-[190px] 2xl:w-[210px]">
                        <DistrictMap
                            politicians={politicians}
                            selectedPolitician={selectedPolitician}
                            onSelectPolitician={onSelectPolitician}
                        />
                    </div>
                </div>

                {/* 모바일 화면용 (작은 화면에서는 상단에 작게 표시) */}
                <div className="xl:hidden w-full max-w-[200px] mx-auto mb-8 px-4">
                    <DistrictMap
                        politicians={politicians}
                        selectedPolitician={selectedPolitician}
                        onSelectPolitician={onSelectPolitician}
                    />
                </div>

                {/* 2. [중앙 조직도 본체] 1280px 원래 크기 그대로 화면 정중앙 고정 */}
                <div className="w-full max-w-7xl shrink-0 px-4 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 items-start">
                        {/* 좌측 정당들 */}
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

                        {/* 우측 정당들 */}
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

                    {/* 무소속 및 기타 영역 */}
                    {independents.length > 0 && (
                        <div className="mt-8">
                            <PartySection
                                party="무소속 및 기타"
                                politicians={independents.map((p) => ({ ...p, party: '무소속 및 기타' }))}
                                selectedPolitician={selectedPolitician}
                                onSelectPolitician={onSelectPolitician}
                            />
                        </div>
                    )}
                </div>

                {/* 3. [오른쪽 대칭 여백] 중앙 조직도가 1픽셀도 흔들리지 않도록 왼쪽과 똑같은 폭을 유지 */}
                <div className="hidden xl:block flex-1 shrink-0 pointer-events-none" />

            </div>
        </div>
    );
};