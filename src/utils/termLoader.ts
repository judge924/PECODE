// src/utils/termLoader.ts
// 폴더 내 term-*.json 파일들을 자동으로 탐색하는 동적 엔진입니다.
const termFiles = import.meta.glob<{ default: any }>('/src/data/terms/term-*.json');
const termCache = new Map<number, any>();

/**
 * 폴더에 실제 존재하는 국회 대수 목록을 내림차순 숫자 배열로 반환합니다.
 * 예: [22, 21, 20, ..., 1]
 */
export function getAvailableTerms(): number[] {
    const terms: number[] = [];
    for (const path in termFiles) {
        const match = path.match(/term-(\d+)\.json$/);
        if (match && match[1]) {
            terms.push(Number(match[1]));
        }
    }
    // 기본적으로 22대부터 과거 순서대로 내림차순 정렬
    if (terms.length === 0) return [22]; // 파일이 아직 없을 경우의 안전장치
    return terms.sort((a, b) => b - a);
}

/**
 * 선택한 대수의 JSON 데이터를 로드합니다 (메모리 캐싱 적용)
 */
export async function loadTermData(termNumber: number): Promise<any | null> {
    if (termCache.has(termNumber)) {
        return termCache.get(termNumber);
    }

    const targetPath = `/src/data/terms/term-${termNumber}.json`;
    const fileImporter = termFiles[targetPath];

    if (!fileImporter) {
        console.warn(`[PECODE] 제${termNumber}대 국회 데이터 파일(${targetPath})이 없습니다.`);
        return null;
    }

    try {
        const module = await fileImporter();
        const data = module.default || module;
        termCache.set(termNumber, data);
        return data;
    } catch (error) {
        console.error(`[PECODE] 제${termNumber}대 데이터 로딩 실패:`, error);
        return null;
    }
}