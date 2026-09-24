import fs from 'fs';
import path from 'path';

// .env 키 로드
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
    console.error('❌ ASSEMBLY_API_KEY가 없습니다.');
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

// ⭐️ [소수정당 영구 고정 방어벽]
const MANUAL_PARTY_OVERRIDES = {
    '용혜인': '기본소득당',
    '한창민': '사회민주당',
    '윤종오': '진보당',
    '전종덕': '진보당',
    '정혜경': '진보당',
    '손솔': '진보당',
};

const MANUAL_INDEPENDENT_NAMES = [
    '장경태', '강선우', '김종민', '조정식',
    '김병기', '이춘석', '최혁진', '한동훈',
];

// 손솔 의원 등 국회 API 미등록 승계의원 보충
const SUPPLEMENTAL_MEMBERS = [
    {
        name: '손솔',
        party: '진보당',
        district: '비례대표',
        timesElected: 1,
        electedTerms: [22],
        termsDetails: [{ term: 22, district: '비례대표', isProportional: true }],
        committee: '환경노동위원회',
        photoUrl: 'https://i.namu.wiki/i/2_eZ4_Uo1o0g1Z8m0uKkQvP8e9w1X2y3Z4a5b6c7d8e9f0.webp',
        career: ['제22대 국회의원 (진보당/비례대표)', '진보당 수석대변인'],
        birthDate: '1995-03-10'
    }
];

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
    if (memberName && MANUAL_PARTY_OVERRIDES[memberName]) {
        return MANUAL_PARTY_OVERRIDES[memberName];
    }
    const resolved = PARTY_ALIASES[polyNm] || polyNm;
    if (KNOWN_PARTIES.includes(resolved)) return resolved;
    return '무소속';
}

function parseRegion(origNm) {
    if (!origNm || origNm.includes('비례')) {
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

// ⭐️ 국회 API 원본 자체의 역사적 오타/오류 보정 테이블
const HISTORICAL_DISTRICT_ERRATA = {
    '박지원_14': '전국구', // 국회 API가 14대를 목포로 잘못 적어둔 오류 100% 팩트 보정!
};

// ⭐️ 슬래시(/)로 연결된 역대 선거구를 대수와 1:1로 매칭하고 오류는 즉시 정제
function parseTermsDetails(gteltEraco, elecdNm, memberName) {
    const terms = parseElectedTerms(gteltEraco);
    const rawDistricts = elecdNm ? String(elecdNm).split('/').map(s => s.trim()) : [];

    return terms.map((t, idx) => {
        const errataKey = `${memberName}_${t}`;
        // 국회 API 오류가 있으면 올바른 팩트(전국구 등)를 우선 적용!
        const dist = HISTORICAL_DISTRICT_ERRATA[errataKey] || rawDistricts[idx] || rawDistricts[rawDistricts.length - 1] || '비례대표';
        const isProportional = dist.includes('비례') || dist.includes('전국구');
        return {
            term: t,
            district: dist,
            isProportional: isProportional
        };
    });
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

// 개별 행을 우리 Politician 객체로 변환
function rowToPolitician(row) {
    const currentDistrict = takeLatest(row.ELECD_NM);
    const { metroRegion, localRegion } = parseRegion(currentDistrict);
    const terms = parseElectedTerms(row.GTELT_ERACO);
    const termsDetails = parseTermsDetails(row.GTELT_ERACO, row.ELECD_NM, row.NAAS_NM);

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
            : normalizeParty(takeLatest(row.PLPT_NM), row.NAAS_NM),
        partyRole: PARTY_LEADERSHIP[row.NAAS_NM]?.role,
        partyRoleOrder: PARTY_LEADERSHIP[row.NAAS_NM]?.order,
        isAssemblyMember: true,
        electedTerms: terms,
        termsDetails: termsDetails, // ⭐️ 대수별 선거구 & 비례대표 팩트 데이터 보존
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
}

async function main() {
    const allRows = await fetchAllRows();
    console.log(`✅ 전체 ${allRows.length}건 수신 완료`);

    // ⭐️ 1. src/data/terms 폴더 자동 생성 (어지러움 방지 서브폴더)
    const termsDir = path.resolve('src/data/terms');
    if (!fs.existsSync(termsDir)) {
        fs.mkdirSync(termsDir, { recursive: true });
    }

    // ⭐️ 2. 제22대 현직 의원 필터링 및 생성
    const EXCLUDED_CODES = ['4A067125'];
    const currentRows = allRows.filter(
        (row) =>
            row.GTELT_ERACO &&
            row.GTELT_ERACO.includes('제22대') &&
            row.DTY_NM &&
            !EXCLUDED_CODES.includes(row.NAAS_CD)
    );

    const politicians = currentRows.map(rowToPolitician);

    // 손솔 의원 등 보충 추가
    const existingNames = new Set(politicians.map(p => p.name));
    for (const sup of SUPPLEMENTAL_MEMBERS) {
        if (!existingNames.has(sup.name)) {
            politicians.push({
                id: `supplemental-${sup.name}`,
                name: sup.name,
                hanjaName: '',
                birthDate: sup.birthDate || '',
                photoUrl: sup.photoUrl || '',
                level: 'NATIONAL',
                levelLabel: '국회의원',
                party: sup.party,
                isAssemblyMember: true,
                electedTerms: sup.electedTerms || [22],
                termsDetails: sup.termsDetails || [{ term: 22, district: '비례대표', isProportional: true }],
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

    // 원외 당직자 추가
    const nonMpEntries = NON_MP_PARTY_OFFICIALS.map((official, idx) => {
        const leadership = PARTY_LEADERSHIP[official.name];
        const histRow = allRows.find((row) => row.NAAS_NM === official.name);

        return {
            id: histRow?.NAAS_CD || `party-official-${idx}`,
            name: official.name,
            hanjaName: histRow?.NAAS_CH_NM || '',
            birthDate: histRow?.BIRDY_DT || '',
            photoUrl: official.photoUrl || toThumbnail(histRow?.NAAS_PIC),
            level: 'NATIONAL',
            levelLabel: '당직자',
            party: official.party,
            partyRole: leadership?.role,
            partyRoleOrder: leadership?.order,
            isAssemblyMember: false,
            electedTerms: histRow ? parseElectedTerms(histRow.GTELT_ERACO) : [],
            termsDetails: histRow ? parseTermsDetails(histRow.GTELT_ERACO, histRow.ELECD_NM) : [],
            metroRegion: '',
            localRegion: '',
            district: '',
            roleTitle: leadership?.role || '',
            committee: '',
            term: '',
            timesElected: histRow ? parseTimesElected(histRow.RLCT_DIV_NM) : 0,
            attendanceRate: 0,
            billsCount: 0,
            propertyAsset: 0,
            career: [],
            bills: [],
            pledges: [],
            contact: {},
        };
    });

    const final22ndPoliticians = [...politicians, ...nonMpEntries];

    // ⭐️ 3. 메인 politicians.json 및 term-22.json 저장
    fs.writeFileSync(path.resolve('src/data/politicians.json'), JSON.stringify(final22ndPoliticians, null, 2), 'utf-8');
    fs.writeFileSync(path.join(termsDir, 'term-22.json'), JSON.stringify(final22ndPoliticians, null, 2), 'utf-8');
    console.log(`✅ [제22대 국회] politicians.json 및 term-22.json 저장 완료 (${final22ndPoliticians.length}명)`);

    // ⭐️ 4. 제1대 ~ 제21대 과거 국회 아카이브 순수 타임캡슐 생성 (미래 데이터 100% 제거)
    for (let t = 21; t >= 1; t--) {
        const termStr = `제${t}대`;
        const pastRows = allRows.filter(r => r.GTELT_ERACO && r.GTELT_ERACO.includes(termStr));

        const pureSnapshotPoliticians = pastRows.map((row) => {
            const fullObj = rowToPolitician(row);

            // 해당 대수(t) 당시까지의 당선 대수만 필터링 (미래 대수 완전 삭제!)
            const validTerms = (fullObj.electedTerms || []).filter(termNum => termNum <= t);
            const validDetails = (fullObj.termsDetails || []).filter(d => d.term <= t);

            // 해당 대수 당시의 선거구
            const currentTermDetail = validDetails.find(d => d.term === t);
            const termDistrict = currentTermDetail ? currentTermDetail.district : fullObj.district;
            const { metroRegion, localRegion } = parseRegion(termDistrict);

            return {
                ...fullObj,
                term: `제${t}대`,
                timesElected: validTerms.length || 1, // 해당 대수 당시의 당선 횟수 (21대 김예지는 1선!)
                electedTerms: validTerms,            // 21대 파일에는 [21]만 보존!
                termsDetails: validDetails,
                district: termDistrict,              // 21대 당시 선거구
                metroRegion,
                localRegion,
                partyRole: undefined,                // 22대 직책 초기화
                partyRoleOrder: undefined,
            };
        });

        fs.writeFileSync(path.join(termsDir, `term-${t}.json`), JSON.stringify(pureSnapshotPoliticians, null, 2), 'utf-8');
    }
    console.log(`🏛️ [역대 국회 아카이브] src/data/terms/ 폴더에 term-1.json ~ term-21.json 분리 생성 완료!`);
}

main().catch(err => {
    console.error('❌ 실행 중 오류:', err);
    process.exit(1);
});