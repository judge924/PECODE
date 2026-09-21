// 대한민국 국회 열린국회정보 API 기준 제22대 국회의원 데이터
// ⚠️ 이 파일은 더 이상 데이터를 직접 담고 있지 않습니다.
// 실제 데이터는 politicians.json 에 있고, npm run update-data 실행할 때마다 갱신됩니다.
import type { Politician, PartyType } from '../types/politician';
import rawData from './politicians.json';

// "초선", "재선" 숫자를 라벨 문자열로 바꿔주는 헬퍼
function buildLevelLabel(term: string, timesElected: number): string {
  const labels = ['', '초선', '재선', '3선', '4선', '5선', '6선', '7선', '8선'];
  const electedLabel = labels[timesElected] ?? `${timesElected}선`;
  return `국회의원 (${term} · ${electedLabel})`;
}

// politicians.json의 각 항목을 Politician 타입 모양에 맞게 변환
export const NATIONAL_ASSEMBLY_299: Politician[] = (rawData as any[]).map((p) => ({
  id: `na-22-${p.id}`,
  name: p.name,
  hanjaName: p.hanjaName,
  birthDate: p.birthDate,
  photoUrl: p.photoUrl || '',
  level: 'NATIONAL',
  levelLabel: p.isAssemblyMember === false
    ? (p.partyRole || '당직자')
    : buildLevelLabel(p.term, p.timesElected),
  party: p.party as PartyType,
  partyRole: p.partyRole,
  partyRoleOrder: p.partyRoleOrder,
  isAssemblyMember: p.isAssemblyMember,
  metroRegion: p.metroRegion,
  localRegion: p.localRegion,
  district: p.district,
  roleTitle: p.roleTitle,
  committee: p.committee,
  term: p.term,
  timesElected: p.timesElected,
  attendanceRate: p.attendanceRate,
  billsCount: p.billsCount,
  propertyAsset: p.propertyAsset,
  career: p.career,
  bills: p.bills,       // 아직 실제 API 연동 전 → 빈 배열로 들어옵니다
  pledges: p.pledges,   // 아직 공식 데이터 없음 → 빈 배열로 들어옵니다
  contact: {
    office: p.contact?.office,
    phone: p.contact?.phone,
    email: p.contact?.email,
    blogOrSns: p.contact?.blogOrSns,
  },
}));