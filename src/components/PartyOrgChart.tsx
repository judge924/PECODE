import type { Politician } from '../types/politician';

interface PartyOrgChartProps {
    party: string;
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
    onBack: () => void;
}

export const PartyOrgChart: React.FC<PartyOrgChartProps> = ({
    party,
    politicians,
    selectedPolitician,
    onSelectPolitician,
    onBack,
}) => {
    const members = politicians.filter((p) => p.party === party);

    // 1. 지도부: partyRoleOrder가 있는 사람, 순서대로 정렬
    const leadership = members
        .filter((p) => p.partyRoleOrder != null)
        .sort((a, b) => (a.partyRoleOrder ?? 99) - (b.partyRoleOrder ?? 99));

    const leadershipIds = new Set(leadership.map((p) => p.id));

    // 2. 중진: 지도부가 아니면서 재선(2선) 이상
    const senior = members
        .filter((p) => !leadershipIds.has(p.id) && p.timesElected >= 2)
        .sort((a, b) => b.timesElected - a.timesElected);

    const seniorIds = new Set(senior.map((p) => p.id));

    // 3. 일반 의원: 나머지
    const general = members.filter(
        (p) => !leadershipIds.has(p.id) && !seniorIds.has(p.id)
    );

    // 지도부를 직책별로 그룹핑 (같은 order끼리 한 줄에)
    const leadershipRows: Politician[][] = [];
    let currentOrder: number | null = null;
    leadership.forEach((p) => {
        if (p.partyRoleOrder !== currentOrder) {
            leadershipRows.push([p]);
            currentOrder = p.partyRoleOrder ?? null;
        } else {
            leadershipRows[leadershipRows.length - 1].push(p);
        }
    });

    const MiniCard = ({ politician, large = false }: { politician: Politician; large?: boolean }) => (
        <button
            onClick={() => onSelectPolitician(politician)}
            className={`group flex flex-col items-center text-center transition-all ${selectedPolitician?.id === politician.id ? 'opacity-100' : ''
                }`}
        >
            <div
                className={`relative rounded-full overflow-hidden border-2 bg-neutral-100 flex items-center justify-center shrink-0 transition-all group-hover:border-black group-hover:-translate-y-0.5 ${selectedPolitician?.id === politician.id
                        ? 'border-black ring-2 ring-black ring-offset-2'
                        : 'border-neutral-300'
                    } ${large ? 'w-20 h-20' : 'w-12 h-12'}`}
            >
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
                    <span className={`text-neutral-400 font-bold ${large ? 'text-xl' : 'text-xs'}`}>
                        {politician.name.slice(0, 1)}
                    </span>
                )}
            </div>
            <div className={`font-bold text-neutral-900 mt-1.5 ${large ? 'text-sm' : 'text-xs'}`}>
                {politician.name}
            </div>
            <div className={`text-neutral-500 ${large ? 'text-xs' : 'text-[10px]'}`}>
                {politician.partyRole || (politician.isAssemblyMember === false ? '당직자' : '국회의원')}
            </div>
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={onBack}
                        className="text-xs text-neutral-400 hover:text-black mb-1 transition-colors"
                    >
                        ← 전체 목록으로
                    </button>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        {party} 조직도
                    </h2>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        총 {members.length}명 · 지도부 {leadership.length}명 · 중진(재선 이상) {senior.length}명
                    </p>
                </div>
            </div>

            {/* 1. 지도부 (계층형) */}
            {leadershipRows.length > 0 && (
                <div className="mb-10">
                    {leadershipRows.map((row, rowIdx) => (
                        <div key={rowIdx} className="relative">
                            {rowIdx > 0 && (
                                <div className="w-px h-6 bg-neutral-300 mx-auto" />
                            )}
                            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 pb-4 relative">
                                {row.length > 1 && (
                                    <div className="absolute top-10 left-1/4 right-1/4 h-px bg-neutral-300" />
                                )}
                                {row.map((p) => (
                                    <MiniCard key={p.id} politician={p} large />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. 중진 그룹 */}
            {senior.length > 0 && (
                <div className="mb-10 border-t border-neutral-200 pt-6">
                    <h3 className="text-xs font-bold text-neutral-500 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neutral-400" />
                        중진 (재선 이상) · {senior.length}명
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-5">
                        {senior.map((p) => (
                            <MiniCard key={p.id} politician={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* 3. 일반 의원 그리드 */}
            {general.length > 0 && (
                <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-xs font-bold text-neutral-500 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-neutral-300" />
                        소속 의원 · {general.length}명
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-5">
                        {general.map((p) => (
                            <MiniCard key={p.id} politician={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};