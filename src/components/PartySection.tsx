import { useState } from 'react';
import type { Politician } from '../types/politician';
// 원본 json 데이터에서 electedTerms를 직접 가져오기 위해 연결합니다.
import rawPoliticiansData from '../data/politicians.json';

interface PartySectionProps {
    party: string;
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
    fullOrgChart?: boolean;
}

// JSON 포장지(.default)를 확실하게 벗겨서 순수 배열 데이터를 꺼냅니다.
const rawList: any[] = Array.isArray(rawPoliticiansData)
    ? rawPoliticiansData
    : (rawPoliticiansData as any)?.default || (rawPoliticiansData as any)?.data || [];

// ID뿐만 아니라 이름(name)으로도 찾을 수 있게 2개의 사전을 만듭니다.
const termsMapById = new Map<string, number[]>();
const termsMapByName = new Map<string, number[]>();

rawList.forEach((item: any) => {
    const rawTerms = item.electedTerms || item.terms || item.elected_terms;
    if (Array.isArray(rawTerms) && rawTerms.length > 0) {
        const cleanTerms = rawTerms
            .map((t: any) => parseInt(String(t).replace(/[^0-9]/g, ''), 10))
            .filter((n: number) => !isNaN(n) && n > 0);

        if (cleanTerms.length > 0) {
            if (item.id) termsMapById.set(String(item.id), cleanTerms);
            if (item.name) termsMapByName.set(String(item.name), cleanTerms);
        }
    }
});

// 선출 기수(예: 21 또는 20•21•22)를 찾아내는 도우미 함수
function getElectedTerms(p: Politician): string {
    const anyP = p as any;
    let terms: number[] = [];

    // [1순위] 원본 json에서 ID로 대수 조회
    if (p.id && termsMapById.has(String(p.id))) {
        terms = termsMapById.get(String(p.id)) || [];
    }

    // [2순위] ID 매칭 실패 시 이름(name)으로 대수 조회
    if (terms.length === 0 && p.name && termsMapByName.has(String(p.name))) {
        terms = termsMapByName.get(String(p.name)) || [];
    }

    // [3순위] 전달받은 p 객체 자체의 electedTerms 확인
    if (terms.length === 0) {
        const raw = p.electedTerms || anyP.terms || anyP.elected_terms;
        if (Array.isArray(raw) && raw.length > 0) {
            terms = raw.map((t) => parseInt(String(t).replace(/[^0-9]/g, ''), 10)).filter((n) => !isNaN(n));
        }
    }

    // [4순위] 약력(career)에서 "제OO대 국회의원" 추출 (전직 의원 약력 추적)
    if (terms.length === 0 && Array.isArray(anyP.career)) {
        anyP.career.forEach((c: string) => {
            const match = c.match(/제?\s*(\d+)\s*대\s*국회의원/);
            if (match && match[1]) {
                terms.push(parseInt(match[1], 10));
            }
        });
    }

    // [5순위] p.term 항목에서 대수 추출 (예: "제21대" -> 21)
    if (terms.length === 0 && anyP.term) {
        const match = String(anyP.term).match(/\d+/);
        if (match) {
            terms.push(parseInt(match[0], 10));
        }
    }

    // 중복 제거 및 작은 숫자부터 오름차순 정렬 (예: [21] 또는 [20, 21, 22])
    const uniqueTerms = Array.from(new Set(terms)).sort((a, b) => a - b);
    if (uniqueTerms.length > 0) {
        return uniqueTerms.join('•');
    }

    // 현역 의원(22대)이면서 1선(초선)인 경우 기본 22
    if (p.isAssemblyMember !== false && p.timesElected === 1) {
        return '22';
    }

    return '';
}

function roleLabel(p: Politician): string {
    const termsStr = getElectedTerms(p); // 예: "21" 또는 "20•21•22"

    // 1. 당직(당대표, 원내대표, 최고위원 등)이 있는 경우:
    // 현역이든 전직이든 당선 이력이 있으면 "직책, 선출기수" (예: "최고위원, 21", "당대표, 21•22")
    // 당선된 적이 없는 순수 원외 인사면 직책만 출력 (예: "최고위원")
    if (p.partyRole) {
        return termsStr ? `${p.partyRole}, ${termsStr}` : p.partyRole;
    }

    // 2. 당직이 없는 경우:
    // 현역이 아니면서 당선 이력이 있으면 선수 표시, 완전 당직자면 "당직자"
    if (p.isAssemblyMember === false) {
        return termsStr ? `${p.timesElected || 1}선, ${termsStr}` : '당직자';
    }

    // 3. 일반 현역 국회의원: "선수, 선출기수" (예: "6선, 15•16•18•19•20•22")
    const electionCount = `${p.timesElected || 1}선`;
    return termsStr ? `${electionCount}, ${termsStr}` : electionCount;
}

// 블러 상태일 때는 마우스 클릭, 드래그 등 모든 마우스 반응 차단 (군더더기 없는 미니멀 스타일)
const MiniAvatar = ({
    politician,
    selected,
    onClick,
    size = 'md',
    blurred = false,
}: {
    politician: Politician;
    selected: boolean;
    onClick: () => void;
    size?: 'lg' | 'md' | 'sm';
    blurred?: boolean;
}) => {
    const dims = size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-12 h-12' : 'w-11 h-11';
    const textSize = size === 'lg' ? 'text-lg' : 'text-xs';
    const nameSize = size === 'lg' ? 'text-sm' : 'text-[11px]';
    const subSize = size === 'lg' ? 'text-xs' : 'text-[9px]';

    return (
        <button
            onClick={blurred ? undefined : onClick}
            disabled={blurred}
            className={`flex flex-col items-center text-center ${blurred ? 'pointer-events-none select-none' : 'group cursor-pointer'
                }`}
        >
            <div
                className={`relative rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 transition-transform ${dims} ${selected && !blurred ? 'ring-2 ring-black ring-offset-2' : ''
                    } ${blurred ? 'blur-sm' : 'group-hover:-translate-y-0.5'}`}
            >
                {politician.photoUrl ? (
                    <img
                        src={politician.photoUrl}
                        alt={politician.name}
                        className="w-full h-full object-cover select-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <span className={`text-neutral-400 font-bold ${textSize}`}>{politician.name.slice(0, 1)}</span>
                )}
            </div>
            <div className={`font-normal text-neutral-900 mt-1 leading-tight ${nameSize} ${blurred ? 'blur-sm' : ''}`}>
                {politician.name}
            </div>
            <div className={`text-neutral-500 leading-tight ${subSize}`}>{roleLabel(politician)}</div>
        </button>
    );
};

// 정당별 내부 로고 파일 경로 설정
const PARTY_STYLES: Record<string, { logoUrl?: string }> = {
    '더불어민주당': { logoUrl: '/logos/더불어민주당.png' },
    '국민의힘': { logoUrl: '/logos/국민의힘.png' },
    '조국혁신당': { logoUrl: '/logos/조국혁신당.png' },
    '개혁신당': { logoUrl: '/logos/개혁신당.png' },
    '진보당': { logoUrl: '/logos/진보당.png' },
    '기본소득당': { logoUrl: '/logos/기본소득당.png' },
    '사회민주당': { logoUrl: '/logos/사회민주당.png' },
    '무소속': { logoUrl: '/logos/무소속.png' },
    '무소속 및 기타': { logoUrl: '/logos/무소속.png' },
};

// [수정 1] 배경 박스 없이 모든 로고를 동일한 크기(w-10 h-10)로 깔끔하게 출력
const PartyHeader = ({ party, count }: { party: string; count: number }) => {
    const config = PARTY_STYLES[party] || {};
    const [imgError, setImgError] = useState(false);
    const firstLetter = party.slice(0, 1);

    return (
        <div className="flex items-center gap-3">
            {/* 박스/배경/그림자 없이 동일한 비율과 크기로 맞춤 */}
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
                {config.logoUrl && !imgError ? (
                    <img
                        src={config.logoUrl}
                        alt={party}
                        className="w-full h-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    // 무소속 등 이미지가 없을 때만 은은한 회색 원 안에 첫 글자 표시
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
                        {firstLetter}
                    </div>
                )}
            </div>
            <div className="flex flex-col text-left">
                <span className="text-base font-bold text-neutral-900 leading-tight">{party}</span>
                <span className="text-xs text-neutral-500 font-normal mt-0.5">{count}명</span>
            </div>
        </div>
    );
};

// [아웃라인 스타일] 배경색 없음(투명) + 테두리만 검정색(border-black) 버튼
const ToggleBadge = ({ count, revealed, onClick }: { count?: number; revealed: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="bg-transparent text-black border border-black text-xs font-bold rounded-full px-3 py-1 flex items-center gap-1.5 hover:bg-neutral-100 transition-colors cursor-pointer"
    >
        <span>{count}</span>
        <span className="text-xs font-black leading-none">{revealed ? '∧' : '∨'}</span>
    </button>
);

// 지도부 그룹 — 중진/소속의원과 동일하게 "지도부" 타이틀(좌측) + 토글키(우측) 구조로 통일
const RestLeadershipToggle = ({
    members,
    selectedPolitician,
    onSelectPolitician,
}: {
    members: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (p: Politician) => void;
}) => {
    const [expanded, setExpanded] = useState(true);
    if (members.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t border-neutral-100 w-full">
            {/* 상단: 좌측 "지도부" 타이틀 + 우측 토글 버튼 */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500">지도부</span>
                <ToggleBadge count={members.length} revealed={expanded} onClick={() => setExpanded((v) => !v)} />
            </div>
            {/* 하단: 원내대표, 최고위원 등 명단 그리드 */}
            {expanded && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-x-1 gap-y-3">
                    {members.map((p) => (
                        <MiniAvatar
                            key={p.id}
                            politician={p}
                            selected={selectedPolitician?.id === p.id}
                            onClick={() => onSelectPolitician(p)}
                            size="sm"
                            blurred={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// 중진 / 소속의원 그룹 — 기본은 첫 행(6명) 선명하게 표시, 버튼 클릭 시 전체 펼침
const NamedGroup = ({
    title,
    members,
    selectedPolitician,
    onSelectPolitician,
}: {
    title: string;
    members: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (p: Politician) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    if (members.length === 0) return null;

    const PREVIEW_COUNT = 6;
    const visibleMembers = expanded ? members : members.slice(0, PREVIEW_COUNT);

    return (
        <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-neutral-500">{title}</span>
                {members.length > 0 && (
                    <ToggleBadge count={members.length} revealed={expanded} onClick={() => setExpanded((v) => !v)} />
                )}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-x-1 gap-y-3">
                {visibleMembers.map((p) => (
                    <MiniAvatar
                        key={p.id}
                        politician={p}
                        selected={selectedPolitician?.id === p.id}
                        onClick={() => onSelectPolitician(p)}
                        size="sm"
                        blurred={false} // 블러 완전 해제
                    />
                ))}
            </div>
        </div>
    );
};

// 소수 정당 및 무소속 전용 — 윗 정당들(민주당/국힘)과 100% 동일한 6열 그리드로 세로줄 칼정렬
const CompactPartySection = ({
    party,
    members,
    selectedPolitician,
    onSelectPolitician,
}: {
    party: string;
    members: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (p: Politician) => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const sorted = [...members].sort((a, b) => b.timesElected - a.timesElected);

    const isIndependent = party.includes('무소속');
    const PREVIEW_COUNT = isIndependent ? members.length : 6;
    const visibleMembers = expanded ? sorted : sorted.slice(0, PREVIEW_COUNT);

    return (
        <div className="mb-8 pt-6 border-t border-neutral-300">
            <div className="flex items-center justify-between mb-4">
                <PartyHeader party={party} count={members.length} />
                <ToggleBadge
                    count={members.length}
                    revealed={expanded}
                    onClick={() => setExpanded((v) => !v)}
                />
            </div>

            {/* [핵심] 윗 정당들과 100% 동일한 규격의 그리드로 정렬하여 세로줄을 정확히 일치시킴 */}
            {!isIndependent ? (
                // 1. 소수정당(조국혁신당, 개혁신당 등): 윗 정당들과 똑같이 한 줄에 6명씩 반듯하게 정렬
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-x-1 gap-y-3">
                    {visibleMembers.map((p) => (
                        <MiniAvatar
                            key={p.id}
                            politician={p}
                            selected={selectedPolitician?.id === p.id}
                            onClick={() => onSelectPolitician(p)}
                            size="sm"
                            blurred={false}
                        />
                    ))}
                </div>
            ) : (
                // 2. 무소속: 화면 전체 폭에 맞춰 윗 정당들의 그리드 간격과 동일하게 일치시킴
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-x-1 gap-y-3">
                    {visibleMembers.map((p) => (
                        <MiniAvatar
                            key={p.id}
                            politician={p}
                            selected={selectedPolitician?.id === p.id}
                            onClick={() => onSelectPolitician(p)}
                            size="sm"
                            blurred={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const PartySection: React.FC<PartySectionProps> = ({
    party,
    politicians,
    selectedPolitician,
    onSelectPolitician,
    fullOrgChart = false,
}) => {
    // String()으로 유연하게 변환하여 '무소속 및 기타' 비교 시 타입 에러를 원천 방지
    const members = politicians.filter((p) => {
        const pParty = String(p.party || '');
        if (party === '무소속' || party === '무소속 및 기타') {
            return pParty === '무소속' || pParty === '무소속 및 기타' || pParty === '';
        }
        return pParty === party;
    });
    if (members.length === 0) return null;

    // 민주당, 국민의힘이 아니거나 단순 목록 모드일 때는 소수정당용 블러/토글 화면으로 보여줌
    const isMajorParty = party === '더불어민주당' || party === '국민의힘';
    if (!isMajorParty || !fullOrgChart) {
        return (
            <CompactPartySection
                party={party}
                members={members}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={onSelectPolitician}
            />
        );
    }

    const leader = members.find((p) => p.partyRoleOrder === 1) || null;

    // 지도부 정렬: 직책 서열 순(원내대표 -> 최고위원 -> 정책위의장 -> 사무총장)
    // 단, 동일 직책(최고위원들)끼리는 이름 가나다순(ㄱ->ㅎ)으로 완벽하게 정렬!
    const restLeadership = members
        .filter((p) => p.partyRoleOrder != null && p.partyRoleOrder !== 1)
        .sort((a, b) => {
            const orderDiff = (a.partyRoleOrder ?? 99) - (b.partyRoleOrder ?? 99);
            // 직책 번호가 같으면(예: 최고위원들끼리) 이름 가나다순으로 정렬
            if (orderDiff !== 0) return orderDiff;
            return a.name.localeCompare(b.name, 'ko');
        });

    const leadershipIds = new Set(members.filter((p) => p.partyRoleOrder != null).map((p) => p.id));

    const senior = members
        .filter((p) => !leadershipIds.has(p.id) && p.timesElected >= 2)
        .sort((a, b) => b.timesElected - a.timesElected);
    const seniorIds = new Set(senior.map((p) => p.id));

    const general = members
        .filter((p) => !leadershipIds.has(p.id) && !seniorIds.has(p.id))
        .sort((a, b) => b.timesElected - a.timesElected);

    return (
        <div className="mb-8">
            {/* 정당 로고 헤더 (로고 또는 첫 글자 + 정당명 + 인원수) */}
            <div className="mb-5">
                <PartyHeader party={party} count={members.length} />
            </div>

            {/* 1. 당대표 단독 카드 (토글키 없이 깔끔하게 독립) */}
            {leader && (
                <div className="flex flex-col items-center mb-2">
                    <button
                        onClick={() => onSelectPolitician(leader)}
                        className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 z-10 hover:-translate-y-0.5 transition-transform"
                    >
                        {leader.photoUrl ? (
                            <img
                                src={leader.photoUrl}
                                alt={leader.name}
                                className="w-full h-full object-cover select-none"
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <span className="text-neutral-400 font-bold text-lg">{leader.name.slice(0, 1)}</span>
                        )}
                    </button>

                    <div className="border border-black rounded-xl px-6 pt-8 pb-5 -mt-6 text-center min-w-[180px] bg-white">
                        <div className="text-base font-bold text-neutral-900">{leader.name}</div>
                        <div className="text-sm text-neutral-500">{roleLabel(leader)}</div>
                    </div>
                </div>
            )}

            {/* 2. 지도부 그룹 (중진, 소속의원과 완벽히 동일한 타이틀+토글키 구조) */}
            {restLeadership.length > 0 && (
                <RestLeadershipToggle
                    members={restLeadership}
                    selectedPolitician={selectedPolitician}
                    onSelectPolitician={onSelectPolitician}
                />
            )}

            <NamedGroup
                title="중진 (재선 이상)"
                members={senior}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={onSelectPolitician}
            />
            <NamedGroup
                title="소속의원"
                members={general}
                selectedPolitician={selectedPolitician}
                onSelectPolitician={onSelectPolitician}
            />
        </div>
    );
};