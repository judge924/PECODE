import type { Politician, RegionHierarchy } from '../types/politician';
import { NATIONAL_ASSEMBLY_299 } from './nationalPoliticians';

// 1. 서울 마포구 광역/기초의원
export const MAPO_LOCAL_COUNCIL: Politician[] = [
  {
    id: 'mapo-mc-1',
    name: '김기덕',
    hanjaName: '金基德',
    birthDate: '1954.02.10',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    level: 'METROPOLITAN',
    levelLabel: '서울시의원 (제11대)',
    party: '더불어민주당',
    metroRegion: '서울특별시',
    localRegion: '마포구',
    district: '마포구 제4선거구 (상암·성산)',
    roleTitle: '서울시의회 의원',
    committee: '문화체육관광위원회',
    term: '제11대',
    timesElected: 4,
    attendanceRate: 97.5,
    billsCount: 19,
    propertyAsset: 8.6,
    career: [
      '제11대 서울특별시의회 의원',
      '제10대 서울특별시의회 부의장',
      '서울특별시의회 항공기 소음특별위원회 위원장'
    ],
    bills: [
      {
        id: 'b-301',
        title: '서울특별시 한강공원 보전 및 이용에 관한 조례 일부개정조례안',
        proposeDate: '2024-05-10',
        status: '원안가결',
        summary: '난지한강공원 생태계 복원 구역 확대 및 야간 소음 저감 규정 신설.'
      }
    ],
    pledges: [
      {
        id: 'p-301',
        title: '성산동 노후 아파트 재건축 신속통합기획 지원',
        category: '주거환경',
        progress: '추진중',
        description: '서울시 도시계획위원회 정비구역 지정 통과'
      }
    ],
    contact: {
      office: '서울특별시의회 의원회관 412호',
      phone: '02-3705-1234',
      email: 'kd_kim@smc.seoul.kr'
    }
  },
  {
    id: 'mapo-mc-2',
    name: '소영철',
    hanjaName: '蘇榮澈',
    birthDate: '1974.11.03',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    level: 'METROPOLITAN',
    levelLabel: '서울시의원 (제11대)',
    party: '국민의힘',
    metroRegion: '서울특별시',
    localRegion: '마포구',
    district: '마포구 제2선거구 (공덕·아현·도화)',
    roleTitle: '서울시의회 기획경제위원',
    committee: '기획경제위원회',
    term: '제11대',
    timesElected: 1,
    attendanceRate: 96.8,
    billsCount: 15,
    propertyAsset: 22.4,
    career: [
      '제11대 서울특별시의회 의원',
      '마포구 체육회 이사'
    ],
    bills: [
      {
        id: 'b-303',
        title: '서울특별시 소상공인 지원 기본 조례 일부개정조례안',
        proposeDate: '2024-06-18',
        status: '원안가결',
        summary: '골목상권 활성화를 위한 로컬 크리에이터 지원 바우처 제도 도입.'
      }
    ],
    pledges: [
      {
        id: 'p-303',
        title: '공덕역 지하보도 환경 개선 및 안전 펜스 전면 교체',
        category: '안전/교통',
        progress: '완료',
        description: '시비 15억 투입 스마트 안심거리 조성'
      }
    ],
    contact: {
      office: '서울특별시의회 의원회관 505호',
      phone: '02-3705-5678',
      email: 'yc_so@smc.seoul.kr'
    }
  },
  {
    id: 'mapo-lc-1',
    name: '차해영',
    hanjaName: '車海永',
    birthDate: '1986.08.12',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    level: 'LOCAL',
    levelLabel: '마포구의원 (제9대)',
    party: '더불어민주당',
    metroRegion: '서울특별시',
    localRegion: '마포구',
    district: '마포구 라선거구 (서교·망원1·연남)',
    roleTitle: '마포구의회 의원',
    committee: '행정건설위원회',
    term: '제9대',
    timesElected: 1,
    attendanceRate: 100.0,
    billsCount: 22,
    propertyAsset: 2.3,
    career: [
      '제9대 마포구의회 의원',
      '연남동 골목상권 상생협의체 기획위원'
    ],
    bills: [
      {
        id: 'b-401',
        title: '서울특별시 마포구 1인가구 지원 조례안',
        proposeDate: '2024-04-12',
        status: '원안가결',
        summary: '마포구 내 급증하는 1인 청년 및 독거노인 안심 네트워크 및 식생활 지원.'
      }
    ],
    pledges: [
      {
        id: 'p-401',
        title: '연남·서교 젠트리피케이션 방지 상생 협약 체결',
        category: '소상공인',
        progress: '추진중',
        description: '임대인-임차인 상생협의체 정례화'
      }
    ],
    contact: {
      office: '마포구의회 3층 의원실',
      phone: '02-3153-6101',
      email: 'hy_cha@mapo.go.kr'
    }
  },
  {
    id: 'mapo-lc-2',
    name: '백남환',
    hanjaName: '白南煥',
    birthDate: '1962.03.14',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    level: 'LOCAL',
    levelLabel: '마포구의원 (제9대 의장)',
    party: '국민의힘',
    metroRegion: '서울특별시',
    localRegion: '마포구',
    district: '마포구 다선거구 (공덕동)',
    roleTitle: '마포구의회 의장',
    committee: '의장단 (운영위원회)',
    term: '제9대',
    timesElected: 3,
    attendanceRate: 98.6,
    billsCount: 16,
    propertyAsset: 17.5,
    career: [
      '제9대 마포구의회 후반기 의장',
      '마포구 민주평통 자문위원'
    ],
    bills: [
      {
        id: 'b-403',
        title: '서울특별시 마포구 노인복지 증진 조례 일부개정조례안',
        proposeDate: '2024-03-25',
        status: '원안가결',
        summary: '경로당 급식 도우미 파견 확대 및 시설 안전점검 정례화.'
      }
    ],
    pledges: [
      {
        id: 'p-403',
        title: '공덕동 주민커뮤니티 복합센터 신축',
        category: '주민복지',
        progress: '추진중',
        description: '착공 승인 및 2025년 완공 목표'
      }
    ],
    contact: {
      office: '마포구의회 3층 의장실',
      phone: '02-3153-6100',
      email: 'nh_baek@mapo.go.kr'
    }
  },
  {
    id: 'mapo-lc-3',
    name: '강동오',
    hanjaName: '姜東午',
    birthDate: '1966.07.29',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    level: 'LOCAL',
    levelLabel: '마포구의원 (제9대)',
    party: '국민의힘',
    metroRegion: '서울특별시',
    localRegion: '마포구',
    district: '마포구 바선거구 (용강·신수)',
    roleTitle: '마포구의회 부의장',
    committee: '의회운영위원회',
    term: '제9대',
    timesElected: 2,
    attendanceRate: 95.4,
    billsCount: 12,
    propertyAsset: 13.1,
    career: [
      '제9대 마포구의회 전반기 부의장',
      '마포문화원 이사'
    ],
    bills: [
      {
        id: 'b-404',
        title: '서울특별시 마포구 전통시장 및 상점가 육성을 위한 조례안',
        proposeDate: '2024-05-30',
        status: '원안가결',
        summary: '용강동 맛깨비길 야간 푸드페스티벌 구비 지원.'
      }
    ],
    pledges: [
      {
        id: 'p-404',
        title: '용강동 음식문화거리 보행환경 개선',
        category: '상권활성화',
        progress: '완료',
        description: '보도블록 교체 및 경관조명 설치'
      }
    ],
    contact: {
      office: '마포구의회 3층 의원실',
      phone: '02-3153-6102',
      email: 'do_kang@mapo.go.kr'
    }
  }
];

// 2. 서울 강남구 광역/기초의원
export const GANGNAM_LOCAL_COUNCIL: Politician[] = [
  {
    id: 'gn-mc-1',
    name: '김형재',
    hanjaName: '金亨載',
    birthDate: '1967.09.15',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    level: 'METROPOLITAN',
    levelLabel: '서울시의원 (제11대)',
    party: '국민의힘',
    metroRegion: '서울특별시',
    localRegion: '강남구',
    district: '강남구 제2선거구 (역삼·논현)',
    roleTitle: '서울시의원',
    committee: '도시안전건설위원회',
    term: '제11대',
    timesElected: 1,
    attendanceRate: 97.2,
    billsCount: 17,
    propertyAsset: 45.1,
    career: [
      '제11대 서울특별시의회 의원',
      '서울시의회 통일안보지원특별위원회 위원장'
    ],
    bills: [
      {
        id: 'b-601',
        title: '서울특별시 빗물받이 관리 및 침수 방지 조례안',
        proposeDate: '2024-05-18',
        status: '원안가결',
        summary: '강남역 일대 대형 빗물배수터널 공사 감독 및 스마트 센서 구축.'
      }
    ],
    pledges: [
      {
        id: 'p-601',
        title: '강남역 일대 대심도 빗물배수터널 조기 준공',
        category: '방재/안전',
        progress: '추진중',
        description: '총사업비 3,800억 확보 및 굴착 착수'
      }
    ],
    contact: {
      office: '서울특별시의회 의원회관 611호',
      phone: '02-3705-4321',
      email: 'hj_kim@smc.seoul.kr'
    }
  },
  {
    id: 'gn-lc-1',
    name: '이호석',
    hanjaName: '李鎬錫',
    birthDate: '1987.01.20',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    level: 'LOCAL',
    levelLabel: '강남구의원 (제9대)',
    party: '국민의힘',
    metroRegion: '서울특별시',
    localRegion: '강남구',
    district: '강남구 라선거구 (역삼1·2동)',
    roleTitle: '강남구의회 의원',
    committee: '행정재경위원회',
    term: '제9대',
    timesElected: 1,
    attendanceRate: 99.0,
    billsCount: 14,
    propertyAsset: 9.8,
    career: [
      '제9대 강남구의회 의원',
      '강남구 1인가구 안심동행 자문위원'
    ],
    bills: [
      {
        id: 'b-701',
        title: '서울특별시 강남구 야간 소음 저감 및 쾌적한 주거환경 지원 조례안',
        proposeDate: '2024-06-12',
        status: '원안가결',
        summary: '역삼동 원룸 밀집지역 배달 오토바이 소음 단속.'
      }
    ],
    pledges: [
      {
        id: 'p-701',
        title: '역삼동 원룸가 스마트 안심 귀갓길 10개소 완공',
        category: '주민안전',
        progress: '완료',
        description: 'CCTV 및 비상벨 증설 완료'
      }
    ],
    contact: {
      office: '강남구의회 4층 의원실',
      phone: '02-3423-7150',
      email: 'hs_lee@gangnam.go.kr'
    }
  }
];

// Helper: Filter National Assembly members by region query
const getNationalMembers = (query: string) => {
  return NATIONAL_ASSEMBLY_299.filter((p) => p.district.includes(query));
};

export const REGIONS_DATA: Record<string, RegionHierarchy> = {
  '대한민국 국회': {
    metroRegion: '대한민국',
    localRegion: '국회',
    nationalAssembly: NATIONAL_ASSEMBLY_299,
    metroCouncil: [],
    localCouncil: []
  },
  '마포구': {
    metroRegion: '서울특별시',
    localRegion: '마포구',
    nationalAssembly: getNationalMembers('마포'),
    metroCouncil: MAPO_LOCAL_COUNCIL.filter((p) => p.level === 'METROPOLITAN'),
    localCouncil: MAPO_LOCAL_COUNCIL.filter((p) => p.level === 'LOCAL')
  },
  '강남구': {
    metroRegion: '서울특별시',
    localRegion: '강남구',
    nationalAssembly: getNationalMembers('강남'),
    metroCouncil: GANGNAM_LOCAL_COUNCIL.filter((p) => p.level === 'METROPOLITAN'),
    localCouncil: GANGNAM_LOCAL_COUNCIL.filter((p) => p.level === 'LOCAL')
  },
  '종로구': {
    metroRegion: '서울특별시',
    localRegion: '종로구',
    nationalAssembly: getNationalMembers('종로'),
    metroCouncil: [],
    localCouncil: []
  },
  '분당구': {
    metroRegion: '경기도 성남시',
    localRegion: '분당구',
    nationalAssembly: getNationalMembers('분당'),
    metroCouncil: [],
    localCouncil: []
  },
  '해운대구': {
    metroRegion: '부산광역시',
    localRegion: '해운대구',
    nationalAssembly: getNationalMembers('해운대'),
    metroCouncil: [],
    localCouncil: []
  }
};

// All politicians (All 299 National Assembly members + all local council members)
export const ALL_POLITICIANS: Politician[] = [
  ...NATIONAL_ASSEMBLY_299,
  ...MAPO_LOCAL_COUNCIL,
  ...GANGNAM_LOCAL_COUNCIL
];
