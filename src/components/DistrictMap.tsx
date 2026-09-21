import React, { useEffect, useState, useMemo } from 'react';
import type { Politician } from '../types/politician';

interface DistrictMapProps {
    politicians: Politician[];
    selectedPolitician: Politician | null;
    onSelectPolitician: (politician: Politician) => void;
}

// 정당별 지도 채색 공식 색상
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

// 17개 광역 시·도 풀네임 매칭표
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
    // null이면 1단계 전국 17개 시도 뷰, 값이 있으면 2단계 세부 선거구 줌인 뷰
    const [selectedSido, setSelectedSido] = useState<string | null>(null);

    const [hoveredSido, setHoveredSido] = useState<string | null>(null);
    const [hoveredDistrict, setHoveredDistrict] = useState<{
        sggName: string;
        politician: Politician | null;
    } | null>(null);

    useEffect(() => {
        fetch('/data/korea_districts_22nd.json')
            .then((res) => res.json())
            .then((data) => setGeoData(data))
            .catch((err) => console.error('지도 데이터 로드 실패:', err));
    }, []);

    // 세종갑, 세종을 등 특수 지역구까지 100% 매칭
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
            if (p.district) {
                map.set(cleanDistrictName(p.district), p);
            }
            if (p.metroRegion && p.localRegion) {
                map.set(cleanDistrictName(`${p.metroRegion}${p.localRegion}`), p);
            }
        });
        return map;
    }, [politicians]);

    // 좌표 투영 + 시·도별 통계 + 경계선 추출
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
            // 인천의 서해 5도 먼 섬(백령도 등)은 줌인 계산에서 제외하여 본토 중심 10배 확대
            if (sido === '인천' && lng < 126.25) {
                return;
            }

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

            if (!stats[sido]) {
                stats[sido] = { total: 0, partyCounts: {} };
            }
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

    // 다수당 판별 및 동률 보라색(#7f54a7)
    const sidoDominantColor = useMemo(() => {
        const result: Record<string, { color: string; mainParty: string; isTie: boolean; breakdownText: string }> = {};

        Object.entries(sidoStats).forEach(([sido, data]) => {
            const counts = Object.entries(data.partyCounts).filter(([_, c]) => c > 0);
            if (counts.length === 0) {
                result[sido] = { color: '#71717A', mainParty: '무소속', isTie: false, breakdownText: '' };
                return;
            }

            counts.sort((a, b) => b[1] - a[1]);
            const top = counts[0];
            const isTie = counts.length > 1 && counts[1][1] === top[1];

            const formatPartyName = (partyName: string) => {
                if (partyName.includes('민주')) return '민주당';
                if (partyName.includes('국민의힘') || partyName.includes('국힘')) return '국힘';
                if (partyName.includes('조국')) return '조국혁신';
                if (partyName.includes('개혁')) return '개혁신당';
                if (partyName.includes('진보')) return '진보당';
                return partyName;
            };

            const breakdownText = counts
                .slice(0, 2)
                .map(([p, c]) => `${formatPartyName(p)} ${c}`)
                .join(' · ');

            if (isTie) {
                result[sido] = {
                    color: '#7f54a7', // 동률 보라색
                    mainParty: '동률',
                    isTie: true,
                    breakdownText,
                };
            } else {
                result[sido] = {
                    color: PARTY_MAP_COLORS[top[0]] || '#71717A',
                    mainParty: top[0],
                    isTie: false,
                    breakdownText,
                };
            }
        });

        return result;
    }, [sidoStats]);

    // 17개 시·도 모두 위젯에 꽉 차도록 비율 자동 계산
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

    return (
        <div className="select-none relative w-full">

            {/* 1. 상단 타이틀 바 */}
            <div className="flex items-center justify-between mb-1.5 text-[11px] text-neutral-900">
                {selectedSido ? (
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => setSelectedSido(null)}
                            className="text-[10px] font-medium text-neutral-800 hover:text-black flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        >
                            ← 전체 지도
                        </button>
                        <span className="text-[11px] font-bold text-neutral-900">
                            {SIDO_FULL_NAMES[selectedSido] || selectedSido}
                        </span>
                    </div>
                ) : (
                    <div className="w-full text-center text-[11px] font-bold text-neutral-900">
                        대한민국 제22대 국회의원 선거
                    </div>
                )}
            </div>

            {/* 2. 인터랙티브 안내 툴팁 (일반 폰트 font-normal 적용) */}
            <div className="h-5 flex items-center text-[10px] mb-1 overflow-hidden">
                {selectedSido ? (
                    hoveredDistrict ? (
                        <div className="flex items-center justify-between w-full truncate">
                            <span className="font-normal text-neutral-900 truncate">{hoveredDistrict.sggName}</span>
                            {hoveredDistrict.politician && (
                                <span className="flex items-center gap-1 font-normal text-neutral-900 shrink-0 ml-1">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: PARTY_MAP_COLORS[hoveredDistrict.politician.party] || '#71717A' }}
                                    />
                                    {hoveredDistrict.politician.name} ({hoveredDistrict.politician.party})
                                </span>
                            )}
                        </div>
                    ) : null
                ) : (
                    hoveredSido ? (
                        <div className="flex items-center justify-between w-full">
                            <span className="font-normal text-neutral-900 truncate">
                                {SIDO_FULL_NAMES[hoveredSido] || hoveredSido} ({sidoStats[hoveredSido]?.total || 0}석)
                            </span>
                            <span className="text-[10px] text-neutral-900 font-normal shrink-0 ml-1">
                                {sidoDominantColor[hoveredSido]?.breakdownText || ''}
                            </span>
                        </div>
                    ) : null
                )}
            </div>

            {/* 3. 지도 본체 SVG */}
            <div className="relative w-full aspect-[500/680] flex items-center justify-center overflow-hidden">
                {svgPaths.length === 0 ? (
                    <div className="text-[10px] text-neutral-400 font-mono animate-pulse">지도 로딩 중...</div>
                ) : (
                    <svg
                        viewBox={currentViewBox}
                        className="w-full h-full drop-shadow-xs transition-all duration-500 ease-out"
                    >
                        {selectedSido === null ? (
                            // =========================================================================
                            // [1단계: 17개 시·도 모드] - 다수당 색상 채색 + 17개 시도 분할 흰색 실선
                            // =========================================================================
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
                                            onClick={() => setSelectedSido(sido)}
                                        >
                                            {paths.map((item: any) => (
                                                <path
                                                    key={`sido-path-${item.id}`}
                                                    d={item.pathD}
                                                    fill={dominant.color}
                                                    stroke={dominant.color}
                                                    strokeWidth="1.2"
                                                    className={isHovered ? 'brightness-125' : ''}
                                                />
                                            ))}
                                        </g>
                                    );
                                })}

                                {/* 17개 시·도 사이를 가르는 선명하고 얇은 화이트 실선 (두께 고정) */}
                                {sidoBoundaryPathD && (
                                    <path
                                        d={sidoBoundaryPathD}
                                        stroke="#ffffff"
                                        strokeWidth="1.2"
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                        pointerEvents="none"
                                    />
                                )}
                            </>
                        ) : (
                            // =========================================================================
                            // [2단계: 17개 시·도 각각 확대 모드]
                            // 아무리 줌인해도 선 두께가 0.75px 초슬림 실선으로 완벽하게 고정됨!
                            // =========================================================================
                            (groupedPathsBySido[selectedSido] || []).map((item: any) => {
                                const isSelected = selectedPolitician && item.matched?.id === selectedPolitician.id;

                                return (
                                    <path
                                        key={`detail-path-${item.id}`}
                                        d={item.pathD}
                                        fill={item.partyColor}
                                        stroke={isSelected ? '#000000' : 'rgba(255, 255, 255, 0.95)'}
                                        strokeWidth={isSelected ? '1.5' : '0.75'} // ★ 17개 지역 모두 0.75px 초슬림 선 두께 적용
                                        vectorEffect="non-scaling-stroke"        // ★ 지도를 10배 확대해도 선이 절대로 굵어지지 않는 핵심 속성
                                        className="transition-all duration-100 cursor-pointer hover:brightness-110 hover:stroke-black"
                                        onMouseEnter={() => {
                                            setHoveredDistrict({
                                                sggName: item.sggName,
                                                politician: item.matched || null,
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredDistrict(null)}
                                        onClick={() => {
                                            if (item.matched) {
                                                onSelectPolitician(item.matched);
                                            }
                                        }}
                                    />
                                );
                            })
                        )}
                    </svg>
                )}
            </div>

        </div>
    );
};