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
const SERVICE_ID = 'ALLNAMEMBER';
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

const PARTY_ALIASES = {
    '국민의미래': '국민의힘',
    '더불어민주연합': '더불어민주당',
};

// ⭐️ [핵심 방어벽 1] 국회 API가 엉뚱하게 민주당/무소속으로 줘도 무조건 강제 고정하는 정당 목록!
// 깃허브 액션이 새벽마다 돌아도 이 명단은 100% 절대 덮어써지지 않습니다.
const MANUAL_PARTY_OVERRIDES = {
    '용혜인': '기본소득당', // 기본소득당 1석
    '한창민': '사회민주당', // 사회민주당 1석
    '윤종오': '진보당',     // 진보당 4석 (울산 북구)
    '전종덕': '진보당',     // 진보당 비례
    '정혜경': '진보당',     // 진보당 비례
    '손솔': '진보당',       // 진보당 비례 승계
};

// 탈당/제명 등으로 무소속이 된 의원 수동 처리
const MANUAL_INDEPENDENT_NAMES = [
    '장경태', '강선우', '김종민', '조정식',
    '김병기', '이춘석', '최혁진', '한동훈',
];

// ⭐️ [핵심 방어벽 2] 국회 API 전산 처리가 늦어져 명단에서 빠진 승계 의원 보충 (손솔 의원 등)
const SUPPLEMENTAL_MEMBERS = [
    {
        name: '손솔',
        party: '진보당',
        district: '비례대표',
        timesElected: 1,
        electedTerms: [22],
        committee: '환경노동위원회',
        photoUrl: 'https://i.namu.wiki/i/2_eZ4_Uo1o0g1Z8m0uKkQvP8e9w1X2y3Z4a5b6c7d8e9f0.webp',
        career: ['제22대 국회의원 (진보당/비례대표)', '진보당 수석대변인'],
        birthDate: '1995-03-10'
    }
];

// 정당 지도부 명단
const PARTY_LEADERSHIP = {
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

function normalizeParty(polyNm, memberName) {
    // ⭐️ 1순위: 사장님이 지정한 수동 오버라이드가 있으면 무조건 그것으로 강제 고정!
    if (memberName && MANUAL_PARTY_OVERRIDES[memberName]) {
        return MANUAL_PARTY_OVERRIDES[memberName];
    }
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

function takeLatest(value) {
    if (!value) return '';
    const parts = String(value).split('/');
    return parts[parts.length - 1].trim();
}

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

function toThumbnail(picUrl) {
    if (!picUrl) return '';
    if (picUrl.includes('/thumb/')) return picUrl;
    return picUrl.replace('/openassm/new/', '/openassm/new/thumb/');
}

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
            process.exit(1);
        }

        const headInfo = result[0]?.head?.find((h) => 'list_total_count' in h);
        if (headInfo) totalCount = headInfo.list_total_count;

        const rowObj = result.find((item) => item.row);
        const rows = rowObj ? rowObj.row : [];
        allRows = allRows.concat(rows);

        console.log(`   → 누적 ${allRows.length}/${totalCount}건`);
        if (rows.length < pSize) break;
        pIndex++;
    }

    return allRows;
}

async function main() {
    const allRows = await fetchAllRows();
    console.log(`✅ 전체 ${allRows.length}건을 받았습니다.`);

    const EXCLUDED_CODES = ['4A067125'];

    const currentRows = allRows.filter(
        (row) =>
            row.GTELT_ERACO &&
            row.GTELT_ERACO.includes('제22대') &&
            row.DTY_NM &&
            !EXCLUDED_CODES.includes(row.NAAS_CD)
    );
    console.log(`🔍 제22대 현직 의원 필터링 결과: ${currentRows.length}명`);

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
            // ⭐️ 사장님 지정 정당 우선 반영
            party: MANUAL_INDEPENDENT_NAMES.includes(row.NAAS_NM)
                ? '무소속'
                : normalizeParty(takeLatest(row.PLPT_NM), row.NAAS_NM),
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

    // ⭐️ [보충] 국회 API에 아직 승계 반영 안 된 의원(손솔 등) 자동 추가
    const existingNames = new Set(politicians.map(p => p.name));
    for (const sup of SUPPLEMENTAL_MEMBERS) {
        if (!existingNames.has(sup.name)) {
            console.log(`➕ 국회 API 누락 보충 추가: ${sup.name} (${sup.party})`);
            politicians.push({
                id: `supplemental-${sup.name}`,
                name: sup.name,
                hanjaName: '',
                birthDate: sup.birthDate || '',
                photoUrl: sup.photoUrl || '',
                level: 'NATIONAL',
                levelLabel: '국회의원',
                party: sup.party,
                partyRole: undefined,
                partyRoleOrder: undefined,
                isAssemblyMember: true,
                electedTerms: sup.electedTerms || [22],
                metroRegion: '비례대표',
                localRegion: '비례대표',
                district: sup.district || '비례대표',
                roleTitle: '국회의원',
                committee: sup.committee || '',
                term: '제22대',
                timesElected: sup.timesElected || 1,
                attendanceRate: 0,
                billsCount: 0,
                propertyAsset: 0,
                career: sup.career || [],
                bills: [],
                pledges: [],
                contact: {},
            });
        }
    }

    // 비국회의원 당직자 처리
    const nonMpEntries = NON_MP_PARTY_OFFICIALS.map((official, idx) => {
        const leadership = PARTY_LEADERSHIP[official.name];
        const histRow = allRows.find((row) => row.NAAS_NM === official.name);

        if (histRow) {
            const pastDistrict = takeLatest(histRow.ELECD_NM);
            const { metroRegion, localRegion } = parseRegion(pastDistrict);
            return {
                id: histRow.NAAS_CD || `party-official-${idx}`,
                name: official.name,
                hanjaName: histRow.NAAS_CH_NM || '',
                birthDate: histRow.BIRDY_DT || '',
                photoUrl: toThumbnail(histRow.NAAS_PIC),
                level: 'NATIONAL',
                levelLabel: '당직자',
                party: official.party,
                partyRole: leadership?.role,
                partyRoleOrder: leadership?.order,
                isAssemblyMember: false,
                electedTerms: parseElectedTerms(histRow.GTELT_ERACO),
                metroRegion,
                localRegion,
                district: pastDistrict || '비례대표',
                roleTitle: leadership?.role || '',
                committee: '',
                term: takeLatest(histRow.GTELT_ERACO) || '',
                timesElected: parseTimesElected(histRow.RLCT_DIV_NM),
                attendanceRate: 0,
                billsCount: 0,
                propertyAsset: 0,
                career: histRow.BRF_HST
                    ? histRow.BRF_HST.split('\r\n').map((line) => line.trim()).filter(Boolean)
                    : [],
                bills: [],
                pledges: [],
                contact: {},
            };
        }

        return {
            id: `party-official-${idx}`,
            name: official.name,
            hanjaName: '',
            birthDate: '',
            photoUrl: official.photoUrl || '',
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
    console.log(`🎉 완료! 총 ${finalPoliticians.length}명의 데이터를 완벽 방어 저장했습니다.`);
}

main().catch((err) => {
    console.error('❌ 실행 중 오류:', err);
    process.exit(1);
});