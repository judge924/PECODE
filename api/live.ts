// ⭐️ 83개 채널 전체 내장 (외부 참조 없이 단독 실행)
const CHANNELS_DATABASE = [
    // [The Left / 좌파 - 31개]
    { camp: 'left', name: '[공식] 새날', url: 'https://youtube.com/@saenal' },
    { camp: 'left', name: '[팟빵] 최욱의 매불쇼', url: 'https://youtube.com/@maebulshow' },
    { camp: 'left', name: '1일0식', url: 'https://youtube.com/@zerosik82' },
    { camp: 'left', name: '강성범tv', url: 'https://youtube.com/@kangsungbumtv' },
    { camp: 'left', name: '김두일tv', url: 'https://youtube.com/@tv70' },
    { camp: 'left', name: '김어준의 겸손은힘들다 뉴스공장', url: 'https://youtube.com/@gyeomsonisnothing' },
    { camp: 'left', name: '김용민TV', url: 'https://youtube.com/@kimyongmintv' },
    { camp: 'left', name: '김진애TV', url: 'https://youtube.com/@tv-jkspacetime' },
    { camp: 'left', name: '노영희티비(영친이들)', url: 'https://youtube.com/@youngheefriends' },
    { camp: 'left', name: '뉴스토마토', url: 'https://youtube.com/@newstomatotv' },
    { camp: 'left', name: '뉴스한땀', url: 'https://youtube.com/@by_yoonk' },
    { camp: 'left', name: '뉴탐사 NewTamsa', url: 'https://youtube.com/@newtamsa' },
    { camp: 'left', name: '대안뉴스', url: 'https://youtube.com/@daeannews' },
    { camp: 'left', name: '띵굴TV', url: 'https://youtube.com/@mediagom' },
    { camp: 'left', name: '민주당티비 [더불어민주당]', url: 'https://youtube.com/@minjoodang_tv' },
    { camp: 'left', name: '박순혁 우공이산TV', url: 'https://youtube.com/@woogong2san' },
    { camp: 'left', name: '박시영TV', url: 'https://youtube.com/@parksiyoungtv' },
    { camp: 'left', name: '봉지욱의 오프더레코드', url: 'https://youtube.com/channel/UC9mEeE55q4PCfGERt_PNYbg' },
    { camp: 'left', name: '서울의소리 VoiceOfSeoul', url: 'https://youtube.com/channel/UCUxTPRSns--l5BX2537u7Rw' },
    { camp: 'left', name: '시사건건', url: 'https://youtube.com/@sisagungun' },
    { camp: 'left', name: '시사의품격', url: 'https://youtube.com/channel/UCv923HGDWMBrnHpC-dkQ3hQ' },
    { camp: 'left', name: '시사타파TV', url: 'https://youtube.com/@sisatapa_tv' },
    { camp: 'left', name: '신인규 박영식의 시방쇼', url: 'https://youtube.com/@sibangshow' },
    { camp: 'left', name: '신인규의 시대정신', url: 'https://youtube.com/@shininkyu' },
    { camp: 'left', name: '아고라', url: 'https://youtube.com/@agorapb' },
    { camp: 'left', name: '알리미 황희두', url: 'https://youtube.com/@heenimhwang' },
    { camp: 'left', name: '여의도 옆 문래동', url: 'https://youtube.com/channel/UC3cxhquPL-anKgzqj0ndzoA' },
    { camp: 'left', name: '열린공감TV', url: 'https://youtube.com/@openmindtv11' },
    { camp: 'left', name: '이동형TV', url: 'https://youtube.com/@dhleetv' },
    { camp: 'left', name: '이송원TV', url: 'https://youtube.com/@tv-og5md' },
    { camp: 'left', name: '장르만 여의도', url: 'https://youtube.com/@jtbcshow' },
    { camp: 'left', name: '장용진TV', url: 'https://youtube.com/@iskracoree' },
    { camp: 'left', name: '저널리스트', url: 'https://youtube.com/@k-journalist' },
    { camp: 'left', name: '최강욱TV', url: 'https://youtube.com/channel/UCxCIsoyPUWY_A_007CqdFXQ' },
    { camp: 'left', name: '최한욱TV', url: 'https://youtube.com/@tv-yc8no' },
    { camp: 'left', name: '헬마라이브', url: 'https://youtube.com/channel/UCyeVEuBHGDRZGt4krdMOhMA' },

    // [The Right / 우파 - 52개]
    { camp: 'right', name: '[민경욱 TV]', url: 'https://youtube.com/@mrminkyungwook' },
    { camp: 'right', name: '1waynews 한길뉴스', url: 'https://youtube.com/@1waynews-jhg' },
    { camp: 'right', name: '가로세로연구소', url: 'https://youtube.com/@hoverlab2018' },
    { camp: 'right', name: '고성국TV', url: 'https://youtube.com/channel/UCM8BcGB6BWKq3utIMhGKnUA' },
    { camp: 'right', name: '국민의힘TV', url: 'https://youtube.com/@peoplepowerparty_official' },
    { camp: 'right', name: '김사랑작가tv', url: 'https://youtube.com/channel/UCgq-iKvGbHbp8BuFW3vOfdA' },
    { camp: 'right', name: '김태규TV', url: 'https://youtube.com/@tv-jkspacetime' },
    { camp: 'right', name: '뉴스엔진 정답은없다', url: 'https://youtube.com/@news_engine' },
    { camp: 'right', name: '도련님열사 킬문tv4', url: 'https://youtube.com/@killmoontv4' },
    { camp: 'right', name: '멸콩TV', url: 'https://youtube.com/channel/UC2B0mR5Xc61GnYKDyvrXZoA' },
    { camp: 'right', name: '문갑식의 진짜 TV', url: 'https://youtube.com/@tv6435' },
    { camp: 'right', name: '박민영TV', url: 'https://youtube.com/channel/UCVUiHNWzFDptOY39UqRv5Sg' },
    { camp: 'right', name: '박상규의 직설', url: 'https://youtube.com/channel/UCdj_kd5oReDlStFJz3K199Q' },
    { camp: 'right', name: '배승희 변호사', url: 'https://youtube.com/@tatabuta' },
    { camp: 'right', name: '변기클리닉', url: 'https://youtube.com/channel/UCicqK3Kaq9bJONz76NofZRQ' },
    { camp: 'right', name: '성제준', url: 'https://youtube.com/@jaejunsung' },
    { camp: 'right', name: '손상대TV2', url: 'https://youtube.com/@ssdtv2' },
    { camp: 'right', name: '송국건의 혼술', url: 'https://youtube.com/@songkookkun' },
    { camp: 'right', name: '신의한수', url: 'https://youtube.com/@tubeshin' },
    { camp: 'right', name: '양꾼TV', url: 'https://youtube.com/channel/UCHp4tD5_cc-ZPzqclETjcTg' },
    { camp: 'right', name: '어벤저스전략회의', url: 'https://youtube.com/channel/UCXvQXTcC77Nav46NYc4FtDA' },
    { camp: 'right', name: '원용석의 진실정치', url: 'https://youtube.com/channel/UCGU6lvU0Tee-0ozr9vHx1vw' },
    { camp: 'right', name: '위풍당당이진숙', url: 'https://youtube.com/channel/UCOi03n0Y6KNUQ78dDFYj30w' },
    { camp: 'right', name: '유재일', url: 'https://youtube.com/@yooonlyone' },
    { camp: 'right', name: '윤창중칼럼세상 TV', url: 'https://youtube.com/@tv-vc2kz' },
    { camp: 'right', name: '이병준TV', url: 'https://youtube.com/channel/UCPjbP7CULcT2phHEOFR0-KQ' },
    { camp: 'right', name: '이영돈TV', url: 'https://youtube.com/@leeyoungdonpd' },
    { camp: 'right', name: '이영풍TV', url: 'https://youtube.com/@poong_tv' },
    { camp: 'right', name: '이제봉교수', url: 'https://youtube.com/@jebonglee' },
    { camp: 'right', name: '이춘근TV', url: 'https://youtube.com/@tv-yg8lb' },
    { camp: 'right', name: '인싸it', url: 'https://youtube.com/@inssait' },
    { camp: 'right', name: '자유대한호국단', url: 'https://youtube.com/channel/UCHhaI0NOFQLF2GQr1gZ5_Sg' },
    { camp: 'right', name: '전여옥TV', url: 'https://youtube.com/@yuok419' },
    { camp: 'right', name: '젊은시각', url: 'https://youtube.com/@redoutt' },
    { camp: 'right', name: '정법전TV', url: 'https://youtube.com/@chung-bubjeon' },
    { camp: 'right', name: '정완진TV', url: 'https://youtube.com/channel/UCGF6SQDqskBZXubOiHiuq8Q' },
    { camp: 'right', name: '주진우의 이슈해설', url: 'https://youtube.com/@joojjinwoo' },
    { camp: 'right', name: '청년의소리TV', url: 'https://youtube.com/channel/UCRauacStmSDCZdMwrGshMGw' },
    { camp: 'right', name: '최국튜브', url: 'https://youtube.com/@user-choijune511' },
    { camp: 'right', name: '펜앤마이크TV', url: 'https://youtube.com/@penn1tv' },
    { camp: 'right', name: '학소', url: 'https://youtube.com/channel/UCmM7_1uOjGVVPL1nrfongjw' },
    { camp: 'right', name: '한길록 Hangilog', url: 'https://youtube.com/@hangilog' },
    { camp: 'right', name: '홍철기TV', url: 'https://youtube.com/@hongtv' },
    { camp: 'right', name: 'Bangmo뱅모', url: 'https://youtube.com/@bangmo7' },
    { camp: 'right', name: 'BJ톨', url: 'https://youtube.com/@bjtol' },
    { camp: 'right', name: 'GROUND C 그라운드씨', url: 'https://youtube.com/@groundc' },
    { camp: 'right', name: 'Korea Narrative Live', url: 'https://youtube.com/channel/UC2vZ-y5LAIaqJt5aIp9o-Tg' }
];

const API_KEY = "AIzaSyAziLfeAgAV628fdd28i1cfr_SrA5PlW94";

export default async function handler(req: any, res: any) {
    // ⭐️ 30초 동안 Vercel 엣지 캐시 적용: 두 번째 요청부터 0.01초 만에 즉시 반환
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=15');

    try {
        // 1. 83개 채널을 병렬로 초고속 스캔
        const scanPromises = CHANNELS_DATABASE.map(async (ch) => {
            try {
                const cleanBase = ch.url.split('?')[0].replace(/\/live\/?$/, '').replace(/\/$/, '');
                const liveUrl = cleanBase + '/live';

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5초 제한

                const response = await fetch(liveUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
                        'Cookie': 'CONSENT=YES+1; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiAo_CLBg',
                    },
                    redirect: 'follow',
                });
                clearTimeout(timeoutId);

                const html = await response.text();
                const finalUrl = response.url || '';

                // ⭐️ 리다이렉트된 최종 URL 또는 HTML 안에서 영상 ID 추출
                const videoIdMatch =
                    finalUrl.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/) ||
                    html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/) ||
                    html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);

                const videoId = videoIdMatch ? videoIdMatch[1] : '';

                // ⭐️ 라이브 여부 정밀 판별
                const isLive =
                    finalUrl.includes('/watch?v=') ||
                    html.includes('"isLive":true') ||
                    html.includes('"isLive": true') ||
                    html.includes('watching') ||
                    html.includes('시청 중');

                // HTML 보조 제목 및 시청자 추출
                let fallbackViewers = 0;
                const cvMatch = html.match(/"concurrentViewers":\s*"*([0-9]+)"*/);
                if (cvMatch && cvMatch[1]) {
                    fallbackViewers = parseInt(cvMatch[1], 10);
                }

                const titleMatch = html.match(/<title>(.*?)<\/title>/i);
                const fallbackTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : '';

                if (videoId && isLive) {
                    return {
                        ...ch,
                        videoId,
                        fallbackViewers,
                        fallbackTitle,
                    };
                }
            } catch (e) { }
            return null;
        });

        const detected = (await Promise.all(scanPromises)).filter(Boolean) as Array<{
            camp: string;
            name: string;
            url: string;
            videoId: string;
            fallbackViewers: number;
            fallbackTitle: string;
        }>;

        const videoIds = Array.from(new Set(detected.map((d) => d.videoId)));
        const detailsMap: Record<string, { viewers: number; title: string }> = {};

        // 2. 유튜브 공식 API로 시청자수 및 제목 조회
        if (videoIds.length > 0) {
            for (let i = 0; i < videoIds.length; i += 50) {
                const chunk = videoIds.slice(i, i + 50);
                try {
                    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${chunk.join(',')}&key=${API_KEY}`;
                    const apiRes = await fetch(apiUrl);
                    const apiData = await apiRes.json();

                    if (apiData.items) {
                        for (const item of apiData.items) {
                            const isUpcoming = item.snippet?.liveBroadcastContent === 'upcoming';
                            let viewers = 0;
                            if (!isUpcoming && item.liveStreamingDetails?.concurrentViewers) {
                                viewers = parseInt(item.liveStreamingDetails.concurrentViewers, 10);
                            }
                            detailsMap[item.id] = {
                                viewers,
                                title: item.snippet?.title || '',
                            };
                        }
                    }
                } catch (err) { }
            }
        }

        // 3. 진영별 분류 및 0명 제외
        const leftMap: Record<string, any> = {};
        const rightMap: Record<string, any> = {};

        for (const d of detected) {
            const details = detailsMap[d.videoId] || { viewers: d.fallbackViewers || 0, title: d.fallbackTitle || '' };
            const finalViewers = details.viewers || d.fallbackViewers || 0;

            // ⭐️ 시청자 수 1명 이상인 생방송만 수록 (주진우 등)
            if (finalViewers > 0) {
                const item = {
                    channelName: d.name,
                    title: details.title || d.fallbackTitle,
                    viewers: finalViewers,
                    thumbnail: `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`,
                    liveUrl: `https://www.youtube.com/watch?v=${d.videoId}`,
                };
                const targetMap = d.camp === 'left' ? leftMap : rightMap;
                if (!targetMap[d.name] || item.viewers > targetMap[d.name].viewers) {
                    targetMap[d.name] = item;
                }
            }
        }

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