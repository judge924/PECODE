import fs from 'fs';
import path from 'path';

const API_KEY = process.env.ASSEMBLY_API_KEY;
const SERVICE_ID = 'ALLNAMEMBER'; // 공식 명세서 기준 서비스 ID (사진 포함!)
const BASE_URL = `https://open.assembly.go.kr/portal/openapi/${SERVICE_ID}`;

if (!API_KEY) {
    console.error('❌ ASSEMBLY_API_KEY가 없습니다. .env 파일을 확인해주세요.');
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

    // ── 진단용: 같은 지역구에 2명 이상 잡히는 경우 찾기 ──
    const districtMap = {};
    for (const row of currentRows) {
        const district = takeLatest(row.ELECD_NM);
        if (district === '비례대표') continue; // 비례대표는 여러 명 있는 게 정상
        if (!districtMap[district]) districtMap[district] = [];
        districtMap[district].push(row);
    }
    for (const [district, members] of Object.entries(districtMap)) {
        if (members.length > 1) {
            console.log(`\n⚠️ 지역구 중복 발견: "${district}"`);
            members.forEach((m) => {
                console.log(
                    `   - ${m.NAAS_NM} (${m.NAAS_CD}) / 정당: ${m.PLPT_NM} / 당선대수: ${m.GTELT_ERACO} / 직책: ${m.DTY_NM}`
                );
            });
        }
    }

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

    const outputPath = path.resolve('src/data/politicians.json');
    fs.writeFileSync(outputPath, JSON.stringify(politicians, null, 2), 'utf-8');
    console.log(`🎉 완료! ${politicians.length}명의 국회의원 데이터(사진 포함)를 저장했습니다.`);
}

main().catch((err) => {
    console.error('❌ 실행 중 오류:', err);
    process.exit(1);
});