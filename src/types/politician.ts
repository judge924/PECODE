export type PoliticianLevel = 'NATIONAL' | 'METROPOLITAN' | 'LOCAL';

export type PartyType =
  | '더불어민주당'
  | '국민의힘'
  | '조국혁신당'
  | '개혁신당'
  | '진보당'
  | '기본소득당'
  | '사회민주당'
  | '새로운미래'
  | '무소속';

export interface Bill {
  id: string;
  title: string;
  proposeDate: string;
  status: '계류' | '원안가결' | '수정가결' | '폐기';
  summary: string;
}

export interface Pledge {
  id: string;
  title: string;
  category: string;
  progress: '완료' | '추진중' | '보류/검토';
  description: string;
}

export interface Politician {
  id: string;
  name: string;
  hanjaName?: string;
  birthDate: string;
  photoUrl: string;
  level: PoliticianLevel;
  levelLabel: string; // '국회의원' | '서울특별시의원' | '마포구의원' 등
  party: PartyType;
  partyRole?: string;       // 정당 내 직책: '당대표' | '원내대표' | '정책위의장' | '사무총장' | '최고위원' | undefined(일반 의원)
  partyRoleOrder?: number;  // 조직도 배치 순서: 1=당대표, 2=원내대표, 3=정책위의장, 4=사무총장, 5=최고위원
  isAssemblyMember?: boolean;
  electedTerms?: number[]; // 당선된 대수 목록, 예: [21, 22]
  metroRegion: string; // 예: '서울특별시'
  localRegion: string; // 예: '마포구'
  district: string; // 예: '마포구 갑', '마포구 제1선거구', '마포구 가선거구'
  roleTitle: string; // 예: '국회의원', '행정기획위원장', '부의장'
  committee: string; // 예: '기획재정위원회', '도시안전건설위원회'
  term: string; // 예: '제22대', '제11대', '제9대'
  timesElected: number; // 1선, 2선 등

  // 3대 핵심 팩트 지표
  attendanceRate: number; // 출석률 (%)
  billsCount: number; // 대표발의 건수
  propertyAsset: number; // 신고재산 (단위: 억 원)

  // 상세 정보
  career: string[];
  bills: Bill[];
  pledges: Pledge[];
  contact: {
    office?: string;
    phone?: string;
    email?: string;
    blogOrSns?: string;
  };
}

export interface RegionHierarchy {
  metroRegion: string;
  localRegion: string;
  nationalAssembly: Politician[]; // 국회의원 (중앙)
  metroCouncil: Politician[]; // 광역의원 (시의원)
  localCouncil: Politician[]; // 기초의원 (구의원)
}