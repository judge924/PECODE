import React from 'react';

// 3권 분립 헌법기관 핵심 인물 데이터 인터페이스
interface CylinderItem {
    id: string;
    role: string;
    name: string;
    sub: string;
    imageUrl: string;
}

// 1. 입법부 (국회) 데이터 (12면 실린더)
const LEGISLATIVE_ITEMS: CylinderItem[] = [
    { id: 'leg-1', role: '국회의장', name: '우원식', sub: '제22대 국회 전반기', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-2', role: '더불어민주당 원내대표', name: '박찬대', sub: '원내 제1당 (170석)', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-3', role: '국민의힘 원내대표', name: '추경호', sub: '원내 제2당 (108석)', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-4', role: '조국혁신당 대표', name: '조국', sub: '원내 제3당 (12석)', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-5', role: '개혁신당 원내대표', name: '천하람', sub: '비교섭단체 (3석)', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-6', role: '진보당 원내대표', name: '윤종오', sub: '비교섭단체 (3석)', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-7', role: '국회 법제사법위원장', name: '정청래', sub: '상임위원회', imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-8', role: '국회 예산결산특별위원장', name: '박정', sub: '특별위원회', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-9', role: '국회사무총장', name: '김민기', sub: '국회사무처', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-10', role: '국회 입법차장', name: '진선희', sub: '입법지원처', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-11', role: '국회도서관장', name: '이명우', sub: '국회 소속기관', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    { id: 'leg-12', role: '제22대 국회', name: '300인 의석도', sub: '국민의 대의기관', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

// 2. 행정부 (대통령실) 데이터 (12면 실린더)
const EXECUTIVE_ITEMS: CylinderItem[] = [
    { id: 'exe-1', role: '대한민국 대통령', name: '윤석열', sub: '제20대 대통령실', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-2', role: '국무총리', name: '한덕수', sub: '행정부 총괄', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-3', role: '경제부총리 겸 기재부장관', name: '최상목', sub: '기획재정부', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-4', role: '사회부총리 겸 교육부장관', name: '이주호', sub: '교육부', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-5', role: '외교부장관', name: '조태열', sub: '외교부', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-6', role: '법무부장관', name: '박성재', sub: '법무부', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-7', role: '국방부장관', name: '김용현', sub: '국방부', imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-8', role: '행정안전부장관', name: '이상민', sub: '행정안전부', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-9', role: '대통령비서실장', name: '정진석', sub: '대통령비서실', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-10', role: '국가안보실장', name: '신원식', sub: '국가안보실', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-11', role: '정책실장', name: '성태윤', sub: '대통령실 정책실', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    { id: 'exe-12', role: '대통령실 대변인', name: '정혜전', sub: '대변인실', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

// 3. 사법부 (대법원 및 헌법재판소) 데이터 (12면 실린더)
const JUDICIAL_ITEMS: CylinderItem[] = [
    { id: 'jud-1', role: '대법원장', name: '조희대', sub: '사법부 수장', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-2', role: '헌법재판소장', name: '이종석', sub: '헌법의 수호자', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-3', role: '선임대법관', name: '김재형', sub: '대법원', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-4', role: '법원행정처장', name: '천대엽', sub: '대법관 겸직', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-5', role: '대법관', name: '노태악', sub: '중앙선거관리위원장', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-6', role: '대법관', name: '이흥구', sub: '대법원', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-7', role: '헌법재판관', name: '문형배', sub: '헌법재판소', imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-8', role: '헌법재판관', name: '이미선', sub: '헌법재판소', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-9', role: '헌법재판관', name: '김기영', sub: '헌법재판소', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-10', role: '대법관', name: '오경미', sub: '대법원', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-11', role: '대법관', name: '엄상필', sub: '대법원', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    { id: 'jud-12', role: '대법관', name: '신숙희', sub: '대법원', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
];

// 단일 3D 실린더 링 컴포넌트
interface CylinderBandProps {
    title: string;
    items: CylinderItem[];
    animationClass: string;
    cardWidth?: number; // 카드 너비 (기본 180px)
}

const CylinderBand: React.FC<CylinderBandProps> = ({ title, items, animationClass, cardWidth = 190 }) => {
    const panelCount = items.length;
    // 12각기둥의 정확한 기하학적 반지름 계산: r = (w / 2) / tan(PI / panelCount)
    const anglePerPanel = 360 / panelCount;
    const radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / panelCount));

    return (
        <div className="relative w-full h-[155px] md:h-[185px] flex items-center justify-center my-[-10px] md:my-[-14px]">
            {/* 3D 실린더 회전 턴테이블 */}
            <div
                className={`w-[190px] h-[130px] md:h-[148px] relative preserve-3d will-change-transform ${animationClass}`}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {items.map((item, index) => {
                    const rotationAngle = index * anglePerPanel;
                    return (
                        <div
                            key={item.id}
                            className="absolute inset-0 backface-visible flex items-center"
                            style={{
                                transform: `rotateY(${rotationAngle}deg) translateZ(${radius}px)`,
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            {/* 애플 블랙티켓 카드 바디 */}
                            <div className="w-[185px] md:w-[190px] h-[110px] md:h-[125px] rounded-[18px] bg-black/85 border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl p-3 flex items-center gap-3 transition-all duration-300 hover:border-white/40">
                                {/* 흑백 인물 포트레이트 (스퀘어 라운드) */}
                                <div className="relative w-[50px] h-[50px] md:w-[56px] md:h-[56px] rounded-[14px] overflow-hidden bg-white/[0.05] border border-white/10 shrink-0">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover grayscale contrast-125"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                {/* 텍스트 메타 정보 (Apple SF Pro 타이포 규격) */}
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[10px] md:text-[11px] font-medium tracking-tight text-white/45 truncate">
                                        {item.role}
                                    </span>
                                    <span className="text-[14px] md:text-[15px] font-bold tracking-tight text-white/95 truncate mt-0.5">
                                        {item.name}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] text-white/30 truncate mt-0.5">
                                        {item.sub}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const PowerRingsHero: React.FC = () => {
    return (
        <div className="relative w-full h-[calc(100vh-44px)] bg-[#050505] overflow-hidden flex flex-col items-center justify-center select-none">
            {/* 1. 배경 미세 비네팅 조명 (Apple Dark Space) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04)_0%,transparent_75%)] pointer-events-none" />

            {/* 2. 화면 정중앙 수직 스캔 라인 (White Accent Laser) */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent z-30 pointer-events-none" />
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[28px] bg-gradient-to-b from-transparent via-white/[0.03] to-transparent blur-sm z-20 pointer-events-none" />

            {/* 3. 3차원 실린더 스택 무대 (Perspective 1200px 원근감) */}
            <div
                className="relative z-10 w-full flex flex-col items-center justify-center"
                style={{ perspective: '1100px', perspectiveOrigin: '50% 50%' }}
            >
                {/* 상단 밴드: [입법부 - 국회] 시계 방향 공전 */}
                <CylinderBand
                    title="입법부"
                    items={LEGISLATIVE_ITEMS}
                    animationClass="animate-spin-cylinder-cw"
                />

                {/* 중단 밴드: [행정부 - 대통령실] 반시계 방향 교차 공전 */}
                <CylinderBand
                    title="행정부"
                    items={EXECUTIVE_ITEMS}
                    animationClass="animate-spin-cylinder-ccw"
                />

                {/* 하단 밴드: [사법부 - 대법원·헌재] 묵직한 초저속 안정 공전 */}
                <CylinderBand
                    title="사법부"
                    items={JUDICIAL_ITEMS}
                    animationClass="animate-spin-cylinder-slow"
                />
            </div>

            {/* 인라인 3D 회전 애니메이션 스타일 */}
            <style>{`
        @keyframes spinCylinderCW {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes spinCylinderCCW {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(-360deg); }
        }
        @keyframes spinCylinderSlow {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .animate-spin-cylinder-cw {
          animation: spinCylinderCW 45s linear infinite;
        }
        .animate-spin-cylinder-ccw {
          animation: spinCylinderCCW 55s linear infinite;
        }
        .animate-spin-cylinder-slow {
          animation: spinCylinderSlow 90s linear infinite;
        }
        /* 마우스 호버 시 부드러운 일시 정지 (정밀 탐색용) */
        .preserve-3d:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default PowerRingsHero;