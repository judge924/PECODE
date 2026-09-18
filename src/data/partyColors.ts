// 각 정당 공식 사이트 기준 공식 상징색
// - 더불어민주당: https://www.minjoo.kr  → #003B96 (파란색)
// - 국민의힘: https://www.peoplepowerparty.kr → #E61E2B (빨간색)
// - 조국혁신당: https://rebuilding.kr → #0073CF (트루블루)
// - 개혁신당: https://reformparty.kr (CSS --primary) → #FF7210 (개혁오렌지)
// - 진보당: → #E60020 (빨간색 계열)
// - 기본소득당: https://basicincomeparty.kr → #00D2C3 (민트그린)
// - 사회민주당: https://samindang.kr → #F58400 (오렌지)
// - 새로운미래: 파란색 계열 → #2563EB
// - 무소속: 뉴트럴 그레이 → #6B7280

export const PARTY_COLORS: Record<string, string> = {
  '더불어민주당': '#003B96',
  '국민의힘': '#E61E2B',
  '조국혁신당': '#0073CF',
  '개혁신당': '#FF7210',
  '진보당': '#E60020',
  '기본소득당': '#00D2C3',
  '사회민주당': '#F58400',
  '새로운미래': '#2563EB',
  '무소속': '#6B7280',
};

export const PARTY_COLORS_LIGHT: Record<string, string> = {
  '더불어민주당': '#EFF4FF',
  '국민의힘': '#FFF1F1',
  '조국혁신당': '#EFF6FF',
  '개혁신당': '#FFF4EE',
  '진보당': '#FFF1F1',
  '기본소득당': '#ECFFFE',
  '사회민주당': '#FFF5E6',
  '새로운미래': '#EFF6FF',
  '무소속': '#F3F4F6',
};

export function getPartyColor(party: string): string {
  return PARTY_COLORS[party] ?? '#6B7280';
}

export function getPartyColorLight(party: string): string {
  return PARTY_COLORS_LIGHT[party] ?? '#F3F4F6';
}
