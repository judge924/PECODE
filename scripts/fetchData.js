import fs from 'fs';
import path from 'path';

// 내 컴퓨터에서 직접 실행할 때 .env 파일이 있으면 자동으로 키를 읽어옵니다.
if (!process.env.ASSEMBLY_API_KEY && fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const match = envContent.match(/ASSEMBLY_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match) {
        process.env.ASSEMBLY_API_KEY = match[1].trim();
    }
}

const API_KEY = process.env.ASSEMBLY_API_KEY;
const SERVICE_ID = 'ALLNAMEMBER'; // 공식 명세서 기준 서비스 ID (사진 포함!)
const BASE_URL = `https://open.assembly.go.kr/portal/openapi/${SERVICE_ID}`;

if (!API_KEY) {
    console.error('❌ ASSEMBLY_API_KEY가 없습니다. .env 파일에 ASSEMBLY_API_KEY=키값 이 적혀있는지 확인해주세요.');
    process.exit(1);
}

function parseTimesElected(rlctDivNm) {
    const map = {
        '초선': 1, '재선': 2, '3선': 3, '4선': 4, '5선': 5,
        '6선': 6, '7선': 7, '8선': 8, '9선': 9,
    };
    return map[rlctDivNm] ?? 1;
}

const KNOWN_PARTIES = [
    '더불어민주당', '국민의힘', '조국혁신당', '개혁신당',
    '진보당', '기본소득당', '사회민주당', '새로운미래', '무소속',
];

// 위성정당 등 실제로는 다른 정당으로 합당된 경우를 정리
const PARTY_ALIASES = {
    '국민의미래': '국민의힘',
    '더불어민주연합': '더불어민주당',
};

// 국회 API의 정당 데이터는 실시간 반영이 안 돼서, 최근 탈당/제명 등으로
// 무소속이 된 의원이 예전 소속 정당으로 잘못 표시되는 경우가 있습니다.
// 확인된 분들은 이름 기준으로 수동으로 무소속 처리합니다.
// ⚠️ 정계 상황은 계속 바뀌므로 이 목록은 주기적으로 업데이트가 필요합니다.
const MANUAL_INDEPENDENT_NAMES = [
    '장경태', '강선우', '김종민', '조정식',
    '김병기', '이춘석', '최혁진', '한동훈',
];

// 정당 지도부 명단 (당대표/원내대표/정책위의장/사무총장/최고위원)
// ⚠️ 전당대회 등으로 지도부가 바뀌면 이 목록을 직접 업데이트해야 합니다. (기준일: 2026년 9월)
const PARTY_LEADERSHIP = {
    // ── 국민의힘 ──
    '장동혁': { role: '당대표', order: 1 },
    '정점식': { role: '원내대표', order: 2 },
    '신동욱': { role: '최고위원', order: 3 },
    '김민수': { role: '최고위원', order: 3 },
    '양향자': { role: '최고위원', order: 3 },
    '김재원': { role: '최고위원', order: 3 },
    '우재준': { role: '최고위원', order: 3 },
    '조광한': { role: '최고위원', order: 3 },
    '임이자': { role: '정책위의장', order: 4 },
    '정희용': { role: '사무총장', order: 5 },

    // ── 더불어민주당 ──
    '김민석': { role: '당대표', order: 1 },
    '한병도': { role: '원내대표', order: 2 },
    '최민희': { role: '최고위원', order: 3 },
    '박선원': { role: '최고위원', order: 3 },
    '서미화': { role: '최고위원', order: 3 },
    '이성윤': { role: '최고위원', order: 3 },
    '한민수': { role: '최고위원', order: 3 },
    '전용기': { role: '최고위원', order: 3 },
    '권미경': { role: '최고위원', order: 3 },
    '권칠승': { role: '정책위의장', order: 4 },
    '한정애': { role: '사무총장', order: 5 },
};

// 지도부 중 국회의원이 아닌 당직자 프로필 사진 연동
const NON_MP_PARTY_OFFICIALS = [
    {
        name: '김민수',
        party: '국민의힘',
        photoUrl: 'https://i.namu.wiki/i/3hNg00sBYmh31g_QH-ro7L0qq0_DxKrPOXz3DbLMvU7uv1FAQv_u7mgmOUE1ikZWFwuVst9IJ1ooj0UcTez8FILo8GeC-sFO9fj4kUPZYnBeAnib7MZwmD55kozMdrVR-6waSY4zw4QTRwQyV9tZEQ.webp',
    },
    {
        name: '조광한',
        party: '국민의힘',
        photoUrl: 'https://i.namu.wiki/i/U3SVaCRCT6CQ4oXbYQAgEL5UbAvrWANuo7xBXva1bvxylo9c19TrpFHvGG7KXt5tQNjoJH9uNoHtNwOpRXVOlHuHWoYjmpFCC-cJX0__zsoe27YjCDlscy-D6jEK5BjEBTwcJqErvIHylMtMZJhACQ.webp',
    },
    {
        name: '권미경',
        party: '더불어민주당',
        photoUrl: 'https://i.namu.wiki/i/MCjMWzpg7uI875UnnCMdX9Exgng_2pYzU9zTpxiQhSPTsVZi2yKoonEnDVW8TIeHw3KV55yOXAwSfO6afqnlJy--mlQs1XwVYelMu11Ej86mDMz_yM-vJ13H5rCCrMMlZYfr1yt6EKOKeTru4xrqzQ.webp',
    },
];

function normalizeParty(polyNm) {
    const resolved = PARTY_ALIASES[polyNm] || polyNm;
    if (KNOWN_PARTIES.includes(resolved)) return resolved;
    if (polyNm) console.warn(`⚠️ 목록에 없는 정당명: "${polyNm}" → '무소속'으로 처리`);
    return '무소속';
}

function parseRegion(origNm) {
    if (!origNm || origNm === '비례대표') {
        return { metroRegion: '비례대표', localRegion: '비례대표' };
    }
    const parts = String(origNm).trim().split(' ');
    return {
        metroRegion: parts[0] ?? '',
        localRegion: parts.slice(1).join(' ') || parts[0] || '',
    };
}

// 다선 의원의 경우 "민주정의당/민주자유당/신한국당" 처럼
// '/'로 구분된 역대 이력이 이어붙어 있음. 가장 마지막(최신) 값만 뽑아옵니다.
function takeLatest(value) {
    if (!value) return '';
    const parts = String(value).split('/');
    return parts[parts.length - 1].trim();
}

// "제21대, 제22대" 같은 문자열에서 숫자만 뽑아 [21, 22] 형태로 반환
function parseElectedTerms(gteltEraco) {
    if (!gteltEraco) return [];
    return gteltEraco
        .split(',')
        .map((s) => {
            const m = s.trim().match(/(\d+)대/);
            return m ? parseInt(m[1], 10) : null;
        })
        .filter((n) => n !== null);
}

// 국회 API가 주는 사진은 원본 고화질이라 용량이 큽니다.
// URL에 '/thumb/'을 끼워넣어 미리 축소된 썸네일 버전을 쓰도록 바꿔줍니다.
function toThumbnail(picUrl) {
    if (!picUrl) return '';
    if (picUrl.includes('/thumb/')) return picUrl; // 이미 썸네일이면 그대로
    return picUrl.replace('/openassm/new/', '/openassm/new/thumb/');
}

// ── 1. 전체 페이지 받아오기 (최대 1,000건씩, 총 3,296건이라 4번 나눠 받음) ──
async function fetchAllRows() {
    const pSize = 1000;
    let pIndex = 1;
    let allRows = [];
    let totalCount = Infinity;

    while (allRows.length < totalCount) {
        const url = `${BASE_URL}?KEY=${API_KEY}&Type=json&pIndex=${pIndex}&pSize=${pSize}`;
        console.log(`📡 페이지 ${pIndex} 요청 중... (pSize=${pSize})`);

        const res = await fetch(url);
        if (!res.ok) {
            console.error(`❌ API 요청 실패: ${res.status}`);
            process.exit(1);
        }
        const data = await res.json();
        const result = data[SERVICE_ID];
        if (!Array.isArray(result)) {
            console.error('❌ 예상치 못한 응답 구조입니다.');
            console.log(JSON.stringify(data).slice(0, 500));
            process.exit(1);
        }

        const headInfo = result[0]?.head?.find((h) => 'list_total_count' in h);
        if (headInfo) totalCount = headInfo.list_total_count;

        const rowObj = result.find((item) => item.row);
        const rows = rowObj ? rowObj.row : [];
        allRows = allRows.concat(rows);

        console.log(`   → 누적 ${allRows.length}/${totalCount}건`);

        if (rows.length < pSize) break; // 마지막 페이지
        pIndex++;
    }

    return allRows;
}

async function main() {
    const allRows = await fetchAllRows();
    console.log(`✅ 전체 ${allRows.length}건(역대 전체)을 받았습니다.`);

    // 국회 API 데이터가 실시간으로 완벽히 갱신되지 않아,
    // 이미 사퇴/임명직 전환 등으로 의원이 아닌데도 남아있는 경우가 있습니다.
    // 확인된 예외는 NAAS_CD(국회의원코드) 기준으로 명시적으로 제외합니다.
    const EXCLUDED_CODES = [
        '4A067125', // 이광재 - 제21대 후반기 국회사무총장 역임 후 현재 미의원직 (데이터 오류로 남아있음)
    ];

    // ── 2. 현재 제22대 의원만 필터링 ──
    const currentRows = allRows.filter(
        (row) =>
            row.GTELT_ERACO &&
            row.GTELT_ERACO.includes('제22대') &&
            row.DTY_NM && // 직책명이 있어야 "현재 활동 중"으로 간주
            !EXCLUDED_CODES.includes(row.NAAS_CD)
    );
    console.log(`🔍 제22대 현직 의원 필터링 결과: ${currentRows.length}명`);

    // ── 3. 우리 프로젝트 형태로 변환 ──
    const politicians = currentRows.map((row) => {
        const currentDistrict = takeLatest(row.ELECD_NM);
        const { metroRegion, localRegion } = parseRegion(currentDistrict);

        return {
            id: row.NAAS_CD,
            name: row.NAAS_NM,
            hanjaName: row.NAAS_CH_NM || '',
            birthDate: row.BIRDY_DT || '',
            photoUrl: toThumbnail(row.NAAS_PIC),
            level: 'NATIONAL',
            levelLabel: '국회의원',
            party: MANUAL_INDEPENDENT_NAMES.includes(row.NAAS_NM)
                ? '무소속'
                : normalizeParty(takeLatest(row.PLPT_NM)),
            partyRole: PARTY_LEADERSHIP[row.NAAS_NM]?.role,
            partyRoleOrder: PARTY_LEADERSHIP[row.NAAS_NM]?.order,
            isAssemblyMember: true,
            electedTerms: parseElectedTerms(row.GTELT_ERACO),
            metroRegion,
            localRegion,
            district: currentDistrict || '비례대표',
            roleTitle: '국회의원',
            committee: takeLatest(row.BLNG_CMIT_NM),
            term: '제22대',
            timesElected: parseTimesElected(row.RLCT_DIV_NM),
            attendanceRate: 0,
            billsCount: 0,
            propertyAsset: 0,
            career: row.BRF_HST
                ? row.BRF_HST.split('\r\n').map((line) => line.trim()).filter(Boolean)
                : [],
            bills: [],
            pledges: [],
            contact: {
                phone: row.NAAS_TEL_NO || '',
                email: row.NAAS_EMAIL_ADDR || '',
                blogOrSns: row.NAAS_HP_URL || '',
            },
        };
    });

    // ── 정당 지도부 중 국회의원이 아닌 사람 찾아내기 ──
    const matchedNames = politicians.map((p) => p.name);
    const unmatchedLeaders = Object.keys(PARTY_LEADERSHIP).filter(
        (name) => !matchedNames.includes(name)
    );
    if (unmatchedLeaders.length > 0) {
        console.log(`\n⚠️ 국회의원이 아닌 당직자 (NON_MP_PARTY_OFFICIALS에 추가 필요): ${unmatchedLeaders.join(', ')}`);
    }

    // ── 비국회의원 당직자 처리 (이미 받아둔 역대 3,296명 명단에서 과거 당선 이력 자동 매칭!) ──
    const nonMpEntries = NON_MP_PARTY_OFFICIALS.map((official, idx) => {
        const leadership = PARTY_LEADERSHIP[official.name];
        // 3,296건의 역대 전체 의원 명단(allRows)에서 해당 이름의 전직 의원 데이터가 있는지 자동 검색!
        const histRow = allRows.find((row) => row.NAAS_NM === official.name);

        if (histRow) {
            console.log(`✨ 전직 국회의원 당직자 발견: ${official.name} (선출 대수: ${histRow.GTELT_ERACO || '기록 없음'})`);
            const pastDistrict = takeLatest(histRow.ELECD_NM);
            const { metroRegion, localRegion } = parseRegion(pastDistrict);

            return {
                id: histRow.NAAS_CD || `party-official-${idx}`,
                name: official.name,
                hanjaName: histRow.NAAS_CH_NM || '',
                birthDate: histRow.BIRDY_DT || '',
                photoUrl: toThumbnail(histRow.NAAS_PIC), // 과거 국회 공식 사진 자동 연동
                level: 'NATIONAL',
                levelLabel: '당직자',
                party: official.party,
                partyRole: leadership?.role,
                partyRoleOrder: leadership?.order,
                isAssemblyMember: false, // 22대 현역은 아니므로 false
                electedTerms: parseElectedTerms(histRow.GTELT_ERACO), // 과거 당선 대수 [21] 자동 추출!
                metroRegion,
                localRegion,
                district: pastDistrict || '비례대표',
                roleTitle: leadership?.role || '',
                committee: '',
                term: takeLatest(histRow.GTELT_ERACO) || '',
                timesElected: parseTimesElected(histRow.RLCT_DIV_NM), // 1선 자동 파싱!
                attendanceRate: 0,
                billsCount: 0,
                propertyAsset: 0,
                career: histRow.BRF_HST
                    ? histRow.BRF_HST.split('\r\n').map((line) => line.trim()).filter(Boolean)
                    : [],
                bills: [],
                pledges: [],
                contact: {
                    phone: histRow.NAAS_TEL_NO || '',
                    email: histRow.NAAS_EMAIL_ADDR || '',
                    blogOrSns: histRow.NAAS_HP_URL || '',
                },
            };
        }

        // 역대 국회의원 이력이 전혀 없는 순수 당직자 (예: 김민수, 조광한 등)
        return {
            id: `party-official-${idx}`,
            name: official.name,
            hanjaName: '',
            birthDate: '',
            photoUrl: official.photoUrl || '', // 나무위키 사진 주소 자동 반영
            level: 'NATIONAL',
            levelLabel: '당직자',
            party: official.party,
            partyRole: leadership?.role,
            partyRoleOrder: leadership?.order,
            isAssemblyMember: false,
            electedTerms: [],
            metroRegion: '',
            localRegion: '',
            district: '',
            roleTitle: leadership?.role || '',
            committee: '',
            term: '',
            timesElected: 0,
            attendanceRate: 0,
            billsCount: 0,
            propertyAsset: 0,
            career: [],
            bills: [],
            pledges: [],
            contact: {},
        };
    });

    const finalPoliticians = [...politicians, ...nonMpEntries];

    const outputPath = path.resolve('src/data/politicians.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalPoliticians, null, 2), 'utf-8');
    console.log(`🎉 완료! ${finalPoliticians.length}명의 데이터를 저장했습니다. (국회의원 ${politicians.length}명 + 당직자 ${nonMpEntries.length}명)`);
}

main().catch((err) => {
    console.error('❌ 실행 중 오류:', err);
    process.exit(1);
});