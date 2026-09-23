// ⭐️ 83개 채널 데이터베이스 (채널 식별 키워드 매칭)
const CHANNELS = [
    // [The Left / 좌파 - 31개]
    { camp: 'left', name: '[공식] 새날', match: ['새날'] },
    { camp: 'left', name: '[팟빵] 최욱의 매불쇼', match: ['매불쇼', '최욱'] },
    { camp: 'left', name: '1일0식', match: ['1일0식', 'zerosik'] },
    { camp: 'left', name: '강성범tv', match: ['강성범'] },
    { camp: 'left', name: '김두일tv', match: ['김두일'] },
    { camp: 'left', name: '김어준의 겸손은힘들다 뉴스공장', match: ['겸손은힘들다', '김어준', '뉴스공장'] },
    { camp: 'left', name: '김용민TV', match: ['김용민'] },
    { camp: 'left', name: '김진애TV', match: ['김진애'] },
    { camp: 'left', name: '노영희티비(영친이들)', match: ['노영희', '영친이'] },
    { camp: 'left', name: '뉴스토마토', match: ['뉴스토마토', 'newstomato'] },
    { camp: 'left', name: '뉴스한땀', match: ['뉴스한땀'] },
    { camp: 'left', name: '뉴탐사 NewTamsa', match: ['뉴탐사', 'newtamsa'] },
    { camp: 'left', name: '대안뉴스', match: ['대안뉴스'] },
    { camp: 'left', name: '띵굴TV', match: ['띵굴'] },
    { camp: 'left', name: '민주당티비 [더불어민주당]', match: ['민주당티비', '더불어민주당'] },
    { camp: 'left', name: '박순혁 우공이산TV', match: ['박순혁', '우공이산'] },
    { camp: 'left', name: '박시영TV', match: ['박시영'] },
    { camp: 'left', name: '봉지욱의 오프더레코드', match: ['봉지욱'] },
    { camp: 'left', name: '서울의소리 VoiceOfSeoul', match: ['서울의소리', 'voiceofseoul'] },
    { camp: 'left', name: '시사건건', match: ['시사건건'] },
    { camp: 'left', name: '시사의품격', match: ['시사의품격'] },
    { camp: 'left', name: '시사타파TV', match: ['시사타파'] },
    { camp: 'left', name: '신인규 박영식의 시방쇼', match: ['시방쇼'] },
    { camp: 'left', name: '신인규의 시대정신', match: ['시대정신', '신인규'] },
    { camp: 'left', name: '아고라', match: ['아고라', 'agorapb'] },
    { camp: 'left', name: '알리미 황희두', match: ['황희두'] },
    { camp: 'left', name: '여의도 옆 문래동', match: ['여의도 옆 문래동', '문래동'] },
    { camp: 'left', name: '열린공감TV', match: ['열린공감'] },
    { camp: 'left', name: '이동형TV', match: ['이동형'] },
    { camp: 'left', name: '이송원TV', match: ['이송원'] },
    { camp: 'left', name: '장르만 여의도', match: ['장르만 여의도', '장르만여의도'] },
    { camp: 'left', name: '장용진TV', match: ['장용진'] },
    { camp: 'left', name: '저널리스트', match: ['저널리스트'] },
    { camp: 'left', name: '최강욱TV', match: ['최강욱'] },
    { camp: 'left', name: '최한욱TV', match: ['최한욱'] },
    { camp: 'left', name: '헬마라이브', match: ['헬마라이브', '헬마'] },

    // [The Right / 우파 - 52개]
    { camp: 'right', name: '[민경욱 TV]', match: ['민경욱'] },
    { camp: 'right', name: '1waynews 한길뉴스', match: ['한길뉴스', '1waynews'] },
    { camp: 'right', name: '가로세로연구소', match: ['가로세로연구소', '가세연'] },
    { camp: 'right', name: '고성국TV', match: ['고성국'] },
    { camp: 'right', name: '국민의힘TV', match: ['국민의힘', 'peoplepowerparty'] },
    { camp: 'right', name: '김사랑작가tv', match: ['김사랑작가'] },
    { camp: 'right', name: '김태규TV', match: ['김태규'] },
    { camp: 'right', name: '뉴스엔진 정답은없다', match: ['뉴스엔진'] },
    { camp: 'right', name: '도련님열사 킬문tv4', match: ['킬문'] },
    { camp: 'right', name: '멸콩TV', match: ['멸콩'] },
    { camp: 'right', name: '문갑식의 진짜 TV', match: ['문갑식'] },
    { camp: 'right', name: '박민영TV', match: ['박민영'] },
    { camp: 'right', name: '박상규의 직설', match: ['박상규의 직설', '박상규의직설'] },
    { camp: 'right', name: '배승희 변호사', match: ['배승희'] },
    { camp: 'right', name: '변기클리닉', match: ['변희재', '변기클리닉'] },
    { camp: 'right', name: '성제준', match: ['성제준'] },
    { camp: 'right', name: '손상대TV2', match: ['손상대'] },
    { camp: 'right', name: '송국건의 혼술', match: ['송국건'] },
    { camp: 'right', name: '신의한수', match: ['신의한수'] },
    { camp: 'right', name: '양꾼TV', match: ['양꾼'] },
    { camp: 'right', name: '어벤저스전략회의', match: ['어벤저스전략회의', '어벤저스 전략회의'] },
    { camp: 'right', name: '원용석의 진실정치', match: ['원용석'] },
    { camp: 'right', name: '위풍당당이진숙', match: ['이진숙', '위풍당당이진숙'] },
    { camp: 'right', name: '유재일', match: ['유재일'] },
    { camp: 'right', name: '윤창중칼럼세상 TV', match: ['윤창중'] },
    { camp: 'right', name: '이병준TV', match: ['이병준'] },
    { camp: 'right', name: '이영돈TV', match: ['이영돈'] },
    { camp: 'right', name: '이영풍TV', match: ['이영풍'] },
    { camp: 'right', name: '이제봉교수', match: ['이제봉'] },
    { camp: 'right', name: '이춘근TV', match: ['이춘근'] },
    { camp: 'right', name: '인싸it', match: ['인싸it', '인싸IT'] },
    { camp: 'right', name: '자유대한호국단', match: ['자유대한호국단'] },
    { camp: 'right', name: '전여옥TV', match: ['전여옥'] },
    { camp: 'right', name: '젊은시각', match: ['젊은시각'] },
    { camp: 'right', name: '정법전TV', match: ['정법전'] },
    { camp: 'right', name: '정완진TV', match: ['정완진'] },
    { camp: 'right', name: '주진우의 이슈해설', match: ['주진우의 이슈해설', '주진우의이슈해설'] },
    { camp: 'right', name: '청년의소리TV', match: ['청년의소리'] },
    { camp: 'right', name: '최국튜브', match: ['최국'] },
    { camp: 'right', name: '펜앤마이크TV', match: ['펜앤마이크'] },
    { camp: 'right', name: '학소', match: ['학소'] },
    { camp: 'right', name: '한길록 Hangilog', match: ['한길록'] },
    { camp: 'right', name: '홍철기TV', match: ['홍철기'] },
    { camp: 'right', name: 'Bangmo뱅모', match: ['뱅모', 'Bangmo'] },
    { camp: 'right', name: 'BJ톨', match: ['BJ톨', 'bj톨'] },
    { camp: 'right', name: 'GROUND C 그라운드씨', match: ['그라운드씨', 'GROUND C'] },
    { camp: 'right', name: 'Korea Narrative Live', match: ['Korea Narrative', '코리아내러티브'] }
];

const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

export default async function handler(req: any, res: any) {
    // ⭐️ jamsil.uk 스타일 SWR 캐시:
    // 방문자는 0.05초 만에 즉시 보고, 백그라운드에서 60초마다 신선하게 자동 갱신
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    try {
        // 1. 유튜브 공식 API로 대한민국 실시간 라이브 & 정치 라이브 Top 목록을 초고속 수집 (단 0.3초)
        const urls = [
            `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&regionCode=KR&relevanceLanguage=ko&order=viewCount&maxResults=50&key=${API_KEY}`,
            `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&regionCode=KR&relevanceLanguage=ko&q=정치&order=viewCount&maxResults=50&key=${API_KEY}`
        ];

        const responses = await Promise.all(
            urls.map(url => fetch(url).then(r => r.json()).catch(() => ({ items: [] })))
        );

        // 검색된 모든 영상 추출 및 중복 제거
        const rawItems: any[] = [];
        const seenIds = new Set<string>();

        for (const resp of responses) {
            if (resp.items && Array.isArray(resp.items)) {
                for (const item of resp.items) {
                    const vId = item.id?.videoId;
                    if (vId && !seenIds.has(vId)) {
                        seenIds.add(vId);
                        rawItems.push(item);
                    }
                }
            }
        }

        if (rawItems.length === 0) {
            return res.status(200).json({ left: [], right: [], updatedAt: new Date().toISOString() });
        }

        // 2. 영상 ID들로 정확한 실시간 동시 시청자 수(concurrentViewers) 일괄 조회
        const videoIds = rawItems.map(it => it.id.videoId);
        const detailsMap: Record<string, { viewers: number; isLive: boolean }> = {};

        for (let i = 0; i < videoIds.length; i += 50) {
            const chunk = videoIds.slice(i, i + 50);
            try {
                const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${chunk.join(',')}&key=${API_KEY}`;
                const dRes = await fetch(detailUrl);
                const dData = await dRes.json();

                if (dData.items) {
                    for (const item of dData.items) {
                        const isLive = item.snippet?.liveBroadcastContent === 'live';
                        const viewers = item.liveStreamingDetails?.concurrentViewers
                            ? parseInt(item.liveStreamingDetails.concurrentViewers, 10)
                            : 0;

                        detailsMap[item.id] = { viewers, isLive };
                    }
                }
            } catch (err) { }
        }

        // 3. ⭐️ 영상 제목이 아닌 '채널 공식 이름(channelTitle)'으로 83개 채널과 100% 일치 판별
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const item of rawItems) {
            const videoId = item.id.videoId;
            const channelTitle = (item.snippet?.channelTitle || '').trim();
            const cleanChannelTitle = channelTitle.replace(/\s+/g, '').toLowerCase();

            const detail = detailsMap[videoId];
            // 방송이 진짜 생방송 중(live)이고 시청자 수가 1명 이상인 경우만 처리
            if (!detail || !detail.isLive || detail.viewers <= 0) continue;

            // 등록된 83개 채널 중 공식 채널 이름이 일치하는 채널 찾기
            const matchedChannel = CHANNELS.find(ch => {
                return ch.match.some(keyword => {
                    const cleanKeyword = keyword.replace(/\s+/g, '').toLowerCase();
                    return cleanChannelTitle.includes(cleanKeyword);
                });
            });

            if (matchedChannel) {
                const liveCard = {
                    channelName: matchedChannel.name,
                    title: item.snippet?.title || '',
                    viewers: detail.viewers,
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    liveUrl: `https://www.youtube.com/watch?v=${videoId}`,
                };

                const targetMap = matchedChannel.camp === 'left' ? leftMap : rightMap;
                // 같은 채널에서 여러 방송이 켜져도 시청자 수가 가장 높은 1개만 단일 노출
                if (!targetMap[matchedChannel.name] || liveCard.viewers > targetMap[matchedChannel.name].viewers) {
                    targetMap[matchedChannel.name] = liveCard;
                }
            }
        }

        // 시청자 순 랭킹 내림차순 정렬
        const leftList = Object.values(leftMap).sort((a: any, b: any) => b.viewers - a.viewers);
        const rightList = Object.values(rightMap).sort((a: any, b: any) => b.viewers - a.viewers);

        return res.status(200).json({
            left: leftList,
            right: rightList,
            updatedAt: new Date().toISOString(),
        });
    } catch (error: any) {
        return res.status(200).json({ left: [], right: [], error: error?.message || 'error' });
    }
}