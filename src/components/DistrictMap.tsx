import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Politician } from '../types/politician';

interface DistrictMapProps {
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
}

const PARTY_MAP_COLORS: Record<string, string> = {
    '더불어민주당': '#004EA2',
    '국민의힘': '#E61E2B',
    '조국혁신당': '#002B7F',
    '개혁신당': '#FF7920',
    '진보당': '#D6001C',
    '기본소득당': '#00D2C4',
    '사회민주당': '#F58426',
    '무소속': '#71717A',
    '무소속 및 기타': '#71717A',
};

const SIDO_FULL_NAMES: Record<string, string> = {
    '서울': '서울특별시',
    '부산': '부산광역시',
    '대구': '대구광역시',
    '인천': '인천광역시',
    '광주': '광주광역시',
    '대전': '대전광역시',
    '울산': '울산광역시',
    '세종': '세종특별자치시',
    '경기': '경기도',
    '강원': '강원특별자치도',
    '충북': '충청북도',
    '충남': '충청남도',
    '전북': '전북특별자치도',
    '전남': '전라남도',
    '경북': '경상북도',
    '경남': '경상남도',
    '제주': '제주특별자치도',
};

export const DistrictMap: React.FC<DistrictMapProps> = ({
    politicians,
    selectedPolitician,
    onSelectPolitician,
}) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [selectedSido, setSelectedSido] = useState<string | null>(null);

    // 확대 상태 관리
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    // ⭐️ 마우스 좌표 추적 상태 (스샷처럼 커서를 따라다니는 카드 구현)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [hoveredSido, setHoveredSido] = useState<string | null>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<{
        sggName: string;
        politician: Politician | null;
    } | null>(null);

    useEffect(() => {
        setMounted(true);
        fetch('/data/korea_districts_22nd.json')
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error('지도 데이터 로드 실패:', err));
    }, []);

    // ⭐️ [해결 2] 닫을 때 무조건 작은 지도를 17개 시도 전체 뷰로 100% 초기화 복귀
    const handleCloseExpanded = () => {
        setIsExpanded(false);
        setSelectedSido(null);
        setHoveredDistrict(null);
        setHoveredSido(null);
    };

    const cleanDistrictName = (s: string) => {
        if (!s) return '';
        const raw = s.replace(/[\s·-]/g, '');
        if (raw.includes('세종') && raw.includes('갑')) return '세종갑';
        if (raw.includes('세종') && raw.includes('을')) return '세종을';
        return raw.replace(/[시군구]/g, '');
    };

    const politicianDistrictMap = useMemo(() => {
        const map = new Map<string, Politician>();
        politicians.forEach((p) => {
            if (p.district) map.set(cleanDistrictName(p.district), p);
            if (p.metroRegion && p.localRegion) {
                map.set(cleanDistrictName(`${p.metroRegion}${p.localRegion}`), p);
            }
        });
        return map;
    }, [politicians]);

    const { svgPaths, sidoBounds, sidoStats, sidoBoundaryPathD } = useMemo(() => {
        if (!geoData || !geoData.features) {
            return { svgPaths: [], sidoBounds: {}, sidoStats: {}, sidoBoundaryPathD: '' };
        }

        const MIN_LNG = 125.6;
        const MAX_LNG = 130.2;
        const MIN_LAT = 33.1;
        const MAX_LAT = 38.6;
        const WIDTH = 500;
        const HEIGHT = 680;

        const project = ([lng, lat]: [number, number]): [number, number] => {
            const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * WIDTH;
            const latRad = (lat * Math.PI) / 180;
            const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
            const minLatRad = (MIN_LAT * Math.PI) / 180;
            const maxLatRad = (MAX_LAT * Math.PI) / 180;
            const minMerc = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
            const maxMerc = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
            const y = HEIGHT - ((mercN - minMerc) / (maxMerc - minMerc)) * HEIGHT;
            return [x, y];
        };

        const bounds: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {};
        const stats: Record<string, { total: number; partyCounts: Record<string, number> }> = {};
        const edgeMap = new Map<string, { sidos: Set<string>; x1: number; y1: number; x2: number; y2: number }>();

        const recordEdge = (pt1: [number, number], pt2: [number, number], sido: string) => {
            const x1 = Math.round(pt1[0] * 10) / 10;
            const y1 = Math.round(pt1[1] * 10) / 10;
            const x2 = Math.round(pt2[0] * 10) / 10;
            const y2 = Math.round(pt2[1] * 10) / 10;

            if (x1 === x2 && y1 === y2) return;
            const isFwd = x1 < x2 || (x1 === x2 && y1 < y2);
            const key = isFwd ? `${x1},${y1}_${x2},${y2}` : `${x2},${y2}_${x1},${y1}`;

            const existing = edgeMap.get(key);
            if (existing) {
                existing.sidos.add(sido);
            } else {
                edgeMap.set(key, { sidos: new Set([sido]), x1, y1, x2, y2 });
            }
        };

        const trackPoint = (x: number, y: number, sido: string, lng: number) => {
            if (sido === '인천' && lng < 126.25) return;

            if (!bounds[sido]) {
                bounds[sido] = { minX: x, maxX: x, minY: y, maxY: y };
            } else {
                bounds[sido].minX = Math.min(bounds[sido].minX, x);
                bounds[sido].maxX = Math.max(bounds[sido].maxX, x);
                bounds[sido].minY = Math.min(bounds[sido].minY, y);
                bounds[sido].maxY = Math.max(bounds[sido].maxY, y);
            }
        };

        const paths = geoData.features.map((feature: any, idx: number) => {
            const props = feature.properties || {};
            const sido = props.SIDO || '기타';
            const sggName = props.SIDO_SGG || props.SGG || `선거구-${idx}`;
            const cleanName = cleanDistrictName(sggName);

            let matched = politicianDistrictMap.get(cleanName);
            if (!matched) {
                for (const [key, pol] of politicianDistrictMap.entries()) {
                    if (cleanName.includes(key) || key.includes(cleanName)) {
                        matched = pol;
                        break;
                    }
                }
            }

            if (!stats[sido]) stats[sido] = { total: 0, partyCounts: {} };
            stats[sido].total += 1;
            const party = matched?.party || '무소속';
            stats[sido].partyCounts[party] = (stats[sido].partyCounts[party] || 0) + 1;

            const partyColor = matched?.party ? (PARTY_MAP_COLORS[matched.party] || '#71717A') : '#E4E4E7';
            let pathD = '';
            const geom = feature.geometry;

            if (geom.type === 'Polygon') {
                pathD = geom.coordinates
                    .map((ring: any[]) => {
                        const projectedRing = ring.map((pt: any[]) => project([pt[0], pt[1]]));
                        for (let i = 0; i < projectedRing.length - 1; i++) {
                            recordEdge(projectedRing[i], projectedRing[i + 1], sido);
                        }
                        return projectedRing
                            .map((pt: [number, number], i: number) => {
                                trackPoint(pt[0], pt[1], sido, ring[i][0]);
                                return `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
                            })
                            .join('') + 'Z';
                    })
                    .join(' ');
            } else if (geom.type === 'MultiPolygon') {
                pathD = geom.coordinates
                    .map((poly: any[]) =>
                        poly
                            .map((ring: any[]) => {
                                const projectedRing = ring.map((pt: any[]) => project([pt[0], pt[1]]));
                                for (let i = 0; i < projectedRing.length - 1; i++) {
                                    recordEdge(projectedRing[i], projectedRing[i + 1], sido);
                                }
                                return projectedRing
                                    .map((pt: [number, number], i: number) => {
                                        trackPoint(pt[0], pt[1], sido, ring[i][0]);
                                        return `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
                                    })
                                    .join('') + 'Z';
                            })
                            .join(' ')
                    )
                    .join(' ');
            }

            return {
                id: feature.id || idx,
                sido,
                sggName,
                matched,
                partyColor,
                pathD,
            };
        });

        let boundaryD = '';
        edgeMap.forEach((edge) => {
            if (edge.sidos.size > 1) {
                boundaryD += `M${edge.x1},${edge.y1}L${edge.x2},${edge.y2}`;
            }
        });

        return { svgPaths: paths, sidoBounds: bounds, sidoStats: stats, sidoBoundaryPathD: boundaryD };
    }, [geoData, politicianDistrictMap]);

    const sidoDominantColor = useMemo(() => {
        const result: Record<string, { color: string }> = {};
        Object.entries(sidoStats).forEach(([sido, data]) => {
            const counts = Object.entries(data.partyCounts).filter(([_, c]) => c > 0);
            if (counts.length === 0) {
                result[sido] = { color: '#71717A' };
                return;
            }
            counts.sort((a, b) => b[1] - a[1]);
            const top = counts[0];
            const isTie = counts.length > 1 && counts[1][1] === top[1];
            result[sido] = { color: isTie ? '#7f54a7' : (PARTY_MAP_COLORS[top[0]] || '#71717A') };
        });
        return result;
    }, [sidoStats]);

    const currentViewBox = useMemo(() => {
        if (!selectedSido || !sidoBounds[selectedSido]) {
            return '0 0 500 680';
        }

        const b = sidoBounds[selectedSido];
        const rawW = b.maxX - b.minX;
        const rawH = b.maxY - b.minY;
        const pad = Math.max(rawW, rawH) * 0.1;
        const wWithPad = rawW + pad * 2;
        const hWithPad = rawH + pad * 2;
        const targetAspect = 500 / 680;
        const currentAspect = wWithPad / hWithPad;

        let boxW = wWithPad;
        let boxH = hWithPad;
        let boxX = b.minX - pad;
        let boxY = b.minY - pad;

        if (currentAspect > targetAspect) {
            boxH = boxW / targetAspect;
            boxY = (b.minY + b.maxY) / 2 - boxH / 2;
        } else {
            boxW = boxH * targetAspect;
            boxX = (b.minX + b.maxX) / 2 - boxW / 2;
        }

        return `${boxX.toFixed(1)} ${boxY.toFixed(1)} ${boxW.toFixed(1)} ${boxH.toFixed(1)}`;
    }, [selectedSido, sidoBounds]);

    const groupedPathsBySido = useMemo(() => {
        const groups: Record<string, typeof svgPaths> = {};
        svgPaths.forEach((item: any) => {
            if (!groups[item.sido]) groups[item.sido] = [];
            groups[item.sido].push(item);
        });
        return groups;
    }, [svgPaths]);

    // ⭐️ 순수 SVG 지도 렌더링 함수
    const renderMapSvg = (isLarge: boolean = false) => (
        <svg
            viewBox={currentViewBox}
            className="w-full h-full drop-shadow-md transition-all duration-500 ease-out select-none"
        >
            {selectedSido === null ? (
                <>
                    {Object.entries(groupedPathsBySido).map(([sido, paths]: [string, any]) => {
                        const dominant = sidoDominantColor[sido] || { color: '#71717A' };
                        const isHovered = hoveredSido === sido;

                        return (
                            <g
                                key={`sido-group-${sido}`}
                                className="cursor-pointer transition-all duration-150"
                                onMouseEnter={() => setHoveredSido(sido)}
                                onMouseLeave={() => setHoveredSido(null)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isExpanded) {
                                        setSelectedSido(null);
                                        setIsExpanded(true);
                                        return;
                                    }
                                    setSelectedSido(sido);
                                    setHoveredSido(null);
                                }}
                            >
                                {paths.map((item: any) => (
                                    <path
                                        key={`sido-path-${item.id}`}
                                        d={item.pathD}
                                        fill={dominant.color}
                                        stroke={dominant.color}
                                        strokeWidth={isLarge ? "0.8" : "1.2"}
                                        className={isHovered ? 'brightness-125' : ''}
                                    />
                                ))}
                            </g>
                        );
                    })}

                    {sidoBoundaryPathD && (
                        <path
                            d={sidoBoundaryPathD}
                            stroke="#ffffff"
                            strokeWidth={isLarge ? "1.0" : "1.2"}
                            vectorEffect="non-scaling-stroke"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            pointerEvents="none"
                        />
                    )}
                </>
            ) : (
                (groupedPathsBySido[selectedSido] || []).map((item: any) => {
                    const isSelected = selectedPolitician && item.matched?.id === selectedPolitician.id;

                    return (
                        <path
                            key={`detail-path-${item.id}`}
                            d={item.pathD}
                            fill={item.partyColor}
                            stroke={isSelected ? '#000000' : 'rgba(255, 255, 255, 0.95)'}
                            strokeWidth={isSelected ? '2.0' : (isLarge ? '1.0' : '0.75')}
                            vectorEffect="non-scaling-stroke"
                            className="transition-all duration-100 cursor-pointer hover:brightness-110 hover:stroke-black"
                            onMouseEnter={() => {
                                setHoveredDistrict({
                                    sggName: item.sggName,
                                    politician: item.matched || null,
                                });
                            }}
                            onMouseLeave={() => setHoveredDistrict(null)}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.matched) {
                                    onSelectPolitician(item.matched);
                                    handleCloseExpanded(); // ⭐️ 선택 시 원래 전체 지도로 리셋 복귀!
                                }
                            }}
                        />
                    );
                })
            )}
        </svg>
    );

    return (
        <>
            {/* ⭐️ [1. 평소 미니 뷰] */}
            <div
                onClick={() => {
                    setSelectedSido(null);
                    setIsExpanded(true);
                }}
                className="group relative w-full flex flex-col items-center justify-center cursor-pointer select-none"
                title="클릭하여 대한민국 지도 크게 보기"
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900 text-white text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm pointer-events-none z-30">
                    🔍 클릭하여 지도 확대
                </div>

                <div className="relative w-full aspect-[500/680] flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105">
                    {svgPaths.length === 0 ? (
                        <div className="text-[10px] text-neutral-400 font-mono animate-pulse">지도 로딩 중...</div>
                    ) : (
                        renderMapSvg(false)
                    )}
                </div>
            </div>

            {/* ⭐️ [2. 순수 거대 지도 확대 뷰 + 마우스 추적 플로팅 카드] */}
            {mounted && isExpanded && createPortal(
                <div
                    onClick={handleCloseExpanded}
                    onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 lg:p-12 animate-in fade-in duration-200 select-none cursor-pointer"
                >
                    {/* 은은한 투명 블러 배경 */}
                    <div className="absolute inset-0 bg-neutral-900/25 backdrop-blur-sm transition-opacity duration-300" />

                    {/* 상단 미니멀 컨트롤 버튼 */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-8 right-8 z-30 flex items-center gap-2.5 cursor-default"
                    >
                        {selectedSido && (
                            <button
                                onClick={() => {
                                    setSelectedSido(null);
                                    setHoveredDistrict(null);
                                }}
                                className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md border border-neutral-200 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <span>←</span>
                                <span>전체 시·도</span>
                            </button>
                        )}
                        <button
                            onClick={handleCloseExpanded}
                            className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full shadow-md border border-neutral-200 transition-all cursor-pointer flex items-center gap-1"
                        >
                            <span>✕</span>
                            <span>닫기</span>
                        </button>
                    </div>

                    {/* 지도 본체 */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-[720px] h-[85vh] max-h-[820px] flex items-center justify-center cursor-default animate-in zoom-in-95 duration-200 ease-out"
                    >
                        <div className="w-full h-full max-w-[620px] aspect-[500/680] flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.3)]">
                            {renderMapSvg(true)}
                        </div>
                    </div>

                    {/* ⭐️ [핵심] 첨부 스샷 스타일: 마우스 커서를 졸졸 따라다니는 초고급 화이트 플로팅 카드 */}
                    {(hoveredDistrict || hoveredSido) && (
                        <div
                            style={{
                                position: 'fixed',
                                left: `${Math.min(mousePos.x + 16, window.innerWidth - 170)}px`,
                                top: `${Math.min(mousePos.y + 16, window.innerHeight - 190)}px`,
                            }}
                            className="z-50 pointer-events-none bg-white rounded-2xl shadow-[0_20px_35px_rgba(0,0,0,0.2)] border border-neutral-100 p-3 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-100 min-w-[130px] max-w-[160px]"
                        >
                            {hoveredDistrict && selectedSido ? (
                                // 1) 세부 선거구 호버 시: [선거구명] ➔ [의원 사진] ➔ [의원 이름] ➔ [정당 뱃지]
                                <>
                                    <div className="text-[11px] font-black text-neutral-900 tracking-tight">
                                        {hoveredDistrict.sggName}
                                    </div>

                                    {/* ⭐️ 스샷의 개구리처럼 중앙에 큼직하고 세련된 프로필 사진! */}
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 my-2 shadow-xs border border-neutral-200/60 flex items-center justify-center">
                                        {hoveredDistrict.politician?.photoUrl ? (
                                            <img
                                                src={hoveredDistrict.politician.photoUrl}
                                                alt={hoveredDistrict.politician.name}
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-neutral-400">
                                                {hoveredDistrict.politician?.name?.slice(0, 1) || '인'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-xs font-bold text-neutral-950">
                                        {hoveredDistrict.politician ? `${hoveredDistrict.politician.name} 의원` : '공석'}
                                    </div>

                                    {hoveredDistrict.politician && (
                                        <div
                                            className="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                                            style={{ backgroundColor: PARTY_MAP_COLORS[hoveredDistrict.politician.party] || '#71717A' }}
                                        >
                                            {hoveredDistrict.politician.party}
                                        </div>
                                    )}
                                </>
                            ) : hoveredSido && !selectedSido ? (
                                // 2) 17개 시·도 호버 시: [시도 이름] ➔ [총 의석수] ➔ [안내]
                                <>
                                    <div className="text-xs font-black text-neutral-900 tracking-tight">
                                        {SIDO_FULL_NAMES[hoveredSido] || hoveredSido}
                                    </div>
                                    <div className="text-lg font-black text-emerald-600 my-1">
                                        {sidoStats[hoveredSido]?.total || 0}석
                                    </div>
                                    <div className="text-[9px] font-medium text-neutral-400">
                                        클릭 시 선거구 줌인
                                    </div>
                                </>
                            ) : null}
                        </div>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};